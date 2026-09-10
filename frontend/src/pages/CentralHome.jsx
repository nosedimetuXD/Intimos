import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { servicesApi, centralApi, pointsApi } from '../api'
import { 
  ShieldAlert, 
  Calendar, 
  Users, 
  Plus, 
  CheckCircle2, 
  DollarSign, 
  Megaphone, 
  Sparkles,
  Search,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CentralHome() {
  const { currentUser, isPastoral, canManageUsers } = useAuth()
  const [tab, setTab] = useState('services') // services, users, points, camp, finances, announcements
  
  // Data states
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [campPayments, setCampPayments] = useState([])
  const [finances, setFinances] = useState([])
  const [loading, setLoading] = useState(false)

  // Modals / forms
  const [newServiceTitle, setNewServiceTitle] = useState('')
  const [newServiceDate, setNewServiceDate] = useState('')
  const [newServiceLocation, setNewServiceLocation] = useState('')
  
  // Points adjust
  const [targetUserId, setTargetUserId] = useState('')
  const [adjustPointsVal, setAdjustPointsVal] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustMsg, setAdjustMsg] = useState('')

  useEffect(() => {
    loadServices()
    if (canManageUsers) loadUsers()
    if (isPastoral) {
      loadCamp()
      loadFinances()
    }
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

  const loadCamp = async () => {
    try {
      const data = await centralApi.getCampPayments()
      setCampPayments(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const loadFinances = async () => {
    try {
      const data = await centralApi.getFinances()
      setFinances(data || [])
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">Central de Liderazgo</h1>
            <p className="text-[11px] text-slate-400">Gestión de servicios, asistencia y ministerio</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setTab('services')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
            tab === 'services' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Servicios y Asistencia
        </button>
        <button
          onClick={() => setTab('points')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
            tab === 'points' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Asignar Puntos
        </button>
        {canManageUsers && (
          <button
            onClick={() => setTab('users')}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
              tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Usuarios ({users.length})
          </button>
        )}
        {isPastoral && (
          <>
            <button
              onClick={() => setTab('camp')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                tab === 'camp' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Campamento
            </button>
            <button
              onClick={() => setTab('finances')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                tab === 'finances' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Finanzas
            </button>
          </>
        )}
      </div>

      {/* Tab: Services & Attendance */}
      {tab === 'services' && (
        <div className="space-y-5">
          {/* Create Service Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Crear Nuevo Servicio
            </h3>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Título del servicio (ej. Noche de Conexión)"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  required
                  value={newServiceDate}
                  onChange={(e) => setNewServiceDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Lugar (ej. Templo Principal)"
                  value={newServiceLocation}
                  onChange={(e) => setNewServiceLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Publicar Servicio
              </button>
            </form>
          </div>

          {/* List Services & Select Attendance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Servicios Registrados
            </h3>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); loadAttendance(s.id); }}
                  className={`p-3 rounded-2xl border text-left min-w-[180px] shrink-0 transition-all ${
                    selectedService?.id === s.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-bold truncate">{s.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {format(new Date(s.scheduled_at), "d MMM · h:mm a", { locale: es })}
                  </p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-2 inline-block ${
                    s.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.status}
                  </span>
                </button>
              ))}
            </div>

            {selectedService && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    Asistencias en "{selectedService.title}" ({attendances.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Token QR: <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300">{selectedService.qr_token.slice(0, 8)}...</code>
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {attendances.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Nadie ha hecho check-in en este servicio aún.</p>
                  ) : (
                    attendances.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                        <div>
                          <p className="font-bold text-white">{a.user_name}</p>
                          <p className="text-[10px] text-slate-400">
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Points Manual Adjustment */}
      {tab === 'points' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Asignar o Corregir Puntos
          </h3>

          {adjustMsg && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              {adjustMsg}
            </div>
          )}

          <form onSubmit={handleAdjustPoints} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Seleccionar Joven</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Selecciona un usuario --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Puntos a otorgar o descontar (ej. 50 o -20)</label>
              <input
                type="number"
                required
                placeholder="Cantidad de puntos"
                value={adjustPointsVal}
                onChange={(e) => setAdjustPointsVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Motivo (Obligatorio para auditoría)</label>
              <input
                type="text"
                required
                placeholder="Motivo del ajuste"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              Registrar Puntos en Ledger
            </button>
          </form>
        </div>
      )}

      {/* Tab: Users Management */}
      {tab === 'users' && canManageUsers && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Directorio de Usuarios ({users.length})
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <h4 className="font-bold text-white">{u.full_name}</h4>
                  <p className="text-[10px] text-slate-400">{u.email} · {u.phone || 'Sin cel'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full capitalize">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
