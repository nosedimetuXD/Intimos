import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { pointsApi, badgesApi } from '../api'
import { 
  User, 
  Sparkles, 
  Trophy, 
  Calendar, 
  Shield, 
  History, 
  LogOut, 
  Award,
  Flame,
  Phone,
  Mail,
  Check,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Avatar, Btn, Badge, Modal, LevelBadge } from '../components/ui'
import { BADGES } from '../data/badges'
import { evaluateBadges } from '../utils/badgeEngine'

const CATEGORIES = ['Todas', 'Presencia', 'Palabra', 'Juegos', 'Comunidad', 'Servicio', 'Exclusivo']

function formatReason(reason) {
  if (!reason) return 'Movimiento de puntos'
  return reason
    .replace(/verso_flash/gi, 'Verso Flash')
    .replace(/que_harias/gi, '¿Qué Harías?')
    .replace(/reto_60/gi, 'Reto 60')
    .replace(/verdadero_falso/gi, 'Verdadero o Falso')
    .replace(/ahorcado/gi, 'Ahorcado Bíblico')
    .replace(/ordena_verso/gi, 'Ordena el Versículo')
}

export default function ProfileScreen() {
  const { currentUser, totalPoints, monthPoints, level, logout } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [backendBadges, setBackendBadges] = useState(null)

  useEffect(() => {
    pointsApi.getHistory(30)
      .then(res => setHistory(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    badgesApi.getMyProgress()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const map = {}
          res.forEach(item => {
            map[item.slug] = {
              current: item.current,
              target: item.target,
              done: item.unlocked,
              pct: item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0,
              unlockedAt: item.unlocked_at
            }
          })
          setBackendBadges(map)
        }
      })
      .catch(() => {})
  }, [currentUser?.id])

  // Evaluate badge progress
  const evaluated = useMemo(() => {
    // Gather context from local storage + user
    let reflections = []
    let gameAttempts = []
    let suggestions = []

    try {
      reflections = JSON.parse(localStorage.getItem('intimos_reflections') || '[]')
      suggestions = JSON.parse(localStorage.getItem(`intimos_voice_${currentUser?.id}`) || '[]')
    } catch {}

    const local = evaluateBadges(currentUser, {
      attendance: [],
      services: [],
      reflections,
      gameAttempts,
      ranking: [],
      suggestions
    })

    if (!backendBadges) return local

    const merged = { ...local }
    Object.keys(backendBadges).forEach(slug => {
      const bItem = backendBadges[slug]
      merged[slug] = {
        ...merged[slug],
        current: Math.max(merged[slug]?.current || 0, bItem.current),
        target: bItem.target,
        done: (merged[slug]?.done || false) || bItem.done,
        pct: Math.max(merged[slug]?.pct || 0, bItem.pct),
        unlockedAt: bItem.unlockedAt
      }
    })
    return merged
  }, [currentUser, backendBadges])

  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'Todas') return BADGES
    return BADGES.filter(b => b.group === selectedCategory)
  }, [selectedCategory])

  const unlockedCount = useMemo(() => {
    return Object.values(evaluated).filter(e => e.done).length
  }, [evaluated])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar src={currentUser?.photo} name={currentUser?.full_name} size="xl" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-black text-text-primary leading-tight truncate">
              {currentUser?.full_name}
            </h1>
            <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5 truncate">
              <Mail size={12} />
              <span>{currentUser?.email}</span>
            </p>
            {currentUser?.phone && (
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <Phone size={12} />
                <span>{currentUser.phone}</span>
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-2">
              <LevelBadge level={level} size="sm" />
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-card2 border border-border text-text-secondary capitalize">
                {currentUser?.role || 'Miembro'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-border">
          <div className="p-3 rounded-xl bg-card2 border border-border text-center">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Mes actual</p>
            <p className="text-xl font-black text-accent-light mt-0.5">{monthPoints.toLocaleString()}</p>
            <p className="text-[10px] text-muted font-medium">pts para ranking</p>
          </div>

          <div className="p-3 rounded-xl bg-card2 border border-border text-center">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Puntos totales</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{totalPoints.toLocaleString()}</p>
            <p className="text-[10px] text-muted font-medium">acumulados</p>
          </div>
        </div>
      </Card>

      {/* Badges / Insignias Section */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Insignias y Logros
            </h2>
          </div>
          <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/25">
            {unlockedCount} / {BADGES.length} desbloqueados
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card2 text-muted border border-border hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1">
          {filteredBadges.map(badge => {
            const status = evaluated[badge.id] || { current: 0, target: badge.target, done: false, pct: 0 }
            const IconComp = badge.icon

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge({ ...badge, ...status })}
                className={`p-3 rounded-2xl border text-center transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-between min-h-[90px] ${
                  status.done
                    ? badge.tier === 'exclusivo'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-accent/15 border-accent/40 text-accent-light shadow-md shadow-accent/10'
                    : 'bg-card2/50 border-border/60 text-muted opacity-50 hover:opacity-80'
                }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1">
                  <IconComp size={20} className={status.done ? (badge.tier === 'exclusivo' ? 'text-amber-400' : 'text-accent-light') : 'text-muted'} />
                </div>
                <p className="text-[10px] font-bold leading-tight truncate w-full">
                  {badge.name}
                </p>

                {/* Progress bar on locked */}
                {!status.done && (
                  <div className="w-full bg-border/60 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${status.pct}%` }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Historial de Puntos */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent-light" />
            <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Historial de Puntos Recientes
            </h2>
          </div>
          <span className="text-[10px] text-muted font-semibold">Últimos 30 días</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted">Cargando historial...</div>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">
            Aún no tienes movimientos de puntos registrados.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div 
                key={h.id || i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card2/60 border border-border/50 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} className="text-accent-light" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary leading-tight">{formatReason(h.reason)}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {h.created_at ? format(new Date(h.created_at), "d 'de' MMMM", { locale: es }) : 'Reciente'}
                    </p>
                  </div>
                </div>
                <span className="font-black text-emerald-400">
                  +{h.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Logout Action */}
      <div className="pt-2">
        <Btn fullWidth variant="danger" onClick={logout}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </Btn>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          open={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
          title="Detalle del Logro"
        >
          <div className="p-5 text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-inner ${
              selectedBadge.done 
                ? 'bg-accent/20 border-accent/40 text-accent-light' 
                : 'bg-card2 border-border text-muted'
            }`}>
              <selectedBadge.icon size={32} />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-black text-base text-text-primary">{selectedBadge.name}</h3>
                {selectedBadge.tier === 'exclusivo' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    Exclusivo
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1">{selectedBadge.desc}</p>
            </div>

            {/* Status Info */}
            <div className="p-3.5 rounded-xl bg-card2 border border-border text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-bold">Estado:</span>
                {selectedBadge.done ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Desbloqueado
                  </span>
                ) : (
                  <span className="text-muted font-bold flex items-center gap-1">
                    <Lock size={12} /> Bloqueado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-bold">Progreso:</span>
                <span className="font-bold text-text-primary">
                  {selectedBadge.current} / {selectedBadge.target} ({selectedBadge.pct}%)
                </span>
              </div>

              <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-border">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedBadge.pct}%` }}
                />
              </div>
            </div>

            <Btn fullWidth onClick={() => setSelectedBadge(null)}>
              <span>Cerrar</span>
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
