import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { QrCode, Sparkles, CheckCircle2, ChevronLeft, Clock, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Card, Btn } from '../components/ui'

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
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl bg-card border border-border text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-base sm:text-lg font-black text-text-primary">
          Registro de Asistencia
        </h1>
      </div>

      {successResult ? (
        <Card className="text-center space-y-4 border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-lg font-black text-text-primary">¡Asistencia Confirmada!</h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">{successResult.message}</p>
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-black px-4 py-2 rounded-full text-xs border border-emerald-500/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>+{successResult.points_earned} Puntos Ganados</span>
          </div>

          <div className="pt-3">
            <Btn fullWidth onClick={() => navigate('/home')}>
              Volver al Inicio
            </Btn>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4">
          {upcomingService ? (
            <>
              <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
                <Clock size={18} className="text-accent-light mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-text-primary">{upcomingService.title}</h3>
                  <p className="text-[11px] text-muted mt-0.5 leading-snug">
                    Ingresa el código o escanea el QR presentado durante el servicio de jóvenes.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Código de Asistencia / Token QR
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Código mostrado en pantalla (o déjalo vacío si escaneaste)"
                    autoFocus
                  />
                </div>

                <Btn
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={loading}
                >
                  <Sparkles size={16} className="text-amber-400" />
                  <span>{loading ? 'Confirmando...' : 'Confirmar Asistencia (+300 pts)'}</span>
                </Btn>
              </form>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-text-secondary font-medium">No hay ningún servicio activo en este momento.</p>
              <p className="text-[11px] text-muted mt-1">El check-in se habilita los días de reunión del grupo.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
