import React, { useState, useEffect } from 'react'
import { Tent, Plus, DollarSign, Users, Award, Trash2 } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function CampSavings() {
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Efectivo')
  const [notes, setNotes] = useState('')

  const loadData = async () => {
    try {
      const [pList, uList] = await Promise.all([
        centralApi.getCampPayments().catch(() => []),
        centralApi.getUsers().catch(() => [])
      ])
      setPayments(pList || [])
      setUsers(uList || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId || !amount) return

    try {
      await centralApi.createCampPayment({
        user_id: userId,
        amount: parseFloat(amount),
        method,
        notes: notes.trim(),
      })
      setShowModal(false)
      setAmount('')
      setNotes('')
      loadData()
    } catch (err) {
      alert(err.message || 'Error al registrar abono')
    }
  }

  const totalRaised = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Ahorro para Campamento</h1>
          <p className="text-xs text-muted">Abonos, cuotas y descuentos por asistencia fiel</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Registrar Abono</span>
        </Btn>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Recaudado</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">${totalRaised.toLocaleString()}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Abonos Realizados</p>
          <p className="text-xl font-black text-accent-light mt-0.5">{payments.length}</p>
        </Card>
        <Card className="text-center p-3 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Meta Total</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">$3,500,000</p>
        </Card>
      </div>

      {/* List of Payments */}
      <Card className="space-y-3">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Historial de Abonos
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Cargando abonos...</div>
        ) : payments.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">Aún no hay abonos registrados para el campamento.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card2 border border-border text-xs">
                <div>
                  <p className="font-bold text-text-primary">{p.user_name || 'Miembro'}</p>
                  <p className="text-[10px] text-muted mt-0.5">Método: {p.method} {p.notes ? `· ${p.notes}` : ''}</p>
                </div>
                <span className="font-black text-xs text-emerald-400">
                  +${parseFloat(p.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Registrar Abono */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Abono de Campamento">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Seleccionar Miembro</label>
            <select required value={userId} onChange={e => setUserId(e.target.value)}>
              <option value="">-- Selecciona un usuario --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Monto ($COP)</label>
            <input
              type="number"
              required
              placeholder="Ej. 50000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Método de pago</label>
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Notas (opcional)</label>
            <input
              placeholder="Comprobante o detalle"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!userId || !amount}>
              Guardar Abono
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
