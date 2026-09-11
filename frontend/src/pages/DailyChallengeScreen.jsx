import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Swords, 
  Flame, 
  Lock, 
  CheckCircle, 
  ChevronRight, 
  Sparkles,
  Zap,
  HelpCircle,
  Timer,
  CheckSquare,
  CaseUpper,
  AlignLeft,
  BookOpen,
  CheckCircle2,
  Type,
  Shuffle
} from 'lucide-react'
import { Card, ProgressBar, LevelIcon, LevelBadge } from '../components/ui'

const LEVEL_THRESHOLDS = [
  { name: 'Semilla', min: 0, max: 200 },
  { name: 'Buscador', min: 200, max: 600 },
  { name: 'Discípulo', min: 600, max: 1500 },
  { name: 'Guerrero', min: 1500, max: 3500 },
  { name: 'Pilar', min: 3500, max: 7000 },
  { name: 'Líder', min: 7000, max: Infinity },
]

export default function DailyChallengeScreen() {
  const navigate = useNavigate()
  const { currentUser, totalPoints, level } = useAuth()

  // Find level bounds
  const currentLvlConfig = LEVEL_THRESHOLDS.find(l => l.name === level) || LEVEL_THRESHOLDS[0]
  const ptsInLevel = Math.max(0, totalPoints - currentLvlConfig.min)
  const ptsNeeded = currentLvlConfig.max === Infinity ? 0 : currentLvlConfig.max - currentLvlConfig.min
  const progressPct = currentLvlConfig.max === Infinity ? 100 : Math.min(100, Math.round((ptsInLevel / ptsNeeded) * 100))

  const todayStr = new Date().toISOString().split('T')[0]

  // Track completed games locally
  const checkGameCompleted = (type) => {
    return !!localStorage.getItem(`intimos_game_${type}_${todayStr}_${currentUser?.id}`)
  }

  const activeGames = [
    {
      id: 'verso_flash',
      name: 'Verso Flash',
      icon: BookOpen,
      iconColor: 'text-blue-400',
      desc: 'Identifica citas y libros en preguntas rápidas.',
      path: '/retos/verso_flash',
      color: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
      pts: '100 pts'
    },
    {
      id: 'que_harias',
      name: '¿Qué Harías?',
      icon: HelpCircle,
      iconColor: 'text-amber-400',
      desc: 'Decisiones basadas en enseñanzas de Jesús.',
      path: '/retos/que_harias',
      color: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30',
      pts: '100 pts'
    },
    {
      id: 'reto_60',
      name: 'Reto 60 seg',
      icon: Timer,
      iconColor: 'text-orange-400',
      desc: '60 segundos para responder la mayor cantidad posible.',
      path: '/retos/reto_60',
      color: 'from-orange-500/20 to-orange-600/5',
      border: 'border-orange-500/30',
      pts: '100 pts'
    },
    {
      id: 'verdadero_falso',
      name: 'Verdadero o Falso',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      desc: 'Mitos y verdades con explicación detallada.',
      path: '/retos/verdadero_falso',
      color: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30',
      pts: '100 pts'
    },
  ]

  const repertorioGames = [
    {
      id: 'ahorcado',
      name: 'Ahorcado Bíblico',
      icon: Type,
      iconColor: 'text-purple-400',
      path: '/retos/ahorcado',
      color: 'from-purple-500/15 to-purple-600/5',
      border: 'border-purple-500/20',
      badge: 'Palabras'
    },
    {
      id: 'ordena_verso',
      name: 'Ordena el Versículo',
      icon: Shuffle,
      iconColor: 'text-cyan-400',
      path: '/retos/ordena_verso',
      color: 'from-cyan-500/15 to-cyan-600/5',
      border: 'border-cyan-500/20',
      badge: 'Memoria'
    },
  ]

  const completedCount = activeGames.filter(g => checkGameCompleted(g.id)).length

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Swords size={20} className="text-accent-light" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Daily Challenge</h1>
          <p className="text-xs text-muted">Entrena tu fe y conocimiento cada día</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs font-black text-orange-300">Racha</span>
        </div>
      </div>

      {/* Level Progress Card */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-card2 border border-border flex items-center justify-center flex-shrink-0">
              <LevelIcon level={level} size={22} />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">{level}</p>
              <p className="text-[11px] text-muted">
                {totalPoints.toLocaleString()} pts acumulados
              </p>
            </div>
          </div>
          {currentLvlConfig.max !== Infinity && (
            <span className="text-xs text-muted font-semibold">
              {ptsInLevel} / {ptsNeeded} pts
            </span>
          )}
        </div>

        <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden border border-border">
          <div 
            className="h-full rounded-full transition-all duration-700 bg-accent"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
          <span>{currentLvlConfig.max === Infinity ? '¡Nivel máximo alcanzado!' : `Progreso del nivel: ${progressPct}%`}</span>
          <span className="text-amber-400 font-semibold">Tope máx: 200 pts/día</span>
        </div>
      </Card>

      {/* Level Map / Tu Camino */}
      <div>
        <p className="text-xs font-bold text-accent-light uppercase tracking-wider mb-4">
          Tu camino de hoy
        </p>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border pointer-events-none" />

          {/* Active Level Block */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/30 border-2 border-accent flex items-center justify-center flex-shrink-0 z-10 mt-1 animate-pulse shadow-lg shadow-accent/25">
              <Swords size={18} className="text-accent-light" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-black text-text-primary">Desafíos del Día</p>
                  <p className="text-xs text-muted">{completedCount}/{activeGames.length} completados hoy</p>
                </div>
                {completedCount === activeGames.length && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
                    <CheckCircle2 size={12} /> ¡Completado!
                  </span>
                )}
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeGames.map((game) => {
                  const done = checkGameCompleted(game.id)
                  const IconComp = game.icon
                  return (
                    <button
                      key={game.id}
                      onClick={() => navigate(game.path)}
                      className={`p-3.5 rounded-2xl border bg-gradient-to-br text-left transition-all hover:scale-[1.01] active:scale-[0.98] ${game.color} ${game.border}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl bg-black/20 ${game.iconColor}`}>
                          <IconComp size={20} />
                        </div>
                        {done ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                            <CheckCircle size={10} /> +{game.pts}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-accent-light bg-accent/20 px-2 py-0.5 rounded-full border border-accent/30">
                            +{game.pts}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-text-primary text-xs">{game.name}</p>
                      <p className="text-[10px] text-muted mt-0.5 leading-snug">{game.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repertorio Adicional de Juegos */}
      <div className="pt-3">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
          Repertorio de Juegos
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {repertorioGames.map((game) => {
            const IconComp = game.icon
            return (
              <button
                key={game.id}
                onClick={() => navigate(game.path)}
                className={`p-3.5 rounded-2xl border bg-gradient-to-br text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${game.color} ${game.border}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-black/20 ${game.iconColor}`}>
                    <IconComp size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary bg-card/80 px-2 py-0.5 rounded-full border border-border">
                    {game.badge}
                  </span>
                </div>
                <p className="font-bold text-text-primary text-xs">{game.name}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
