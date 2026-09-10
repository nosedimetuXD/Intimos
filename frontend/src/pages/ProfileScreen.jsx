import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { pointsApi } from '../api'
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
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Avatar, Btn, Badge } from '../components/ui'

const LEVEL_EMOJIS = {
  'Semilla': '🌱',
  'Buscador': '🔍',
  'Discípulo': '🌿',
  'Guerrero': '⚔️',
  'Pilar': '🏛️',
  'Líder': '👑'
}

const BADGES = [
  { id: 'first_login', name: 'Primer Paso', icon: '👣', desc: 'Iniciaste sesión en la app' },
  { id: 'streak_3', name: 'Constante', icon: '🔥', desc: 'Racha de 3 días activo' },
  { id: 'verse_reader', name: 'Buscador', icon: '📖', desc: 'Medita en el versículo del día' },
  { id: 'quiz_master', name: 'Sabio', icon: '⚡', desc: 'Completa un reto bíblico con 100%' },
  { id: 'church_fellow', name: 'Fiel', icon: '⛪', desc: 'Asiste a los servicios juveniles' },
]

export default function ProfileScreen() {
  const { currentUser, totalPoints, monthPoints, level, logout } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pointsApi.getHistory(30)
      .then(res => setHistory(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const levelEmoji = LEVEL_EMOJIS[level] || '🌱'

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar src={currentUser?.photo} name={currentUser?.full_name} size="xl" />
            <div className="absolute -bottom-1 -right-1 text-xl leading-none drop-shadow">
              {levelEmoji}
            </div>
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
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent-light">
                {levelEmoji} {level}
              </span>
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

      {/* Badges / Insignias */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-amber-400" />
          <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Insignias de Fidelidad
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {BADGES.map((b, idx) => (
            <div
              key={b.id}
              title={`${b.name} — ${b.desc}`}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                idx < 3
                  ? 'bg-accent/10 border-accent/30 shadow-sm'
                  : 'bg-card2/50 border-border/60 opacity-40'
              }`}
            >
              <span className="text-2xl mb-1">{b.icon}</span>
              <span className="text-[9px] font-bold text-text-primary truncate w-full leading-tight">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Historial de Puntos */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent-light" />
            <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
              Historial de Puntos
            </h2>
          </div>
          <span className="text-[10px] text-muted font-medium">Últimos movimientos</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted">Cargando movimientos...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">Aún no tienes movimientos registrados.</div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border/70 text-xs"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-text-primary truncate leading-snug">{h.reason}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {format(new Date(h.created_at), "d 'de' MMMM, h:mm a", { locale: es })}
                  </p>
                </div>
                <span className={`font-black text-xs flex-shrink-0 ${
                  h.points >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {h.points >= 0 ? `+${h.points}` : h.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* LogOut action */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
      >
        <LogOut size={16} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  )
}
