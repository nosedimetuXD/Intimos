import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Music, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Lock, 
  Flame, 
  Download, 
  Award, 
  Sparkles,
  HeartHandshake
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { centralApi } from '../../api'
import { Card, Avatar, Empty, Modal, Btn, LevelBadge } from '../ui'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
      <Icon size={14} className="text-muted mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  )
}

function MemberDetail({ user, onNoteSaved }) {
  const { isPastoral } = useAuth()
  const [editNote, setEditNote] = useState(false)
  const [note, setNote] = useState(user.notes || '')
  const [savingNote, setSavingNote] = useState(false)
  const [showExtra, setShowExtra] = useState(false)

  const handleSaveNote = async () => {
    setSavingNote(true)
    try {
      await centralApi.updateUserNotes(user.id, note)
      if (onNoteSaved) onNoteSaved(user.id, note)
      setEditNote(false)
    } catch (err) {
      alert(err.message || 'Error al guardar nota')
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={user.photo} name={user.full_name} size="xl" />
          <div className="absolute -bottom-1 -right-1">
            <LevelBadge level={user.level || 1} size="sm" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-text-primary text-lg leading-tight truncate">{user.full_name}</h2>
          <p className="text-xs text-muted truncate">{user.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-light border border-accent/25 capitalize font-semibold">
              {user.role || 'Miembro'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 bg-card2 rounded-xl text-center border border-border">
          <p className="text-base font-black text-accent-light">{user.points_month || 0}</p>
          <p className="text-[10px] text-muted font-medium">pts mes</p>
        </div>
        <div className="p-2.5 bg-card2 rounded-xl text-center border border-border">
          <p className="text-base font-black text-text-primary">{user.total_points || 0}</p>
          <p className="text-[10px] text-muted font-medium">acumulados</p>
        </div>
        <div className="p-2.5 bg-card2 rounded-xl text-center border border-border">
          <div className="flex items-center justify-center gap-1">
            <Flame size={14} className="text-orange-400" />
            <p className="text-base font-black text-orange-400">{user.streak || 0}</p>
          </div>
          <p className="text-[10px] text-muted font-medium">racha cultos</p>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-card2 rounded-xl px-3 py-1 border border-border">
        <InfoRow icon={Phone} label="Teléfono" value={user.phone} />
        <InfoRow icon={MapPin} label="Dirección / Barrio" value={user.address} />
        <InfoRow icon={Briefcase} label="Profesión / Ocupación" value={user.profession} />
        <InfoRow icon={Music} label="Habilidad / Instrumento" value={user.skills} />
      </div>

      {/* More info toggle */}
      <button
        onClick={() => setShowExtra(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-card2 hover:bg-card text-xs text-text-secondary transition-colors border border-border"
      >
        <Info size={14} className="text-accent-light" />
        <span className="flex-1 text-left font-medium">Más información del miembro</span>
        {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showExtra && (
        <div className="bg-card2 rounded-xl px-3 py-1 border border-border space-y-1">
          <InfoRow icon={Users} label="Mamá" value={user.mom} />
          <InfoRow icon={Users} label="Papá" value={user.dad} />
          <div className="py-2 border-b border-border last:border-0">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Fecha de Nacimiento</p>
            <p className="text-xs text-text-primary">{user.birthdate || 'No registrada'}</p>
          </div>
          <div className="py-2 last:border-0">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Miembro desde</p>
            <p className="text-xs text-text-primary">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Notes (pastoral only) */}
      {isPastoral && (
        <div className="bg-card2 p-3 rounded-xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Lock size={12} className="text-amber-400" />
              <span>Nota Pastoral Privada</span>
            </div>
            <button 
              onClick={() => setEditNote(!editNote)} 
              className="text-xs text-accent-light hover:underline font-medium"
            >
              {editNote ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {editNote ? (
            <div className="space-y-2">
              <textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                rows={3} 
                className="w-full text-xs resize-none" 
                placeholder="Observaciones de seguimiento, visitas o peticiones..."
              />
              <Btn size="sm" onClick={handleSaveNote} disabled={savingNote}>
                {savingNote ? 'Guardando...' : 'Guardar nota'}
              </Btn>
            </div>
          ) : (
            <p className="text-xs text-text-secondary italic">
              {user.notes || 'Sin notas registradas para este miembro.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function Directory() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    centralApi.getUsers()
      .then(res => setUsers(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadCsv = () => {
    centralApi.getDirectoryCsv()
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `directorio-intimos-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch(err => alert(err.message || 'Error al exportar CSV'))
  }

  const handleNoteSaved = (userId, newNote) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, notes: newNote } : u))
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => ({ ...prev, notes: newNote }))
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = 
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Directorio de Miembros</h1>
          <p className="text-xs text-muted">Base de datos de contactos y jóvenes del grupo</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn size="sm" variant="secondary" onClick={handleDownloadCsv}>
            <Download size={14} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Btn>
          <span className="text-xs font-bold text-accent-light bg-accent/15 px-3 py-1 rounded-full border border-accent/25">
            {users.length} miembros
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[['all', 'Todos'], ['miembro', 'Miembros'], ['apoyo', 'Apoyo'], ['pastoral', 'Pastoral']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRoleFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                roleFilter === val
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-muted border border-border hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando directorio...</div>
      ) : filtered.length === 0 ? (
        <Empty icon={Users} title="Sin resultados" subtitle="No se encontraron miembros con ese criterio de búsqueda." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(u => (
            <Card 
              key={u.id} 
              className="space-y-2.5 cursor-pointer hover:border-accent/40 transition-all active:scale-[0.99]"
              onClick={() => setSelectedUser(u)}
            >
              <div className="flex items-start gap-3">
                <Avatar src={u.photo} name={u.full_name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-text-primary text-xs sm:text-sm truncate">{u.full_name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-light capitalize flex-shrink-0">
                      {u.role}
                    </span>
                  </div>

                  <p className="text-xs text-muted flex items-center gap-1.5 mt-1 truncate">
                    <Mail size={12} />
                    <span>{u.email}</span>
                  </p>

                  {u.phone ? (
                    <a 
                      href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone size={12} />
                      <span>{u.phone}</span>
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted/60 mt-0.5">Sin teléfono registrado</p>
                  )}

                  {(u.profession || u.skills) && (
                    <p className="text-[11px] text-text-secondary truncate mt-1">
                      {[u.profession, u.skills].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      <Modal 
        open={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        title={selectedUser?.full_name || 'Detalle del Miembro'}
        size="lg"
      >
        {selectedUser && (
          <MemberDetail user={selectedUser} onNoteSaved={handleNoteSaved} />
        )}
      </Modal>
    </div>
  )
}
