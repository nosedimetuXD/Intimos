import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { QrCode, Sparkles, CheckCircle2, ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function CheckInScreen() {
  const [upcomingService, setUpcomingService] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [error, setError] = useState('')

  const { refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    servicesApi.getUpcoming()
      .then(res => setUpcomingService(res))
      .catch(() => setUpcomingService(null))
  }, [])

  const handleCheckIn = async (e) => {
    e.preventDefault()
    if (!upcomingService) return
    setError('')
    setLoading(true)

    try {
      const res = await servicesApi.checkIn(upcomingService.id, code.trim())
      setSuccessResult(res)
      await refreshProfile()

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (err) {
      setError(err.message || 'Error al procesar check-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-black text-white">Registro de Asistencia (QR)</h1>
      </div>

      {successResult ? (
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-white">¡Asistencia Confirmada!</h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">{successResult.message}</p>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-bold px-4 py-2 rounded-full text-sm border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>+{successResult.points_earned} Puntos Ganados</span>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
          {upcomingService ? (
            <>
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">{upcomingService.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Introduce el código o escanea el QR proyectado por el equipo pastoral.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Código de Asistencia / QR Token
                  </label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Código mostrado en pantalla (opcional si es token único)"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{loading ? 'Confirmando...' : 'Confirmar mi Asistencia'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No hay ningún servicio activo en este momento.</p>
              <p className="text-[11px] text-slate-500 mt-1">El check-in se abre los días de reunión.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
