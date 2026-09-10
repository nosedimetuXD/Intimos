import React, { useState, useEffect } from 'react'
import { BookOpen, Search, Trash2, Heart, Users, Lock } from 'lucide-react'
import { Card, Empty } from '../ui'

export default function ReflectionsReview() {
  const [reflections, setReflections] = useState([])
  const [filter, setFilter] = useState('all')

  const loadReflections = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_community_reflections') || '[]')
      setReflections(stored)
    } catch {}
  }

  useEffect(() => {
    loadReflections()
  }, [])

  const handleDelete = (index) => {
    if (!confirm('¿Eliminar esta reflexión?')) return
    const updated = reflections.filter((_, i) => i !== index)
    setReflections(updated)
    localStorage.setItem('intimos_community_reflections', JSON.stringify(updated))
  }

  const filtered = reflections.filter(r => {
    if (filter === 'public') return r.isPublic
    if (filter === 'private') return !r.isPublic
    return true
  })

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Revisión de Reflexiones</h1>
          <p className="text-xs text-muted">Lectura y moderación de las meditaciones de los miembros</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
          <BookOpen size={20} />
        </div>
      </div>

      <div className="flex gap-1.5">
        {[['all', 'Todas'], ['public', 'Públicas'], ['private', 'Privadas']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === val ? 'bg-accent text-white shadow-sm' : 'bg-card text-muted border border-border hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="📖" title="Sin reflexiones para revisar" subtitle="Cuando los miembros mediten en el versículo del día aparecerán aquí." />
      ) : (
        <div className="space-y-3">
          {filtered.map((ref, idx) => (
            <Card key={idx} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-text-primary">{ref.author}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border flex items-center gap-1 ${
                    ref.isPublic ? 'bg-accent/10 border-accent/25 text-accent-light' : 'bg-card2 border-border text-muted'
                  }`}>
                    {ref.isPublic ? <Users size={10} /> : <Lock size={10} />}
                    <span>{ref.isPublic ? 'Pública' : 'Privada'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted">{ref.date}</span>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed bg-card2 p-3 rounded-xl border border-border/40">
                "{ref.text}"
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
