import React, { useState, useEffect } from 'react'
import { Lightbulb, Plus, Trash2, Tag, ThumbsUp } from 'lucide-react'
import { Card, Btn, Modal } from '../ui'

const CATEGORIES = ['Dinámicas', 'Temas de Culto', 'Salidas y Convivencia', 'Especiales']

const INITIAL_IDEAS = [
  {
    id: '1',
    title: 'Carrera de Relevos con Preguntas Bíblicas',
    description: 'Dividir en 4 equipos. En cada estación hay una trivia bíblica rápida antes de entregar el testigo.',
    category: 'Dinámicas',
    likes: 5,
  },
  {
    id: '2',
    title: 'Noche de Cine Bajo las Estrellas',
    description: 'Proyectar una película inspiradora en el patio o terraza con palomitas de maíz y fogata simbólica.',
    category: 'Salidas y Convivencia',
    likes: 8,
  },
  {
    id: '3',
    title: 'Serie: Identidad en un Mundo Digital',
    description: '3 prédicas sobre las redes sociales, la comparación y cómo encontrar valor en lo que Dios dice de nosotros.',
    category: 'Temas de Culto',
    likes: 12,
  },
]

export default function IdeasBank() {
  const [ideas, setIdeas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_ideas') || '[]')
      if (stored.length > 0) {
        setIdeas(stored)
      } else {
        setIdeas(INITIAL_IDEAS)
      }
    } catch {
      setIdeas(INITIAL_IDEAS)
    }
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const newIdea = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      category,
      likes: 0,
    }

    const updated = [newIdea, ...ideas]
    setIdeas(updated)
    localStorage.setItem('intimos_ideas', JSON.stringify(updated))
    setTitle('')
    setDescription('')
    setShowModal(false)
  }

  const handleDelete = (id) => {
    const updated = ideas.filter(i => i.id !== id)
    setIdeas(updated)
    localStorage.setItem('intimos_ideas', JSON.stringify(updated))
  }

  const handleLike = (id) => {
    const updated = ideas.map(i => i.id === id ? { ...i, likes: i.likes + 1 } : i)
    setIdeas(updated)
    localStorage.setItem('intimos_ideas', JSON.stringify(updated))
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Banco de Ideas</h1>
          <p className="text-xs text-muted">Colección de dinámicas, temas y actividades para el grupo</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nueva Idea</span>
        </Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ideas.map(idea => (
          <Card key={idea.id} className="space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent-light border border-accent/25">
                  {idea.category}
                </span>
                <button
                  onClick={() => handleDelete(idea.id)}
                  className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <h3 className="font-bold text-sm text-text-primary">{idea.title}</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{idea.description}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <button
                onClick={() => handleLike(idea.id)}
                className="flex items-center gap-1.5 text-muted hover:text-accent-light transition-colors"
              >
                <ThumbsUp size={13} />
                <span className="font-semibold">{idea.likes} votos</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nueva Idea */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Agregar Nueva Idea">
        <form onSubmit={handleAdd} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título</label>
            <input
              required
              placeholder="Ej. Dinámica de confianza a ciegas"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <textarea
              rows={4}
              required
              placeholder="Describe cómo se ejecuta o el objetivo de la idea..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full resize-none text-xs"
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!title.trim() || !description.trim()}>
              Guardar en el Banco
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
