import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { servicesApi, centralApi, pointsApi } from '../api'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Plus, 
  Sparkles,
  Search,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Btn } from '../components/ui'

export default function CentralHome() {
  const { currentUser, isPastoral, canManageUsers } = useAuth()
  const [tab, setTab] = useState('services')
  
  // Data states
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(false)

  // Forms
  const [newServiceTitle, setNewServiceTitle] = useState('')
  const [newServiceDate, setNewServiceDate] = useState('')
  const [newServiceLocation, setNewServiceLocation] = useState('')
  
  // Points adjustment
  const [targetUserId, setTargetUserId] = useState('')
  const [adjustPointsVal, setAdjustPointsVal] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustMsg, setAdjustMsg] = useState('')

  useEffect(() => {
    loadServices()
    if (canManageUsers) loadUsers()
  }, [tab])

  const loadServices = async () => {
    try {
      const data = await servicesApi.list()
      setServices(data || [])
      if (data && data.length > 0 && !selectedService) {
        setSelectedService(data[0])
        loadAttendance(data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadAttendance = async (serviceId) => {
    try {
      const data = await servicesApi.getAttendance(serviceId)
      setAttendances(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await centralApi.getUsers()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    if (!newServiceTitle || !newServiceDate) return
    try {
      await servicesApi.create({
        title: newServiceTitle,
        scheduled_at: new Date(newServiceDate).toISOString(),
        location: newServiceLocation || 'Templo Principal',
      })
      setNewServiceTitle('')
      setNewServiceDate('')
      setNewServiceLocation('')
      loadServices()
      alert('¡Servicio creado exitosamente!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAdjustPoints = async (e) => {
    e.preventDefault()
    setAdjustMsg('')
    try {
      await pointsApi.adjust(targetUserId, parseInt(adjustPointsVal), adjustReason)
      setAdjustMsg('¡Puntos asignados exitosamente!')
      setAdjustPointsVal('')
      setAdjustReason('')
    } catch (err) {
      setAdjustMsg(`Error: ${err.message}`)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center font-bold text-accent-light">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-text-primary">Central de Liderazgo</h1>
          <p className="text-xs text-muted">Gestión de servicios, asistencia y puntos del ministerio</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setTab('services')}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
            tab === 'services' ? 'bg-accent text-white shadow-md shadow-accent/25' : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          📅 Servicios y Asistencia
        </button>
        <button
          onClick={() => setTab('points')}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
            tab === 'points' ? 'bg-accent text-white shadow-md shadow-accent/25' : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          ⭐ Asignar Puntos
        </button>
        {canManageUsers && (
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              tab === 'users' ? 'bg-accent text-white shadow-md shadow-accent/25' : 'bg-card text-muted border border-border hover:text-text-primary'
            }`}
          >
            👥 Usuarios ({users.length})
          </button>
        )}
      </div>

      {/* Tab: Services & Attendance */}
      {tab === 'services' && (
        <div className="space-y-4">
          {/* Create Service Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Plus size={15} className="text-accent-light" />
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Crear Nuevo Encuentro
              </h2>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Título del servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Noche de Conexión y Adoración"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    required
                    value={newServiceDate}
                    onChange={(e) => setNewServiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Lugar</label>
                  <input
                    type="text"
                    placeholder="Ej. Auditorio Principal"
                    value={newServiceLocation}
                    onChange={(e) => setNewServiceLocation(e.target.value)}
                  />
                </div>
              </div>

              <Btn type="submit" fullWidth>
                Publicar Servicio
              </Btn>
            </form>
          </Card>

          {/* List Services & Select Attendance */}
          <Card>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Servicios Registrados
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); loadAttendance(s.id); }}
                  className={`p-3 rounded-2xl border text-left min-w-[190px] shrink-0 transition-all ${
                    selectedService?.id === s.id
                      ? 'bg-accent/15 border-accent text-accent-light shadow-md'
                      : 'bg-card2 border-border text-text-primary hover:border-accent/40'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{s.title}</p>
                  <p className="text-[10px] text-muted mt-1">
                    {format(new Date(s.scheduled_at), "d MMM · h:mm a", { locale: es })}
                  </p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-2 inline-block border ${
                    s.status === 'upcoming' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                      : 'bg-card text-muted border-border'
                  }`}>
                    {s.status}
                  </span>
                </button>
              ))}
            </div>

            {selectedService && (
              <div className="pt-4 mt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary">
                    Asistencias en "{selectedService.title}" ({attendances.length})
                  </h3>
                  <span className="text-[10px] text-muted font-mono bg-card2 px-2 py-0.5 rounded-lg border border-border">
                    QR: {selectedService.qr_token.slice(0, 8)}...
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendances.length === 0 ? (
                    <p className="text-xs text-muted py-4 text-center">Nadie ha hecho check-in en este servicio aún.</p>
                  ) : (
                    attendances.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border text-xs">
                        <div>
                          <p className="font-bold text-text-primary">{a.user_name}</p>
                          <p className="text-[10px] text-muted">
                            {format(new Date(a.check_in_time), "h:mm:ss a")} {a.is_early && <span className="text-emerald-400 font-semibold">(Temprano +75)</span>}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar esta asistencia?')) {
                              await servicesApi.deleteAttendance(selectedService.id, a.id)
                              loadAttendance(selectedService.id)
                            }
                          }}
                          className="p-1.5 rounded-lg text-muted hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Points Manual Adjustment */}
      {tab === 'points' && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-amber-400" />
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Asignar o Corregir Puntos
            </h2>
          </div>

          {adjustMsg && (
            <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold mb-3">
              {adjustMsg}
            </div>
          )}

          <form onSubmit={handleAdjustPoints} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Seleccionar Joven</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
              >
                <option value="">-- Selecciona un usuario --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Puntos a otorgar o descontar (ej. 50 o -20)</label>
              <input
                type="number"
                required
                placeholder="Cantidad de puntos"
                value={adjustPointsVal}
                onChange={(e) => setAdjustPointsVal(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Motivo del ajuste</label>
              <input
                type="text"
                required
                placeholder="Motivo (ej. Participación especial, dinámica)"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>

            <Btn type="submit" fullWidth>
              Registrar Puntos
            </Btn>
          </form>
        </Card>
      )}

      {/* Tab: Users Management */}
      {tab === 'users' && canManageUsers && (
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Directorio de Usuarios ({users.length})
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border text-xs">
                <div>
                  <h4 className="font-bold text-text-primary">{u.full_name}</h4>
                  <p className="text-[10px] text-muted">{u.email} {u.phone ? `· ${u.phone}` : ''}</p>
                </div>
                <span className="text-[10px] font-bold bg-accent/15 text-accent-light border border-accent/25 px-2.5 py-0.5 rounded-full capitalize">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
