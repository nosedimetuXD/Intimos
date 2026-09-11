import React, { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle2, Clock, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Empty } from '../ui'

export default function SuggestionsManagement() {
  const [suggestions, setSuggestions] = useState([])
  const [filter, setFilter] = useState('all')

  const loadSuggestions = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_suggestions') || '[]')
      setSuggestions(stored)
    } catch {}
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  const updateStatus = (id, newStatus) => {
    try {
      const updated = suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s)
      localStorage.setItem('intimos_suggestions', JSON.stringify(updated))
      setSuggestions(updated)
    } catch {}
  }

  const filtered = suggestions.filter(s => filter === 'all' || s.status === filter)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Buzón de Sugerencias</h1>
          <p className="text-xs text-muted">Feedback y propuestas enviadas por los jóvenes desde "Mi Voz"</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          ['all', 'Todas'],
          ['recibida', 'Recibidas'],
          ['en_revision', 'En revisión'],
          ['implementada', 'Implementadas']
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === val
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card text-muted border border-border hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon={MessageSquare} title="No hay sugerencias en esta categoría" subtitle="Cuando los miembros envíen ideas aparecerán aquí." />
      ) : (
        <div className="space-y-3">
          {filtered.map(sug => (
            <Card key={sug.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">{sug.userName}</span>
                  <span className="text-[10px] text-muted bg-card2 px-2 py-0.5 rounded-full border border-border">
                    {sug.category}
                  </span>
                </div>
                <span className="text-[10px] text-muted">
                  {format(new Date(sug.date), "d 'de' MMMM", { locale: es })}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed bg-card2 p-3 rounded-xl border border-border/40">
                "{sug.text}"
              </p>

              {/* Status updater controls */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-muted text-[11px] font-medium">Estado actual:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateStatus(sug.id, 'recibida')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      sug.status === 'recibida' ? 'bg-accent/20 border-accent text-accent-light' : 'bg-card2 border-border text-muted'
                    }`}
                  >
                    Recibida
                  </button>
                  <button
                    onClick={() => updateStatus(sug.id, 'en_revision')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      sug.status === 'en_revision' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-card2 border-border text-muted'
                    }`}
                  >
                    En revisión
                  </button>
                  <button
                    onClick={() => updateStatus(sug.id, 'implementada')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      sug.status === 'implementada' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-card2 border-border text-muted'
                    }`}
                  >
                    Implementada
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
