import React, { useState, useEffect } from 'react'
import { Send, MessageSquare, CheckCircle2, Clock, Sparkles, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, Btn, Empty } from '../components/ui'
import { suggestionsApi } from '../api'

const CATEGORIES = [
  'Culto de Jóvenes',
  'Alabanza y Música',
  'Actividades y Salidas',
  'Enseñanza Bíblica',
  'Espacio Físico',
  'Otro'
]

export default function VoiceScreen() {
  const { currentUser } = useAuth()
  const [category, setCategory] = useState(CATEGORIES[0])
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mySuggestions, setMySuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMySuggestions = async () => {
    try {
      setLoading(true)
      const data = await suggestionsApi.getMy()
      if (Array.isArray(data)) {
        setMySuggestions(data)
      } else {
        const saved = JSON.parse(localStorage.getItem(`intimos_voice_${currentUser?.id}`) || '[]')
        setMySuggestions(saved)
      }
    } catch {
      const saved = JSON.parse(localStorage.getItem(`intimos_voice_${currentUser?.id}`) || '[]')
      setMySuggestions(saved)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMySuggestions()
  }, [currentUser?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    const content = text.trim()

    try {
      const created = await suggestionsApi.create({ category, text: content })
      if (created) {
        setMySuggestions(prev => [created, ...prev])
      }
    } catch {
      const fallbackSuggestion = {
        id: String(Date.now()),
        category,
        text: content,
        created_at: new Date().toISOString(),
        status: 'en_revision'
      }
      const updated = [fallbackSuggestion, ...mySuggestions]
      setMySuggestions(updated)
      localStorage.setItem(`intimos_voice_${currentUser?.id}`, JSON.stringify(updated))
    } finally {
      setSubmitting(false)
      setText('')
      setSent(true)
      setTimeout(() => setSent(false), 3500)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'implementada':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Sparkles size={11} />
            <span>Implementada</span>
          </span>
        )
      case 'en_revision':
      case 'en_consideracion':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Clock size={11} />
            <span>En revisión</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-light border border-accent/25">
            <Check size={11} />
            <span>Recibida</span>
          </span>
        )
    }
  }

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return 'Reciente'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Reciente'
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-24 sm:pb-6">
      <div>
        <h1 className="text-xl font-black text-text-primary">Mi Voz</h1>
        <p className="text-xs text-muted mt-0.5">Tu opinión importa y ayuda a construir el ministerio</p>
      </div>

      {/* Form Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-accent-light" />
          <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Nueva sugerencia o propuesta
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    category === cat
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-card2 text-muted border-border hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Tu mensaje</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cuéntanos tu propuesta, sugerencia o feedback para el grupo..."
              className="w-full resize-none text-xs"
              required
            />
          </div>

          {sent ? (
            <div className="text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>¡Sugerencia enviada! El equipo pastoral la revisará pronto.</span>
            </div>
          ) : (
            <Btn type="submit" fullWidth disabled={!text.trim() || submitting}>
              {submitting ? <Loader2 size={15} className="animate-spin mx-auto" /> : <Send size={15} />}
              <span>{submitting ? 'Enviando...' : 'Enviar sugerencia'}</span>
            </Btn>
          )}
        </form>
      </Card>

      {/* History */}
      <div className="space-y-3 pt-2">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Mis sugerencias enviadas
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-accent-light" />
          </div>
        ) : mySuggestions.length === 0 ? (
          <Empty
            icon={MessageSquare}
            title="Aún no has enviado sugerencias"
            subtitle="¡Anímate a compartir tus ideas para los próximos cultos o actividades!"
          />
        ) : (
          mySuggestions.map(s => (
            <Card key={s.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted bg-card2 px-2 py-0.5 rounded-full border border-border">
                  {s.category}
                </span>
                {getStatusBadge(s.status)}
              </div>
              <p className="text-xs text-text-primary leading-relaxed">{s.text}</p>
              {s.admin_response && (
                <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 mt-2">
                  <p className="text-[10px] uppercase font-bold text-accent-light">Respuesta pastoral:</p>
                  <p className="text-xs text-text-primary mt-0.5">{s.admin_response}</p>
                </div>
              )}
              <p className="text-[10px] text-muted flex items-center gap-1 mt-1">
                <Clock size={11} />
                <span>{formatDate(s.created_at || s.date)}</span>
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
