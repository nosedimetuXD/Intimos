import React, { useState, useEffect } from 'react'
import { pointsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { 
  Trophy, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  Zap, 
  Flame, 
  Calendar,
  Heart,
  Gamepad2,
  CheckCircle2
} from 'lucide-react'
import { Card, Avatar, Empty, MedalBadge, MedalIcon, LevelBadge } from '../components/ui'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function RankingRow({ user, rank, pts, isMe, ptsAbove }) {
  return (
    <div
      className={`rounded-2xl transition-all p-3 border ${
        isMe
          ? 'bg-accent/15 border-accent/40 shadow-md shadow-accent/15 ring-1 ring-accent/30'
          : rank <= 3
            ? 'bg-card border-border/80'
            : 'bg-card/60 border-border/40 hover:bg-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <MedalBadge position={rank} size="sm" />
        </div>
        <Avatar src={user.photo} name={user.full_name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold truncate ${isMe ? 'text-accent-light' : 'text-text-primary'}`}>
              {user.full_name} {isMe ? '← tú' : ''}
            </span>
          </div>
          {isMe && rank === 1 && (
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              ¡Eres el número 1 del mes! <Flame size={11} className="text-orange-400" />
            </p>
          )}
          {isMe && rank > 1 && ptsAbove > 0 && (
            <p className="text-[10px] text-amber-400 font-medium mt-0.5">↑ {ptsAbove} pts para el puesto {rank - 1}</p>
          )}
          {!isMe && (
            <div className="mt-1">
              <LevelBadge level={user.level || 'Semilla'} size="xs" />
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-black text-accent-light">{pts} pts</p>
        </div>
      </div>
    </div>
  )
}

export default function CommunityScreen() {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState('ranking') // 'ranking' | 'reflexiones' | 'actividad'
  const [rankingSubtab, setRankingSubtab] = useState('mes') // 'mes' | 'global'
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reflections, setReflections] = useState([])

  const loadRanking = async () => {
    try {
      const res = await pointsApi.getRanking()
      setRanking(res || [])
    } catch (err) {
      console.error('Error fetching ranking:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRanking()
    // Load local community reflections
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_community_reflections') || '[]')
      setReflections(stored)
    } catch {}
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadRanking()
  }

  // Sort according to subtab
  const sortedRanking = [...ranking].sort((a, b) => {
    if (rankingSubtab === 'mes') {
      return (b.month_points || 0) - (a.month_points || 0)
    }
    return (b.total_points || 0) - (a.total_points || 0)
  })

  const myRank = sortedRanking.findIndex(u => u.user_id === currentUser?.id) + 1
  const aboveUser = myRank > 1 ? sortedRanking[myRank - 2] : null
  const myPts = rankingSubtab === 'mes'
    ? sortedRanking.find(u => u.user_id === currentUser?.id)?.month_points ?? 0
    : sortedRanking.find(u => u.user_id === currentUser?.id)?.total_points ?? 0
  const abovePts = aboveUser 
    ? (rankingSubtab === 'mes' ? aboveUser.month_points : aboveUser.total_points) 
    : 0
  const ptsAbove = aboveUser ? Math.max(0, abovePts - myPts) : 0

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-text-primary tracking-tight">Comunidad</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-card border border-border text-muted hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accent-light' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setTab('ranking')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            tab === 'ranking' 
              ? 'bg-accent text-white shadow-md shadow-accent/25' 
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          <Trophy size={14} />
          <span>Ranking</span>
        </button>
        <button
          onClick={() => setTab('reflexiones')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            tab === 'reflexiones' 
              ? 'bg-accent text-white shadow-md shadow-accent/25' 
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          <BookOpen size={14} />
          <span>Reflexiones ({reflections.length})</span>
        </button>
        <button
          onClick={() => setTab('actividad')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            tab === 'actividad' 
              ? 'bg-accent text-white shadow-md shadow-accent/25' 
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          <Zap size={14} />
          <span>Actividad</span>
        </button>
      </div>

      {/* Tab 1: Ranking */}
      {tab === 'ranking' && (
        <div className="space-y-4">
          {/* Subtabs: Este Mes / Histórico */}
          <div className="flex bg-card p-1 rounded-2xl border border-border">
            <button
              onClick={() => setRankingSubtab('mes')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                rankingSubtab === 'mes'
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-text-primary'
              }`}
            >
              Mes Actual
            </button>
            <button
              onClick={() => setRankingSubtab('global')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                rankingSubtab === 'global'
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-text-primary'
              }`}
            >
              Puntos Totales
            </button>
          </div>

          {/* Ranking Cards list */}
          <div className="space-y-2">
            {loading ? (
              <div className="py-16 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
                <RefreshCw size={20} className="animate-spin text-accent-light" />
                <span>Cargando ranking...</span>
              </div>
            ) : sortedRanking.length === 0 ? (
              <Empty
                icon={Trophy}
                title="Sin datos en el ranking"
                subtitle="Sé el primero en ganar puntos completando misiones o asistiendo a los servicios."
              />
            ) : (
              sortedRanking.map((user, idx) => {
                const isMe = user.user_id === currentUser?.id
                const pts = rankingSubtab === 'mes' ? user.month_points : user.total_points
                return (
                  <RankingRow
                    key={user.user_id}
                    user={user}
                    rank={idx + 1}
                    pts={pts}
                    isMe={isMe}
                    ptsAbove={isMe ? ptsAbove : 0}
                  />
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Reflexiones de la Comunidad */}
      {tab === 'reflexiones' && (
        <div className="space-y-3">
          {reflections.length === 0 ? (
            <Empty
              icon={BookOpen}
              title="Aún no hay reflexiones públicas hoy"
              subtitle="Ve a Inicio, lee el versículo del día y comparte tu meditación con el grupo."
            />
          ) : (
            reflections.map((ref, i) => (
              <Card key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={ref.author} size="xs" />
                    <span className="text-xs font-bold text-text-primary">{ref.author}</span>
                  </div>
                  <span className="text-[10px] text-muted">{ref.date}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed italic bg-card2 p-3 rounded-xl border border-border/50">
                  "{ref.text}"
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted">
                  <button className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                    <Heart size={13} className="text-rose-400" />
                    <span>Amén</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Actividad */}
      {tab === 'actividad' && (
        <div className="space-y-2">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-primary">Servidores activos este mes</p>
                <p className="text-[11px] text-muted">Grupo juvenil Íntimos · Comunidad De Cerca</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">En vivo</span>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-accent-light flex items-center justify-center font-bold">
                <Gamepad2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-primary">Desafíos Bíblicos Disponibles</p>
                <p className="text-[11px] text-muted">¡Gana hasta 200 puntos hoy en Verso Flash y Reto 60!</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
