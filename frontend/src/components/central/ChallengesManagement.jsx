import React, { useState, useEffect } from 'react'
import { Zap, Plus, Edit2, Trash2, Check, X, Repeat, Lightbulb, Users, Swords, Sparkles } from 'lucide-react'
import { challengesApi } from '../../api'
import { Card, Btn, Modal, Avatar, Empty } from '../ui'
import { CHALLENGE_IDEAS } from '../../data/challengeIdeas'

export default function ChallengesManagement() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showIdeas, setShowIdeas] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    verse: '',
    points: 100,
    daily: false,
    active: false,
  })

  const loadChallenges = async () => {
    try {
      const list = await challengesApi.listAll()
      setChallenges(list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChallenges()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return

    try {
      await challengesApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        verse: form.verse?.trim() || '',
        points: parseInt(form.points) || 100,
        daily: form.daily,
        active: form.active,
      })
      setShowForm(false)
      setForm({
        title: '',
        description: '',
        verse: '',
        points: 100,
        daily: false,
        active: false,
      })
      loadChallenges()
    } catch (err) {
      alert(err.message || 'Error al guardar reto')
    }
  }

  const handleToggle = async (id) => {
    try {
      await challengesApi.toggle(id)
      loadChallenges()
    } catch (err) {
      alert(err.message || 'Error al cambiar estado del reto')
    }
  }

  const useIdea = async (idea) => {
    try {
      await challengesApi.create({
        title: idea.title,
        description: idea.description,
        verse: idea.verse || '',
        points: 100,
        daily: idea.daily || false,
        active: false,
      })
      setShowIdeas(false)
      loadChallenges()
    } catch (err) {
      alert(err.message || 'Error al importar idea')
    }
  }

  const yaExiste = (t) => challenges.some(c => c.title === t)
  const ordered = [...challenges].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-24 sm:pb-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-text-primary flex items-center gap-2">
            <Swords className="text-amber-400" size={22} />
            <span>Retos Semanales</span>
          </h1>
          <p className="text-xs text-muted">Solo un reto semanal puede estar activo a la vez</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Btn size="sm" variant="secondary" onClick={() => setShowIdeas(true)}>
            <Lightbulb size={14} />
            <span className="hidden sm:inline">Ideas</span>
          </Btn>
          <Btn size="sm" onClick={() => setShowForm(true)}>
            <Plus size={15} />
            <span>Nuevo Reto</span>
          </Btn>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando retos...</div>
      ) : ordered.length === 0 ? (
        <Empty icon={Swords} title="Sin retos creados" subtitle="Crea un nuevo reto o importa uno de las ideas sugeridas." />
      ) : (
        <div className="space-y-3">
          {ordered.map(ch => (
            <Card 
              key={ch.id} 
              className={`space-y-3 transition-all ${
                ch.active ? 'border-accent/60 bg-accent/5' : 'bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      ch.active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-card2 text-muted border-border'
                    }`}>
                      {ch.active ? 'Activo ahora' : 'Inactivo'}
                    </span>
                    {ch.daily && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent-light border border-accent/25 flex items-center gap-1">
                        <Repeat size={10} /> Diario
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      +{ch.points || 100} pts
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-text-primary">{ch.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{ch.description}</p>
                  
                  {ch.verse && (
                    <p className="text-[11px] text-accent-light font-semibold mt-1.5 italic">
                      "{ch.verse}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(ch.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      ch.active
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-card2 border-border text-muted hover:text-text-primary'
                    }`}
                  >
                    {ch.active ? 'Desactivar' : 'Activar'}
                  </button>
                  
                  {Array.isArray(ch.completions) && ch.completions.length > 0 && (
                    <button
                      onClick={() => setSelectedDetail(ch)}
                      className="text-[11px] text-muted hover:text-accent-light flex items-center gap-1 transition-colors"
                    >
                      <Users size={12} />
                      <span>{ch.completions.length} completados</span>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo Reto */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Crear Nuevo Reto Semanal">
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título del reto</label>
            <input
              required
              placeholder="Ej. Ora por un amigo sin rendirte"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <textarea
              rows={3}
              required
              placeholder="Explica qué tiene que hacer la persona de forma concreta..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full resize-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Versículo ancla (opcional)</label>
              <input
                placeholder="Ej. Lucas 18:1"
                value={form.verse}
                onChange={e => setForm(f => ({ ...f, verse: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Puntos de recompensa</label>
              <input
                type="number"
                value={form.points}
                onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, daily: !f.daily }))}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              form.daily ? 'bg-accent/10 border-accent/40' : 'bg-card2 border-border'
            }`}
          >
            <Repeat size={16} className={form.daily ? 'text-accent-light' : 'text-muted'} />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-text-primary">Reto de hábito (diario)</p>
              <p className="text-[10px] text-muted">
                {form.daily
                  ? 'Se puede marcar cada día de la semana. (+100 pts diarios)'
                  : 'Se marca una sola vez durante la semana.'}
              </p>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.daily ? 'bg-accent' : 'bg-card'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.daily ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          <div className="pt-2 flex gap-2">
            <Btn type="submit" fullWidth disabled={!form.title.trim() || !form.description.trim()}>
              Crear Reto
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Modal Banco de Ideas */}
      <Modal open={showIdeas} onClose={() => setShowIdeas(false)} title="Ideas de Retos Recomendadas">
        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {CHALLENGE_IDEAS && CHALLENGE_IDEAS.map((idea, idx) => {
            const exists = yaExiste(idea.title)
            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-card2 border border-border flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-text-primary">{idea.title}</span>
                    {idea.daily && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-accent/15 text-accent-light border border-accent/25">
                        Diario
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{idea.description}</p>
                </div>
                <Btn 
                  size="sm" 
                  variant={exists ? 'ghost' : 'secondary'} 
                  disabled={exists}
                  onClick={() => useIdea(idea)}
                >
                  {exists ? 'Ya existe' : 'Usar'}
                </Btn>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Modal Completados Detail */}
      <Modal 
        open={!!selectedDetail} 
        onClose={() => setSelectedDetail(null)} 
        title={`Completaciones: ${selectedDetail?.title}`}
      >
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {selectedDetail?.completions && selectedDetail.completions.length > 0 ? (
            selectedDetail.completions.map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border text-xs">
                <span className="font-bold text-text-primary">{comp.user_name || comp.user_id}</span>
                <span className="text-[10px] text-muted">{new Date(comp.completed_at).toLocaleDateString('es-ES')}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-6">Aún no hay completaciones registradas.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
