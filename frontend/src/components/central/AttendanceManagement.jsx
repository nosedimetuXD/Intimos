import React, { useState, useEffect } from 'react'
import { CheckSquare, Calendar, Clock, Sparkles, Trash2, UserPlus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { servicesApi, centralApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function AttendanceManagement() {
  const [services, setServices] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [attendances, setAttendances] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualUserId, setManualUserId] = useState('')

  useEffect(() => {
    Promise.all([
      servicesApi.list().catch(() => []),
      centralApi.getUsers().catch(() => [])
    ]).then(([sList, uList]) => {
      setServices(sList || [])
      setUsers(uList || [])
      if (sList && sList.length > 0) {
        setSelectedServiceId(sList[0].id)
      }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedServiceId) return
    servicesApi.getAttendance(selectedServiceId)
      .then(res => setAttendances(res || []))
      .catch(() => setAttendances([]))
  }, [selectedServiceId])

  const handleDelete = async (attId) => {
    if (!confirm('¿Eliminar esta asistencia? Se revertirán los puntos.')) return
    try {
      await servicesApi.deleteAttendance(selectedServiceId, attId)
      setAttendances(prev => prev.filter(a => a.id !== attId))
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const handleManualCheckIn = async (e) => {
    e.preventDefault()
    if (!manualUserId || !selectedServiceId) return
    try {
      const selectedUser = users.find(u => u.id === manualUserId)
      await servicesApi.checkIn(selectedServiceId, 'MANUAL_OVERRIDE')
      alert(`Asistencia registrada para ${selectedUser?.full_name || 'usuario'}`)
      setShowManualModal(false)
      setManualUserId('')
      servicesApi.getAttendance(selectedServiceId).then(res => setAttendances(res || []))
    } catch (err) {
      alert(err.message || 'Error al registrar')
    }
  }

  const selectedService = services.find(s => s.id === selectedServiceId)

  const filteredAttendances = attendances.filter(a =>
    (a.user_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const earlyCount = attendances.filter(a => a.is_early).length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Control de Asistencia</h1>
          <p className="text-xs text-muted">Auditoría en vivo de check-ins y puntualidad</p>
        </div>
        <Btn onClick={() => setShowManualModal(true)} size="sm">
          <UserPlus size={15} />
          <span>Check-in Manual</span>
        </Btn>
      </div>

      {/* Service selector */}
      <div className="flex gap-2">
        <select
          value={selectedServiceId}
          onChange={e => setSelectedServiceId(e.target.value)}
          className="flex-1 text-xs font-bold"
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.title} ({format(new Date(s.scheduled_at), "d 'de' MMMM", { locale: es })})
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Asistentes</p>
          <p className="text-xl font-black text-accent-light mt-0.5">{attendances.length}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Puntuales (+75 pts)</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{earlyCount}</p>
        </Card>
        <Card className="text-center p-3 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Puntos Concedidos</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{(attendances.length * 300) + (earlyCount * 75)}</p>
        </Card>
      </div>

      {/* Search and List */}
      <Card className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre de asistente..."
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAttendances.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No hay asistencias registradas aún.</p>
          ) : (
            filteredAttendances.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border text-xs">
                <div>
                  <p className="font-bold text-text-primary">{a.user_name}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {format(new Date(a.check_in_time), "h:mm:ss a")}
                    {a.is_early && (
                      <span className="ml-2 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Puntual (+75)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400 transition-colors"
                  title="Eliminar asistencia"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal Manual Check-in */}
      <Modal open={showManualModal} onClose={() => setShowManualModal(false)} title="Registrar Check-in Manual">
        <form onSubmit={handleManualCheckIn} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Seleccionar Miembro</label>
            <select
              required
              value={manualUserId}
              onChange={e => setManualUserId(e.target.value)}
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!manualUserId}>
              Confirmar Asistencia
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
