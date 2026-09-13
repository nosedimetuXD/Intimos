import React, { useState, useEffect } from 'react'
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { centralApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function Finances() {
  const [finances, setFinances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('income') // income | expense
  const [category, setCategory] = useState('Ofrenda')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const loadData = async () => {
    try {
      const res = await centralApi.getFinances()
      setFinances(res || [])
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
    if (!amount || !description.trim()) return

    try {
      await centralApi.createFinance({
        type,
        category,
        amount: parseFloat(amount),
        description: description.trim(),
      })
      setShowModal(false)
      setAmount('')
      setDescription('')
      loadData()
    } catch (err) {
      alert(err.message || 'Error al registrar movimiento')
    }
  }

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((acc, f) => acc + (parseFloat(f.amount) || 0), 0)

  const totalExpense = finances
    .filter(f => f.type === 'expense')
    .reduce((acc, f) => acc + (parseFloat(f.amount) || 0), 0)

  const balance = totalIncome - totalExpense

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro financiero?')) return
    try {
      await centralApi.deleteFinance(id)
      setFinances(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      alert(err.message || 'Error al eliminar registro')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Finanzas y Tesorería</h1>
          <p className="text-xs text-muted">Control de ingresos, gastos y presupuesto ministerial</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nuevo Movimiento</span>
        </Btn>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted font-bold mb-1">
            <span>Ingresos</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted font-bold mb-1">
            <span>Gastos</span>
            <ArrowDownRight size={16} className="text-rose-400" />
          </div>
          <p className="text-xl font-black text-rose-400">${totalExpense.toLocaleString()}</p>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted font-bold mb-1">
            <span>Balance Neto</span>
            <TrendingUp size={16} className="text-accent-light" />
          </div>
          <p className={`text-xl font-black ${balance >= 0 ? 'text-accent-light' : 'text-rose-400'}`}>
            ${balance.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="space-y-3">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Libro de Movimientos
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Cargando movimientos...</div>
        ) : finances.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">No hay registros financieros este mes.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {finances.map(f => {
              const isIncome = f.type === 'income'
              return (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-card2 border border-border text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{f.description}</span>
                      <span className="text-[10px] text-muted bg-card px-2 py-0.2 rounded border border-border">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">
                      {format(new Date(f.created_at || Date.now()), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-black text-xs ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? `+$${parseFloat(f.amount).toLocaleString()}` : `-$${parseFloat(f.amount).toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors"
                      title="Eliminar movimiento"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Modal Nuevo Movimiento */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Movimiento Financiero">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-card2 border-border text-muted'
              }`}
            >
              + Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                type === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-card2 border-border text-muted'
              }`}
            >
              - Gasto
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Ofrenda">Ofrenda</option>
              <option value="Donación">Donación</option>
              <option value="Sonido / Alabanza">Sonido / Alabanza</option>
              <option value="Refrigerios">Refrigerios</option>
              <option value="Materiales y Dinámicas">Materiales y Dinámicas</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Monto ($COP)</label>
            <input
              type="number"
              required
              placeholder="Ej. 25000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <input
              required
              placeholder="Ej. Refrigerios del culto sábado"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!amount || !description.trim()}>
              Guardar Movimiento
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
