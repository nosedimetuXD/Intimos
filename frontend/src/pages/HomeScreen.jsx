import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesApi, pointsApi, centralApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Bell, 
  CheckCircle2,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function HomeScreen() {
  const { currentUser, totalPoints, level } = useAuth()
  const navigate = useNavigate()

  const [upcomingService, setUpcomingService] = useState(null)
  const [topRanking, setTopRanking] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [serviceData, rankingData, announcementsData] = await Promise.all([
          servicesApi.getUpcoming().catch(() => null),
          pointsApi.getRanking().catch(() => []),
          centralApi.getAnnouncements().catch(() => []),
        ])

        setUpcomingService(serviceData)
        setTopRanking((rankingData || []).slice(0, 3))
        setAnnouncements(announcementsData || [])
      } catch (err) {
        console.error('Error loading home data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHomeData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Announcements Banner if any */}
      {announcements.length > 0 && (
        <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-indigo-200">{announcements[0].title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{announcements[0].content}</p>
          </div>
        </div>
      )}

      {/* Hero: Next Service Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Próximo Encuentro
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> +300 pts
          </span>
        </div>

        {upcomingService ? (
          <>
            <h2 className="text-lg font-black text-white">{upcomingService.title}</h2>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  {format(new Date(upcomingService.scheduled_at), "EEEE, d 'de' MMMM · h:mm a", { locale: es })}
                </span>
              </div>
              {upcomingService.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{upcomingService.location}</span>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => navigate('/checkin')}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Escanear QR de Asistencia</span>
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-400 font-medium">No hay servicios programados próximamente.</p>
            <p className="text-[11px] text-slate-500 mt-1">¡El equipo pastoral publicará la fecha pronto!</p>
          </div>
        )}
      </div>

      {/* Daily Verse Card */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Versículo del Día</h3>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            Filipenses 4:13
          </span>
        </div>
        <blockquote className="text-sm font-medium text-slate-200 italic leading-relaxed">
          "Todo lo puedo en Cristo que me fortalece."
        </blockquote>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Medita en Su palabra hoy</span>
          <button
            onClick={() => navigate('/biblia')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Leer Biblia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Daily Missions */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Misiones de Hoy
        </h3>

        <div className="space-y-2.5">
          <div 
            onClick={() => navigate('/retos')}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-indigo-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                🎮
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Completar un Reto Bíblico</h4>
                <p className="text-[11px] text-slate-400">Verso Flash, Reto 60 o Ahorcado</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">+100 pts</span>
          </div>

          <div 
            onClick={() => navigate('/checkin')}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-indigo-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ⛪
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Asistir al Servicio de Jóvenes</h4>
                <p className="text-[11px] text-slate-400">Llega temprano para bono de +75</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400">+375 pts</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Shortcut */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Top del Mes
          </h3>
          <button
            onClick={() => navigate('/comunidad')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topRanking.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            {topRanking.map((user, idx) => (
              <div 
                key={user.user_id}
                className={`p-3 rounded-2xl border ${
                  idx === 0 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : idx === 1 
                      ? 'bg-slate-800/40 border-slate-700/50' 
                      : 'bg-amber-800/10 border-amber-800/30'
                }`}
              >
                <div className="text-xl mb-1">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <p className="text-xs font-bold text-white truncate">{user.full_name.split(' ')[0]}</p>
                <p className="text-[11px] font-semibold text-amber-400 mt-0.5">{user.month_points} pts</p>
                <p className="text-[10px] text-slate-400">{user.level}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No hay puntuaciones registradas este mes todavía.</p>
        )}
      </div>
    </div>
  )
}
