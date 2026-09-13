import React, { useState, useEffect } from 'react'
import { Lightbulb, Plus, Trash2, Edit2, BookOpen, Zap, Tag, ThumbsUp, X } from 'lucide-react'
import { ideasApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

const IDEA_TYPES = [
  { value: 'serie', label: 'Serie / Tema', icon: BookOpen, color: '#2563EB' },
  { value: 'dinamica', label: 'Dinámica', icon: Zap, color: '#F59E0B' },
]

const DIN_CATEGORIES = ['Temática', 'Parche', 'Post-servicio']

export default function IdeasBank() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [tagInput, setTagInput] = useState('')
  
  const [form, setForm] = useState({
    type: 'serie',
    title: '',
    description: '',
    category: 'Temática',
    tags: []
  })

  const loadIdeas = async () => {
    try {
      const list = await ideasApi.list()
      setIdeas(list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIdeas()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({
      type: 'serie',
      title: '',
      description: '',
      category: 'Temática',
      tags: []
    })
    setTagInput('')
    setShowModal(true)
  }

  const handleOpenEdit = (idea) => {
    setEditingId(idea.id)
    setForm({
      type: idea.type || 'serie',
      title: idea.title || '',
      description: idea.description || '',
      category: idea.category || 'Temática',
      tags: Array.isArray(idea.tags) ? idea.tags : []
    })
    setTagInput('')
    setShowModal(true)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return

    try {
      if (editingId) {
        await ideasApi.update(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          type: form.type,
          tags: form.tags
        })
      } else {
        await ideasApi.create({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          type: form.type,
          tags: form.tags
        })
      }
      setShowModal(false)
      loadIdeas()
    } catch (err) {
      alert(err.message || 'Error al guardar idea')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta idea del banco?')) return
    try {
      await ideasApi.delete(id)
      setIdeas(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const filtered = filter === 'all' 
    ? ideas 
    : filter === 'serie' 
      ? ideas.filter(i => i.type === 'serie')
      : ideas.filter(i => i.type === 'dinamica' && (filter === 'dinamica' || i.category === filter))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Banco de Ideas</h1>
          <p className="text-xs text-muted">Colección de dinámicas, temas y actividades para el grupo</p>
        </div>
        <Btn onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Nueva Idea</span>
        </Btn>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'serie', label: 'Series y Temas' },
          { id: 'dinamica', label: 'Dinámicas' },
          ...DIN_CATEGORIES.map(c => ({ id: c, label: c }))
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card2 text-muted border border-border hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando ideas...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs text-muted">No se encontraron ideas en esta categoría.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(idea => {
            const isSerie = idea.type === 'serie'
            const Icon = isSerie ? BookOpen : Zap
            const color = isSerie ? '#2563EB' : '#F59E0B'

            return (
              <Card key={idea.id} className="space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="p-1 rounded-lg"
                        style={{ background: `${color}20`, color }}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card2 border border-border text-text-secondary">
                        {idea.category || (isSerie ? 'Serie' : 'Dinámica')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(idea)}
                        className="p-1 rounded-lg text-muted hover:text-text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary">{idea.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{idea.description}</p>
                  
                  {Array.isArray(idea.tags) && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {idea.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card2 border border-border text-muted">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
                  <span>{idea.type === 'serie' ? 'Prédica / Serie' : 'Actividad'}</span>
                  <span>{new Date(idea.created_at || Date.now()).toLocaleDateString('es-ES')}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Nueva / Editar Idea */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? 'Editar Idea' : 'Agregar Nueva Idea'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Tipo</label>
              <select 
                value={form.type} 
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {IDEA_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Categoría</label>
              <select 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {DIN_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título</label>
            <input
              required
              placeholder="Ej. Serie: Identidad en un Mundo Digital"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <textarea
              rows={4}
              required
              placeholder="Describe el objetivo, los puntos clave o la dinámica..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full resize-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Etiquetas</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Ej. jóvenes, fe, redes"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Btn size="sm" variant="secondary" type="button" onClick={handleAddTag}>
                <Plus size={14} />
              </Btn>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {form.tags.map(t => (
                  <span 
                    key={t}
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-accent/15 border border-accent/30 text-accent-light cursor-pointer hover:bg-accent/25"
                  >
                    <span>{t}</span>
                    <X size={10} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-2">
            <Btn type="submit" fullWidth disabled={!form.title.trim() || !form.description.trim()}>
              {editingId ? 'Actualizar Idea' : 'Guardar en el Banco'}
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
