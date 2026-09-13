import React, { useState, useEffect } from 'react'
import { pointsApi, reflectionsApi, centralApi } from '../api'
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
  CheckCircle2,
  Handshake,
  Cake,
  Camera,
  Users,
  Award
} from 'lucide-react'
import { Card, Avatar, Empty, MedalBadge, MedalIcon, LevelBadge } from '../components/ui'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatReason } from '../utils/formatters'

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
  const [tab, setTab] = useState('ranking') // 'ranking' | 'padrinos' | 'reflexiones' | 'actividad' | 'cumpleanos' | 'galeria'
  const [rankingSubtab, setRankingSubtab] = useState('mes') // 'mes' | 'global'
  const [ranking, setRanking] = useState([])
  const [directory, setDirectory] = useState([])
  const [birthdays, setBirthdays] = useState([])
  const [history, setHistory] = useState([])
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [rankingData, reflectionsData, birthdaysData, historyData, dirData] = await Promise.all([
        pointsApi.getRanking().catch(() => []),
        reflectionsApi.getPublic().catch(() => []),
        centralApi.getBirthdays().catch(() => []),
        pointsApi.getHistory(30).catch(() => []),
        centralApi.getDirectory().catch(() => []),
      ])
      setRanking(rankingData || [])
      setReflections(reflectionsData || [])
      setBirthdays(birthdaysData || [])
      setHistory(historyData || [])
      setDirectory(dirData || [])
    } catch (err) {
      console.error('Error fetching community data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

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

  // Padrinos calculation
  const padrinosMap = {}
  directory.forEach(u => {
    if (u.godfather_id) {
      if (!padrinosMap[u.godfather_id]) {
        padrinosMap[u.godfather_id] = {
          mentorName: u.godfather_name || 'Padrino',
          godchildren: []
        }
      }
      padrinosMap[u.godfather_id].godchildren.push(u)
    }
  })
  const padrinosList = Object.entries(padrinosMap).map(([id, data]) => ({ id, ...data }))

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

      {/* Main Tabs (6 Tabs with Lucide Icons - No Emojis) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'ranking', label: 'Ranking', icon: Trophy },
          { id: 'padrinos', label: 'Padrinos', icon: Handshake },
          { id: 'reflexiones', label: `Reflexiones (${reflections.length})`, icon: BookOpen },
          { id: 'actividad', label: 'Actividad', icon: Zap },
          { id: 'cumpleanos', label: 'Cumpleaños', icon: Cake },
          { id: 'galeria', label: 'Galería', icon: Camera },
        ].map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                active 
                  ? 'bg-accent text-white shadow-md shadow-accent/25' 
                  : 'bg-card text-muted border border-border hover:text-text-primary'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Ranking */}
      {tab === 'ranking' && (
        <div className="space-y-4">
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

      {/* Tab 2: Padrinos */}
      {tab === 'padrinos' && (
        <div className="space-y-3">
          {padrinosList.length === 0 ? (
            <Empty
              icon={Handshake}
              title="Sin equipos de discipulado registrados"
              subtitle="Los líderes y padrinos aparecerán aquí junto con sus ahijados asignados."
            />
          ) : (
            padrinosList.map((item, idx) => (
              <Card key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent-light flex items-center justify-center font-bold">
                    <Handshake size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider">Mentor / Padrino</span>
                    <h3 className="text-sm font-bold text-text-primary">{item.mentorName}</h3>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-accent/20 space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase">Ahijados a cargo ({item.godchildren.length})</span>
                  {item.godchildren.map(child => (
                    <div key={child.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={child.full_name} size="xs" />
                        <span className="text-text-primary font-medium">{child.full_name}</span>
                      </div>
                      <span className="text-accent-light font-bold">{child.month_points || 0} pts</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Reflexiones */}
      {tab === 'reflexiones' && (
        <div className="space-y-3">
          {reflections.length === 0 ? (
            <Empty
              icon={BookOpen}
              title="Aún no hay reflexiones públicas"
              subtitle="Ve a Inicio, lee el versículo del día y comparte tu reflexión con la congregación."
            />
          ) : (
            reflections.map((ref, i) => (
              <Card key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={ref.user_name || 'Miembro'} size="xs" />
                    <div>
                      <span className="text-xs font-bold text-text-primary">{ref.user_name || 'Miembro'}</span>
                      <p className="text-[10px] text-accent-light font-bold">{ref.verse_ref}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted">
                    {ref.created_at ? format(new Date(ref.created_at), "d 'de' MMMM", { locale: es }) : 'Hoy'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed italic bg-card2 p-3 rounded-xl border border-border/50">
                  "{ref.content}"
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

      {/* Tab 4: Actividad */}
      {tab === 'actividad' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <Empty
              icon={Zap}
              title="Sin actividad reciente registrada"
              subtitle="Los puntos ganados por asistencia, dinámicas y juegos aparecerán en este feed."
            />
          ) : (
            history.map((item, i) => (
              <Card key={i} className="py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    item.points >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {item.points >= 0 ? `+${item.points}` : item.points}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{formatReason(item.reason)}</p>
                    <p className="text-[10px] text-muted capitalize">
                      {item.category} · {item.created_at ? format(new Date(item.created_at), "d 'de' MMMM, h:mm a", { locale: es }) : 'Reciente'}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Cumpleaños */}
      {tab === 'cumpleanos' && (
        <div className="space-y-3">
          {birthdays.length === 0 ? (
            <Empty
              icon={Cake}
              title="Sin fechas de cumpleaños registradas"
              subtitle="Los integrantes pueden actualizar su fecha de nacimiento en su perfil."
            />
          ) : (
            birthdays.map((u, i) => (
              <Card key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center">
                    <Cake size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{u.full_name}</h3>
                    <p className="text-[10px] text-muted">
                      {u.birthday ? format(new Date(u.birthday), "d 'de' MMMM", { locale: es }) : 'Fecha pendiente'}
                    </p>
                  </div>
                </div>
                {u.phone && (
                  <a
                    href={`https://wa.me/57${u.phone.replace(/\D/g, '')}?text=¡Feliz%20cumpleaños%20${encodeURIComponent(u.full_name)}!%20Dios%20te%20bendiga%20mucho%20en%20este%20nuevo%20año.`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 rounded-xl hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                  >
                    <span>Felicitar</span>
                  </a>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Galería */}
      {tab === 'galeria' && (
        <div className="space-y-4">
          <Card className="text-center py-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent-light flex items-center justify-center mx-auto">
              <Camera size={24} />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Galería de Recuerdos</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Revive los mejores momentos de nuestros servicios presenciales, campamentos y parches.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

