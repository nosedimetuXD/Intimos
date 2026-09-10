import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { servicesApi, pointsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  QrCode, 
  Sparkles, 
  Send,
  CheckCircle2,
  Gamepad2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Btn } from '../components/ui'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, refreshProfile } = useAuth()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [postResponse, setPostResponse] = useState('')
  const [submittedPost, setSubmittedPost] = useState(false)

  useEffect(() => {
    servicesApi.list()
      .then(services => {
        const found = (services || []).find(s => s.id === id)
        setService(found || null)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    // Check if post response submitted
    if (localStorage.getItem(`intimos_post_service_${id}_${currentUser?.id}`)) {
      setSubmittedPost(true)
    }
  }, [id, currentUser?.id])

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!postResponse.trim()) return

    localStorage.setItem(`intimos_post_service_${id}_${currentUser?.id}`, postResponse.trim())
    setSubmittedPost(true)
    refreshProfile()
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-muted">Cargando detalles del servicio...</div>
  }

  if (!service) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm font-bold text-text-primary">Servicio no encontrado</p>
        <Btn onClick={() => navigate('/servicios')}>Volver a Servicios</Btn>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/servicios')}
          className="p-2 rounded-xl bg-card border border-border text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider">Detalle del Culto</span>
          <h1 className="text-base sm:text-lg font-black text-text-primary leading-tight">{service.title}</h1>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Calendar size={14} className="text-accent-light" />
          <span className="font-semibold text-text-primary">
            {format(new Date(service.scheduled_at), "EEEE d 'de' MMMM · h:mm a", { locale: es })}
          </span>
        </div>

        {service.location && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <MapPin size={14} className="text-accent-light" />
            <span>{service.location}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            service.status === 'upcoming' 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
              : 'bg-card2 text-muted border-border'
          }`}>
            {service.status === 'upcoming' ? 'Próximo Encuentro' : 'Servicio Pasado'}
          </span>

          {service.status === 'upcoming' && (
            <Btn size="sm" onClick={() => navigate('/checkin')}>
              <QrCode size={14} />
              <span>Hacer Check-In</span>
            </Btn>
          )}
        </div>
      </Card>

      {/* Post-Service Dynamic / Feedback */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} className="text-amber-400" />
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Dinámica Post-Servicio
          </h2>
          <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            +50 pts
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {service.feedback_prompt || '¿Qué enseñanza o mensaje te impactó más del culto de hoy?'}
        </p>

        {submittedPost ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>¡Ya respondiste la dinámica de este servicio! Gracias por participar.</span>
          </div>
        ) : (
          <form onSubmit={handlePostSubmit} className="space-y-3 pt-2">
            <textarea
              rows={3}
              value={postResponse}
              onChange={(e) => setPostResponse(e.target.value)}
              placeholder="Escribe aquí lo que Dios habló a tu corazón..."
              className="w-full resize-none text-xs"
              required
            />
            <Btn type="submit" fullWidth disabled={!postResponse.trim()}>
              <Send size={14} />
              <span>Enviar Respuesta (+50 pts)</span>
            </Btn>
          </form>
        )}
      </Card>
    </div>
  )
}
