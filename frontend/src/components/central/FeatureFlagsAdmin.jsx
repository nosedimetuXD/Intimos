import React, { useState, useEffect } from 'react'
import { Settings, CheckCircle2, Shield } from 'lucide-react'
import { Card, Btn } from '../ui'

const FEATURES = [
  { id: 'musica', label: 'Música / Spotify', desc: 'Permite a los miembros acceder a las playlists' },
  { id: 'biblia', label: 'Lector Bíblico', desc: 'Habilita la consulta de la Biblia RVR1960 y NVI' },
  { id: 'dailyChallenge', label: 'Daily Challenge', desc: 'Habilita los retos y trivias bíblicas diarias' },
  { id: 'miVoz', label: 'Buzón Mi Voz', desc: 'Permite el envío de sugerencias y feedback' },
  { id: 'ranking', label: 'Ranking Público', desc: 'Muestra la tabla de posiciones a toda la comunidad' },
]

export default function FeatureFlagsAdmin() {
  const [flags, setFlags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('intimos_feature_flags') || '{}')
    } catch {
      return {}
    }
  })
  const [saved, setSaved] = useState(false)

  const toggleFlag = (id) => {
    const next = { ...flags, [id]: flags[id] === false ? true : false }
    setFlags(next)
    localStorage.setItem('intimos_feature_flags', JSON.stringify(next))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Funcionalidades</h1>
          <p className="text-xs text-muted">Control de visibilidad y acceso a módulos de la app</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <Settings size={20} />
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Cambios guardados</span>
        </div>
      )}

      <Card className="space-y-3">
        <div className="divide-y divide-border">
          {FEATURES.map(f => {
            const isEnabled = flags[f.id] !== false
            return (
              <div key={f.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-text-primary">{f.label}</h3>
                  <p className="text-[11px] text-muted">{f.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(f.id)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isEnabled ? 'bg-accent justify-end' : 'bg-card2 border border-border justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
