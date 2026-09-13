import React, { useState, useEffect } from 'react'
import { Gift, Calendar, Phone, MessageCircle, Edit2, Sparkles, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { centralApi } from '../../api'
import { Card, Avatar, Empty, Modal, Btn } from '../ui'

function getAge(birthdate) {
  if (!birthdate) return null
  const diff = Date.now() - new Date(birthdate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function isBirthdayThisWeek(birthdate) {
  if (!birthdate) return false
  const now = new Date()
  const b = new Date(birthdate)
  b.setFullYear(now.getFullYear())
  const diffDays = (b - now) / (1000 * 60 * 60 * 24)
  return diffDays >= -1 && diffDays <= 7
}

export default function BirthdaysManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [birthdateInput, setBirthdateInput] = useState('')
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      const list = await centralApi.getUsers()
      setUsers(list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setBirthdateInput(user.birthdate || '')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    setSaving(true)
    try {
      await centralApi.updateUserProfile(editingUser.id, { birthdate: birthdateInput })
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, birthdate: birthdateInput } : u))
      setEditingUser(null)
    } catch (err) {
      alert(err.message || 'Error al actualizar fecha de nacimiento')
    } finally {
      setSaving(false)
    }
  }

  const allWithBirthdays = users
    .filter(u => u.birthdate)
    .sort((a, b) => {
      try {
        const ma = parseISO(a.birthdate).getMonth()
        const da = parseISO(a.birthdate).getDate()
        const mb = parseISO(b.birthdate).getMonth()
        const db = parseISO(b.birthdate).getDate()
        return ma !== mb ? ma - mb : da - db
      } catch {
        return 0
      }
    })

  const thisWeek = allWithBirthdays.filter(u => isBirthdayThisWeek(u.birthdate))
  const withoutBirthdays = users.filter(u => !u.birthdate)
  const months = [...new Set(allWithBirthdays.map(u => parseISO(u.birthdate).getMonth()))]

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Cumpleaños del Grupo</h1>
          <p className="text-xs text-muted">Fechas especiales y felicitaciones de la comunidad</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
          <Gift size={20} />
        </div>
      </div>

      {/* This Week Section */}
      {thisWeek.length > 0 && (
        <div className="p-4 rounded-2xl border border-accent/40 bg-accent/10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-light" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-accent-light">
              Cumpleañeros de esta semana
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {thisWeek.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={u.photo} name={u.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{u.full_name}</p>
                    <p className="text-[10px] text-accent-light font-medium">
                      {format(parseISO(u.birthdate), 'd MMM', { locale: es })} · {getAge(u.birthdate)} años
                    </p>
                  </div>
                </div>
                {u.phone && (
                  <a
                    href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Feliz cumpleaños ${u.full_name}! Que Dios te bendiga y llene de gracia tu vida.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  >
                    <MessageCircle size={14} />
                    <span>Felicitar</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Month */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted">Cargando cumpleaños...</div>
      ) : allWithBirthdays.length === 0 ? (
        <Empty 
          icon={Gift} 
          title="Sin cumpleaños registrados" 
          subtitle="Agrega las fechas de los miembros haciendo clic en editar." 
        />
      ) : (
        <div className="space-y-4">
          {months.map(m => {
            const monthUsers = allWithBirthdays.filter(u => parseISO(u.birthdate).getMonth() === m)
            return (
              <div key={m} className="space-y-2">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider capitalize flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{format(new Date(2024, m, 1), 'MMMM', { locale: es })}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {monthUsers.map(u => (
                    <Card key={u.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={u.photo} name={u.full_name} size="sm" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-text-primary truncate">{u.full_name}</h4>
                            <p className="text-[10px] text-muted">
                              {format(parseISO(u.birthdate), 'd MMM', { locale: es })} · {getAge(u.birthdate)} años
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {u.phone && (
                            <a
                              href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Feliz cumpleaños ${u.full_name}! Que Dios te bendiga grandemente en tu día.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                              title="Enviar saludo"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-muted hover:text-text-primary transition-colors"
                            title="Editar fecha"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Without Birthdays List */}
      {withoutBirthdays.length > 0 && (
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <AlertCircle size={14} className="text-amber-400" />
            <span>Sin fecha registrada ({withoutBirthdays.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {withoutBirthdays.map(u => (
              <button
                key={u.id}
                onClick={() => handleOpenEdit(u)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-card2 border border-border text-muted hover:text-text-primary hover:border-accent/30 transition-colors"
              >
                <span>{u.full_name}</span>
                <Edit2 size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Editar Cumpleaños */}
      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Editar cumpleaños de ${editingUser?.full_name}`}
      >
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Fecha de nacimiento</label>
            <input
              type="date"
              required
              value={birthdateInput}
              onChange={e => setBirthdateInput(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Btn type="submit" fullWidth disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Fecha'}
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => setEditingUser(null)}>
              Cancelar
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
