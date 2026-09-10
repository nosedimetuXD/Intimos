import React, { useState, useEffect } from 'react'
import { Star, Sparkles, History, Search, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { pointsApi, centralApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function PointsManagement() {
  const [users, setUsers] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const loadData = async () => {
    try {
      const [uList, hList] = await Promise.all([
        centralApi.getUsers().catch(() => []),
        pointsApi.getHistory(50).catch(() => []),
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

  const handleAdjust = async (e) => {
    e.preventDefault()
    if (!targetUserId || !amount || !reason.trim()) return
    setSubmitting(true)
    setMsg('')
    try {
      await pointsApi.adjust(targetUserId, parseInt(amount), reason.trim())
      setMsg('¡Puntos registrados exitosamente!')
      setAmount('')
      setReason('')
      setShowAdjustModal(false)
      loadData()
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Puntos</h1>
          <p className="text-xs text-muted">Auditoría y asignación manual de puntaje</p>
        </div>
        <Btn onClick={() => setShowAdjustModal(true)}>
          <Plus size={16} />
          <span>Asignar Puntos</span>
        </Btn>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Ledger History Card */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-accent-light" />
          <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Libro Mayor de Transacciones (Ledger)
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Cargando transacciones...</div>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">No hay transacciones registradas.</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {history.map(h => {
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
                      <p className="font-bold text-text-primary">{h.reason}</p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {format(new Date(h.created_at), "d 'de' MMMM, h:mm a", { locale: es })}
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

      {/* Modal Asignar Puntos */}
      <Modal open={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Asignar o Corregir Puntos">
        <form onSubmit={handleAdjust} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Seleccionar Miembro</label>
            <select
              required
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Cantidad de puntos (ej. 50 o -20)</label>
            <input
              type="number"
              required
              placeholder="Puntos"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Motivo (auditoría)</label>
            <input
              type="text"
              required
              placeholder="Ej. Dinámica de integración, alabanza"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={submitting || !targetUserId || !amount}>
              {submitting ? 'Registrando...' : 'Confirmar Puntos'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
