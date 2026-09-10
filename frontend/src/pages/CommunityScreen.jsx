import React, { useState, useEffect } from 'react'
import { pointsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, Sparkles, Shield, User } from 'lucide-react'

export default function CommunityScreen() {
  const { currentUser } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pointsApi.getRanking()
      .then(res => setRanking(res || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-base font-black text-white">Ranking Mensual de Jóvenes</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Los puntos se reinician cada mes para dar a todos la oportunidad de destacar y ganar el premio mensual.
        </p>
      </div>

      {/* Ranking List */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 shadow-xl space-y-2">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando posiciones...</div>
        ) : ranking.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No hay participantes con puntos este mes.</div>
        ) : (
          ranking.map((item, index) => {
            const isMe = item.user_id === currentUser?.id
            return (
              <div
                key={item.user_id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isMe 
                    ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg' 
                    : index < 3
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-slate-950/30 border-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-black text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-slate-500 text-xs font-bold">#{index + 1}</span>}
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                    {item.full_name.charAt(0)}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{item.full_name}</span>
                      {isMe && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">Tú</span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{item.level}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{item.month_points}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.total_points} acumulados</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
