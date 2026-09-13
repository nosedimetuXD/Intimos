import React, { useState, useEffect, useMemo } from 'react'
import { 
  Tent, 
  Plus, 
  DollarSign, 
  Users, 
  Award, 
  Trash2, 
  Tv, 
  Eye, 
  EyeOff, 
  Check, 
  Clock, 
  Search, 
  X, 
  MapPin, 
  CalendarDays,
  Sparkles
} from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Btn, Modal, Avatar } from '../ui'

const DEFAULT_CAMP_PRICE = 190000
const DISCOUNT_PER_EARLY = 5000
const CAMP_DATES = '13 al 16 de noviembre'
const CAMP_LOCATION = 'Finca Casa Yolis'

export default function CampSavings() {
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Efectivo')
  const [notes, setNotes] = useState('')
  
  // Projection Mode
  const [projectUser, setProjectUser] = useState(null)
  const [revealPrivateMoney, setRevealPrivateMoney] = useState(false) // Modo Privacidad
  const [campPrice, setCampPrice] = useState(DEFAULT_CAMP_PRICE)

  const loadData = async () => {
    try {
      const [pList, uList, sList] = await Promise.all([
        centralApi.getCampPayments().catch(() => []),
        centralApi.getUsers().catch(() => []),
        centralApi.getServices ? centralApi.getServices().catch(() => []) : Promise.resolve([])
      ])
      setPayments(pList || [])
      setUsers(uList || [])
      setServices(sList || [])
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

  // Calculate savings per user
  const userSavingsMap = useMemo(() => {
    const map = {}
    users.forEach(u => {
      // User payments
      const userPayments = payments.filter(p => p.user_id === u.id || p.userId === u.id)
      const paidTotal = userPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

      // Mock early services count if real attendance not populated yet
      const earlyCount = u.early_count || 0
      const discount = earlyCount * DISCOUNT_PER_EARLY
      const finalPrice = Math.max(0, campPrice - discount)
      const pending = Math.max(0, finalPrice - paidTotal)
      const pct = Math.min(100, Math.round((paidTotal / (finalPrice || 1)) * 100))

      map[u.id] = {
        user: u,
        paidTotal,
        earlyCount,
        discount,
        finalPrice,
        pending,
        pct
      }
    })
    return map
  }, [users, payments, campPrice])

  const totalRaised = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }, [users, search])

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-text-primary flex items-center gap-2">
            <Tent className="text-orange-500" size={22} />
            <span>Campamento Íntimos 2026</span>
          </h1>
          <p className="text-xs text-muted">Abonos, proyección y descuentos por asistencia temprana</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn 
            variant="secondary" 
            size="sm"
            onClick={() => setRevealPrivateMoney(r => !r)}
            title="Alternar privacidad de cifras de aportes"
          >
            {revealPrivateMoney ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{revealPrivateMoney ? 'Ocultar Aportes' : 'Ver Aportes'}</span>
          </Btn>
          <Btn size="sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Registrar Abono</span>
          </Btn>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Precio Base</p>
          <p className="text-lg font-black text-text-primary mt-0.5">${campPrice.toLocaleString()}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Descuento / Sábado</p>
          <p className="text-lg font-black text-orange-400 mt-0.5">-${DISCOUNT_PER_EARLY.toLocaleString()}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Recaudado</p>
          <p className="text-lg font-black text-emerald-400 mt-0.5">
            {revealPrivateMoney ? `$${totalRaised.toLocaleString()}` : '••••••••'}
          </p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Abonos Totales</p>
          <p className="text-lg font-black text-accent-light mt-0.5">{payments.length}</p>
        </Card>
      </div>

      {/* Search & Member Camp Savings List */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Jóvenes y Ahorro Acumulado
          </h2>
          <div className="w-48 sm:w-64">
            <input
              type="text"
              placeholder="Buscar joven..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs py-1.5 px-3 rounded-xl bg-card2 border border-border"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Cargando jóvenes...</div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">No se encontraron jóvenes registrados.</p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map(u => {
              const data = userSavingsMap[u.id] || { paidTotal: 0, earlyCount: 0, discount: 0, finalPrice: campPrice, pending: campPrice, pct: 0 }
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card2/50 border border-border/60 hover:border-accent/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.full_name} size="sm" />
                    <div className="truncate">
                      <p className="font-bold text-text-primary truncate">{u.full_name}</p>
                      <p className="text-[10px] text-muted">
                        {data.earlyCount} sábados temprano · <span className="text-orange-400 font-semibold">Ahorrado: ${data.discount.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-black text-text-primary">
                        {revealPrivateMoney ? `$${data.paidTotal.toLocaleString()} abonado` : 'Abono registrado'}
                      </p>
                      <p className="text-[10px] text-muted">
                        A pagar: <span className="font-bold text-emerald-400">${data.pending.toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Button to open Projection Card */}
                    <button
                      onClick={() => setProjectUser(data)}
                      className="p-2 rounded-xl bg-accent/15 text-accent-light hover:bg-accent/25 transition-colors"
                      title="Proyectar tarjeta en pantalla gigante"
                    >
                      <Tv size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Projection Modal (Designed as a high-contrast flyer for VideoBeam) */}
      {projectUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setProjectUser(null)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 text-center animate-scale-up"
            style={{ 
              background: 'linear-gradient(135deg, #FBF8F1 0%, #EFE5D0 100%)',
              color: '#2B1B10'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setProjectUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#2B1B10] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Flyer Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9531C]/15 text-[#D9531C] font-black text-xs uppercase tracking-widest mb-2">
                <Tent size={14} />
                <span>Campamento Íntimos 2026</span>
              </div>
              <h2 className="text-2xl font-black text-[#2B1B10] leading-tight">
                {projectUser.user.full_name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs text-[#7A6552] font-semibold mt-1">
                <span className="flex items-center gap-1"><CalendarDays size={12} /> {CAMP_DATES}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {CAMP_LOCATION}</span>
              </div>
            </div>

            {/* Price & Savings Badge */}
            <div className="p-5 rounded-2xl bg-white/70 border border-[#D9531C]/20 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#7A6552]">
                <span>Precio base:</span>
                <span className="line-through">${campPrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-[#D9531C]">
                <span>Ahorro por puntualidad ({projectUser.earlyCount} sábados):</span>
                <span>-${projectUser.discount.toLocaleString()}</span>
              </div>

              <div className="h-px bg-black/10" />

              <div className="flex items-center justify-between text-base font-black text-[#2B1B10]">
                <span>Valor Final a Pagar:</span>
                <span className="text-xl text-[#D9531C]">${projectUser.finalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Private section with Eye Toggle */}
            <div className="p-4 rounded-2xl bg-black/5 border border-black/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7A6552]">Estado del Aporte:</span>
                <button
                  onClick={() => setRevealPrivateMoney(r => !r)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#D9531C] hover:underline"
                >
                  {revealPrivateMoney ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{revealPrivateMoney ? 'Ocultar' : 'Ver monto'}</span>
                </button>
              </div>

              {revealPrivateMoney ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Abonado:</span>
                    <span className="text-emerald-700">${projectUser.paidTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>Saldo pendiente:</span>
                    <span className="text-[#D9531C]">${projectUser.pending.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#D9531C] h-full rounded-full transition-all"
                      style={{ width: `${projectUser.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A6552] text-right font-bold">{projectUser.pct}% cubierto</p>
                </div>
              ) : (
                <p className="text-xs text-[#7A6552] italic py-1">
                  Cifras de pago protegidas en proyección pública.
                </p>
              )}
            </div>

            <p className="text-[11px] text-[#7A6552] font-medium leading-relaxed">
              "¡Prepárate para vivir una experiencia inolvidable en la presencia de Dios!"
            </p>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Abono">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">Joven / Miembro</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-card2 border border-border"
              required
            >
              <option value="">Selecciona un joven...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Monto ($)</label>
            <input
              type="number"
              placeholder="Ej: 50000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-card2 border border-border"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Método de pago</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-card2 border border-border"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia (Nequi / Bancolombia)</option>
              <option value="Daviplata">Daviplata</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Notas u observaciones (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Primer abono cuota 1"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-card2 border border-border"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Btn fullWidth type="submit">
              <span>Guardar Abono</span>
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
