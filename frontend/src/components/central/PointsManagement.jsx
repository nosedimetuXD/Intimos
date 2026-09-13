import React, { useState, useEffect } from 'react'
import { Star, Sparkles, History, Search, Plus, Minus, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { pointsApi, centralApi } from '../../api'
import { Card, Btn, Avatar, Empty } from '../ui'

const PRESET_AMOUNTS = [50, 100, 200, 300, 500]

export default function PointsManagement() {
  const [users, setUsers] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [mainTab, setMainTab] = useState('puntos')
  
  // Point adjustment form state
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [action, setAction] = useState('add')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  // Audit search
  const [auditSearch, setAuditSearch] = useState('')

  const loadData = async () => {
    try {
      const [uList, hList] = await Promise.all([
        centralApi.getUsers().catch(() => []),
        pointsApi.getHistory(100).catch(() => []),
      ])
      setUsers(uList || [])
      setHistory(hList || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApply = async () => {
    if (!selectedUser || !amount || isNaN(parseInt(amount))) return
    const finalPoints = parseInt(amount) * (action === 'remove' ? -1 : 1)
    setSubmitting(true)
    setMsg('')
    try {
      await pointsApi.adjust(selectedUser.id, finalPoints, reason.trim() || 'Ajuste manual de liderazgo')
      setMsg(`¡${finalPoints > 0 ? '+' : ''}${finalPoints} pts asignados a ${selectedUser.full_name}!`)
      setAmount('')
      setReason('')
      setSelectedUser(null)
      loadData()
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => {
    return (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
           (u.email || '').toLowerCase().includes(search.toLowerCase())
  })

  const filteredHistory = history.filter(h => {
    if (!auditSearch) return true
    const q = auditSearch.toLowerCase()
    return (h.reason || '').toLowerCase().includes(q) ||
           (h.user_name || '').toLowerCase().includes(q)
  })

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Puntos</h1>
          <p className="text-xs text-muted">Auditoría y asignación de puntaje a miembros</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setMainTab('puntos')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
            mainTab === 'puntos'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          Asignar Puntos
        </button>
        <button
          onClick={() => setMainTab('auditoria')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
            mainTab === 'auditoria'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          <ClipboardList size={14} />
          <span>Auditoría (Ledger)</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {mainTab === 'puntos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User selector list */}
          <Card className="space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar miembro..."
                className="w-full text-xs"
                style={{ paddingLeft: '34px' }}
              />
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
              {filteredUsers.map(u => {
                const isSelected = selectedUser?.id === u.id
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'bg-accent/15 border-accent/40 text-accent-light' 
                        : 'bg-card2 border-border hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={u.photo} name={u.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-text-primary truncate">{u.full_name}</p>
                        <p className="text-[10px] text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-amber-400">{u.total_points || 0} pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Action form */}
          <Card className="space-y-3">
            <h2 className="font-bold text-xs uppercase tracking-wider text-muted">
              {selectedUser ? `Modificar puntos de: ${selectedUser.full_name}` : 'Selecciona un miembro'}
            </h2>

            {selectedUser ? (
              <div className="space-y-3">
                {/* Add / Remove toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAction('add')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                      action === 'add'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-card2 text-muted border-border'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Sumar</span>
                  </button>
                  <button
                    onClick={() => setAction('remove')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                      action === 'remove'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-card2 text-muted border-border'
                    }`}
                  >
                    <Minus size={14} />
                    <span>Restar</span>
                  </button>
                </div>

                {/* Amount presets */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted">Cantidad de puntos</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_AMOUNTS.map(p => (
                      <button
                        key={p}
                        onClick={() => setAmount(String(p))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          amount === String(p)
                            ? 'bg-accent text-white border-accent'
                            : 'bg-card2 text-muted border-border hover:text-text-primary'
                        }`}
                      >
                        +{p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="O ingresa un monto personalizado..."
                    className="w-full text-xs mt-1"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted">Motivo / Razón</label>
                  <input
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Ej. Ganador de dinámica, apoyo especial..."
                    className="w-full text-xs"
                  />
                </div>

                <Btn
                  onClick={handleApply}
                  fullWidth
                  disabled={submitting || !amount || parseInt(amount) <= 0}
                >
                  {submitting 
                    ? 'Aplicando...' 
                    : `${action === 'add' ? 'Sumar' : 'Restar'} ${amount || 0} pts`
                  }
                </Btn>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                Haz clic en un miembro de la lista izquierda para ajustar sus puntos.
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Audit Tab */
        <Card className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              placeholder="Buscar en el historial por motivo o nombre..."
              className="w-full text-xs"
              style={{ paddingLeft: '34px' }}
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-muted">Cargando transacciones...</div>
          ) : filteredHistory.length === 0 ? (
            <Empty icon={History} title="Sin transacciones" subtitle="Los movimientos de puntos aparecerán aquí." />
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto">
              {filteredHistory.map(h => {
                const isPositive = h.points >= 0
                return (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-card2 border border-border text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">{h.reason || 'Ajuste de puntos'}</p>
                        <p className="text-[10px] text-muted mt-0.5">
                          {h.user_name ? `${h.user_name} · ` : ''}
                          {format(new Date(h.created_at || Date.now()), "d 'de' MMMM, h:mm a", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <span className={`font-black text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? `+${h.points}` : h.points} pts
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
