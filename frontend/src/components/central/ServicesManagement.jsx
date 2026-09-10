import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, QrCode, CheckCircle2, ChevronRight, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'
import { servicesApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

const SERVICE_TYPES = ['Regular', 'Noche de Cine', 'Parque', 'Especial']

export default function ServicesManagement() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState(null)
  const [form, setForm] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '16:00',
    type: 'Regular',
    location: 'Templo Principal',
  })

  const loadServices = async () => {
    try {
      const data = await servicesApi.list()
      setServices(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString()
      await servicesApi.create({
        title: form.title,
        scheduled_at: scheduledAt,
        location: form.location,
        type: form.type,
      })
      setShowModal(false)
      setForm({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '16:00',
        type: 'Regular',
        location: 'Templo Principal',
      })
      loadServices()
    } catch (err) {
      alert(err.message || 'Error al guardar servicio')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Servicios</h1>
          <p className="text-xs text-muted">Crea cultos, genera códigos QR y administra dinámicas</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nuevo Culto</span>
        </Btn>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando servicios...</div>
      ) : services.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs text-muted">No hay cultos programados.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      svc.status === 'upcoming' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                        : 'bg-card2 text-muted border-border'
                    }`}>
                      {svc.status === 'upcoming' ? 'Próximo' : 'Pasado'}
                    </span>
                    <span className="text-[10px] text-muted bg-card2 px-2 py-0.5 rounded-full border border-border">
                      {svc.type || 'Regular'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">{svc.title}</h3>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{format(new Date(svc.scheduled_at), "EEEE d 'de' MMMM · h:mm a", { locale: es })}</span>
                  </p>
                  {svc.location && (
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                      <MapPin size={12} />
                      <span>{svc.location}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(svc)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-bold hover:bg-accent/25 transition-colors"
                  >
                    <QrCode size={14} />
                    <span>Ver QR</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo Servicio */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Programar Nuevo Servicio">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título del culto</label>
            <input
              required
              placeholder="Ej. Noche de Alabanza y Amistad"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Fecha</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Hora</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {SERVICE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Lugar</label>
              <input
                placeholder="Auditorio Principal"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth>
              Guardar Servicio
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Modal QR Code */}
      <Modal open={!!selectedQR} onClose={() => setSelectedQR(null)} title="Código QR de Asistencia">
        {selectedQR && (
          <div className="p-6 text-center space-y-4">
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-xl">
              <QRCodeSVG value={selectedQR.qr_token || selectedQR.id} size={220} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">{selectedQR.title}</h3>
              <p className="text-xs text-muted mt-0.5">Token: <code className="font-mono text-accent-light">{selectedQR.qr_token}</code></p>
              <p className="text-[11px] text-muted mt-2">Los miembros pueden escanear este código desde la app para registrar su asistencia (+300 pts).</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
