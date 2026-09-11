import React, { useState, useEffect } from 'react'
import { Send, MessageSquare, CheckCircle2, Clock, Sparkles, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, Btn, Empty } from '../components/ui'

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
  const [mySuggestions, setMySuggestions] = useState([])

  useEffect(() => {
    // Load local suggestions
    try {
      const saved = JSON.parse(localStorage.getItem(`intimos_voice_${currentUser?.id}`) || '[]')
      setMySuggestions(saved)
    } catch {}
  }, [currentUser?.id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const newSuggestion = {
      id: Date.now(),
      category,
      text: text.trim(),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      status: 'en_revision'
    }

    const updated = [newSuggestion, ...mySuggestions]
    setMySuggestions(updated)
    localStorage.setItem(`intimos_voice_${currentUser?.id}`, JSON.stringify(updated))

    setText('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
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

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div>
        <h1 className="text-xl font-black text-text-primary">Mi Voz</h1>
        <p className="text-xs text-muted mt-0.5">Tu opinión importa y ayuda a construir el ministerio</p>
      </div>

      {/* Form Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-accent-light" />
          <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Nueva sugerencia o idea
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            <div className="text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>¡Sugerencia enviada! El equipo pastoral la revisará pronto.</span>
            </div>
          ) : (
            <Btn type="submit" fullWidth disabled={!text.trim()}>
              <Send size={15} />
              <span>Enviar sugerencia</span>
            </Btn>
          )}
        </form>
      </Card>

      {/* History */}
      <div className="space-y-3 pt-2">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Mis sugerencias enviadas
        </h2>

        {mySuggestions.length === 0 ? (
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
              <p className="text-[10px] text-muted flex items-center gap-1 mt-1">
                <Clock size={11} />
                <span>{format(new Date(s.date), "d 'de' MMMM, h:mm a", { locale: es })}</span>
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
