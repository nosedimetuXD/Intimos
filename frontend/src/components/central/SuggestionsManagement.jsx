import React, { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle2, Clock, Filter, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { suggestionsApi } from '../../api'
import { Card, Empty, Avatar } from '../ui'

const CATEGORIES = ['Todas', 'Dinámica', 'Tema de servicio', 'Mejora de la app', 'Otro']
const STATUS_OPTIONS = [
  { value: 'recibida', label: 'Recibida', color: 'bg-accent/15 text-accent-light border-accent/30' },
  { value: 'en_revision', label: 'En revisión', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'implementada', label: 'Implementada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
]

export default function SuggestionsManagement() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('Todas')

  const loadSuggestions = async () => {
    try {
      const data = await suggestionsApi.getAll()
      setSuggestions(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  const changeStatus = async (id, newStatus) => {
    try {
      await suggestionsApi.updateStatus(id, newStatus)
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    } catch (err) {
      alert(err.message || 'Error al actualizar estado')
    }
  }

  const filtered = suggestions
    .filter(s => catFilter === 'Todas' || s.category === catFilter)
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))

  const countRecibidas = suggestions.filter(s => s.status === 'recibida').length
  const countRevision = suggestions.filter(s => s.status === 'en_revision' || s.status === 'en_consideracion').length
  const countImplementadas = suggestions.filter(s => s.status === 'implementada').length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Buzón de Sugerencias</h1>
          <p className="text-xs text-muted">Feedback y propuestas enviadas por los jóvenes desde "Mi Voz"</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              catFilter === cat
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card text-muted border border-border hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-card rounded-xl border border-border text-center">
          <p className="text-lg font-black text-text-primary">{countRecibidas}</p>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Recibidas</p>
        </div>
        <div className="p-3 bg-card rounded-xl border border-border text-center">
          <p className="text-lg font-black text-amber-400">{countRevision}</p>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">En revisión</p>
        </div>
        <div className="p-3 bg-card rounded-xl border border-border text-center">
          <p className="text-lg font-black text-emerald-400">{countImplementadas}</p>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Implementadas</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando sugerencias...</div>
      ) : filtered.length === 0 ? (
        <Empty 
          icon={MessageSquare} 
          title="Sin sugerencias" 
          subtitle="Cuando los miembros envíen ideas aparecerán aquí." 
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const currentStatusObj = STATUS_OPTIONS.find(so => so.value === s.status) || STATUS_OPTIONS[0]
            return (
              <Card key={s.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar src={s.user_photo} name={s.user_name || 'Miembro'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-text-primary">{s.user_name || 'Anónimo'}</p>
                        <span className="text-[10px] font-semibold text-muted bg-card2 px-2 py-0.5 rounded-full border border-border">
                          {s.category || 'General'}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentStatusObj.color}`}>
                        {currentStatusObj.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">
                      {format(new Date(s.created_at || s.date || Date.now()), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed bg-card2 p-3 rounded-xl border border-border">
                  "{s.content || s.text}"
                </p>

                {/* Status action buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted text-[11px] font-medium">Cambiar estado:</span>
                  <div className="flex gap-1.5">
                    {STATUS_OPTIONS.map(st => (
                      <button
                        key={st.value}
                        onClick={() => changeStatus(s.id, st.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          s.status === st.value
                            ? st.color
                            : 'bg-card2 border-border text-muted hover:text-text-primary'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
