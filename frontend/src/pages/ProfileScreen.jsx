import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { pointsApi } from '../api'
import { User, Sparkles, Trophy, Calendar, Shield, History, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

  // Level thresholds
  const levels = [
    { name: 'Semilla', min: 0, next: 1000 },
    { name: 'Discípulo', min: 1000, next: 2500 },
    { name: 'Guerrero', min: 2500, next: 5000 },
    { name: 'Mentor', min: 5000, next: 10000 },
    { name: 'Portador de Luz', min: 10000, next: 20000 }
  ]

  const currentLevelObj = levels.find(l => l.name === level) || levels[0]
  const progressPct = Math.min(100, Math.max(0, ((totalPoints - currentLevelObj.min) / (currentLevelObj.next - currentLevelObj.min)) * 100))

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-indigo-500/30">
          {currentUser?.full_name?.charAt(0) || 'U'}
        </div>

        <div>
          <h2 className="text-lg font-black text-white">{currentUser?.full_name}</h2>
          <p className="text-xs text-slate-400 font-medium">{currentUser?.email}</p>
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-0.5 rounded-full text-[11px] font-semibold mt-2">
            <Shield className="w-3 h-3" />
            <span className="capitalize">{currentUser?.role}</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Nivel: {level}
            </span>
            <span className="text-[11px] text-slate-400">
              {totalPoints} / {currentLevelObj.next} pts
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500 text-right">
            Te faltan {Math.max(0, currentLevelObj.next - totalPoints)} pts para el siguiente nivel
          </p>
        </div>
      </div>

      {/* Points Ledger / Transaction History */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          Historial de Puntos
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Cargando historial...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No hay movimientos registrados.</div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div 
                key={h.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white leading-snug">{h.reason}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {format(new Date(h.created_at), "d 'de' MMMM, h:mm a", { locale: es })}
                  </p>
                </div>
                <div className={`font-black text-xs ${h.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {h.points >= 0 ? `+${h.points}` : h.points} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold py-3 rounded-2xl text-xs border border-rose-500/20 flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  )
}
