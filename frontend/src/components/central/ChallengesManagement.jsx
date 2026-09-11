import React, { useState, useEffect } from 'react'
import { Zap, Plus, CheckCircle2, Trash2, Calendar, Lightbulb } from 'lucide-react'
import { Card, Btn, Modal } from '../ui'
import { CHALLENGE_IDEAS } from '../../data/challengeIdeas'


const INITIAL_CHALLENGES = [
  {
    id: '1',
    title: 'Invita a un amigo nuevo a la reunión',
    description: 'Trae a un invitado que nunca haya asistido al grupo de jóvenes este sábado.',
    points: 150,
    active: true,
    completions: 4,
  },
  {
    id: '2',
    title: 'Lee el libro de Santiago completo',
    description: 'Dedica 20 minutos durante la semana para leer los 5 capítulos de la carta de Santiago.',
    points: 100,
    active: true,
    completions: 7,
  }
]

export default function ChallengesManagement() {
  const [challenges, setChallenges] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(100)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_weekly_challenges') || '[]')
      if (stored.length > 0) setChallenges(stored)
      else setChallenges(INITIAL_CHALLENGES)
    } catch {
      setChallenges(INITIAL_CHALLENGES)
    }
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const newCh = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      points: parseInt(points) || 100,
      active: true,
      completions: 0,
    }

    const updated = [newCh, ...challenges]
    setChallenges(updated)
    localStorage.setItem('intimos_weekly_challenges', JSON.stringify(updated))
    setTitle('')
    setDescription('')
    setShowModal(false)
  }

  const handleDelete = (id) => {
    const updated = challenges.filter(c => c.id !== id)
    setChallenges(updated)
    localStorage.setItem('intimos_weekly_challenges', JSON.stringify(updated))
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Retos Semanales</h1>
          <p className="text-xs text-muted">Crea retos ministeriales, espirituales o de evangelismo</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nuevo Reto</span>
        </Btn>
      </div>

      <div className="space-y-3">
        {challenges.map(ch => (
          <Card key={ch.id} className="space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    +{ch.points} pts
                  </span>
                  <span className="text-[10px] text-muted">
                    {ch.completions} miembros lo han completado
                  </span>
                </div>
                <h3 className="font-bold text-sm text-text-primary">{ch.title}</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{ch.description}</p>
              </div>

              <button
                onClick={() => handleDelete(ch.id)}
                className="p-1.5 rounded-lg text-muted hover:text-rose-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nuevo Reto */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Crear Reto Semanal">
        <form onSubmit={handleAdd} className="p-4 space-y-3">
          {/* Ideas Bank Selector */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-1.5">
            <label className="text-[11px] font-bold text-accent-light flex items-center gap-1">
              <Lightbulb size={13} />
              <span>Cargar idea del banco (opcional):</span>
            </label>
            <select
              onChange={e => {
                const idea = CHALLENGE_IDEAS.find(i => i.title === e.target.value)
                if (idea) {
                  setTitle(idea.title)
                  setDescription(idea.description)
                  setPoints(idea.points || 100)
                }
              }}
              className="w-full text-xs p-2 rounded-lg bg-card border border-border text-text-primary"
            >
              <option value="">Selecciona una idea sugerida...</option>
              {CHALLENGE_IDEAS.map(idea => (
                <option key={idea.title} value={idea.title}>
                  [{idea.category}] {idea.title} (+{idea.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título del reto</label>
            <input
              required
              placeholder="Ej. Memoriza Romanos 8:38-39"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <textarea
              rows={3}
              required
              placeholder="Instrucciones para los jóvenes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full resize-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Puntos de recompensa</label>
            <input
              type="number"
              required
              value={points}
              onChange={e => setPoints(e.target.value)}
              min={10}
              max={500}
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!title.trim() || !description.trim()}>
              Publicar Reto
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
