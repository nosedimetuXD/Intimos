import React, { useState, useEffect } from 'react'
import { Swords, CheckCircle2, BarChart2, Zap, Settings, BookOpen, HelpCircle, Timer } from 'lucide-react'
import { Card, Btn } from '../ui'

const GAMES = [
  { id: 'verso_flash', name: 'Verso Flash', icon: BookOpen, color: 'text-blue-400', desc: 'Identifica citas y libros', defaultActive: true },
  { id: 'que_harias', name: '¿Qué Harías?', icon: HelpCircle, color: 'text-amber-400', desc: 'Decisiones basadas en Jesús', defaultActive: true },
  { id: 'reto_60', name: 'Reto 60 seg', icon: Timer, color: 'text-orange-400', desc: 'Velocidad y conocimiento', defaultActive: true },
  { id: 'verdadero_falso', name: 'Verdadero o Falso', icon: CheckCircle2, color: 'text-emerald-400', desc: 'Mitos y verdades bíblicas', defaultActive: true },
]

export default function DailyChallengeManagement() {
  const [activeGames, setActiveGames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('intimos_active_games') || JSON.stringify(['verso_flash', 'que_harias', 'reto_60', 'verdadero_falso']))
    } catch {
      return ['verso_flash', 'que_harias', 'reto_60', 'verdadero_falso']
    }
  })

  const toggleGame = (id) => {
    let next
    if (activeGames.includes(id)) {
      next = activeGames.filter(g => g !== id)
    } else {
      next = [...activeGames, id]
    }
    setActiveGames(next)
    localStorage.setItem('intimos_active_games', JSON.stringify(next))
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Gestión de Daily Challenge</h1>
          <p className="text-xs text-muted">Configuración de juegos bíblicos diarios</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <Swords size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3.5 text-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Juegos Disponibles</p>
          <p className="text-xl font-black text-accent-light mt-0.5">{activeGames.length} / 4</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Tope Diario</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">200 pts/día</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Módulos de Juegos Diarios
        </h2>

        <div className="space-y-2">
          {GAMES.map(g => {
            const isActive = activeGames.includes(g.id)
            return (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-card2 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-card border border-border ${g.color}`}>
                    <g.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-text-primary">{g.name}</h3>
                    <p className="text-[11px] text-muted">{g.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleGame(g.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-card border-border text-muted'
                  }`}
                >
                  {isActive ? 'Activo' : 'Pausado'}
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
