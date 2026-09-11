import React from 'react'
import { AlertCircle, Sparkles, Trophy, ChevronLeft, ShieldAlert } from 'lucide-react'
import { Card, Btn } from '../ui'

export default function GameIntro({
  title,
  desc,
  icon: Icon,
  iconColor = 'text-accent-light',
  rules = [],
  maxPoints = 100,
  onStart,
  onBack
}) {
  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Back navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition-colors font-semibold"
        >
          <ChevronLeft size={16} />
          <span>Volver a Desafíos</span>
        </button>
      )}

      <Card className="text-center space-y-4 p-6 border-accent/30 shadow-xl">
        {/* Game Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-card2 border border-border flex items-center justify-center shadow-inner">
          {Icon && <Icon size={32} className={iconColor} />}
        </div>

        {/* Title & Desc */}
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tight">{title}</h1>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-sm mx-auto">{desc}</p>
        </div>

        {/* Points Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-bold text-accent-light">
          <Sparkles size={14} className="text-amber-400" />
          <span>Gana hasta {maxPoints} puntos hoy</span>
        </div>

        {/* Rules box */}
        {rules.length > 0 && (
          <div className="text-left bg-card2/70 p-3.5 rounded-xl border border-border space-y-2">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Reglas del juego</p>
            <ul className="space-y-1.5">
              {rules.map((rule, idx) => (
                <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Abandonment warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-left">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300 leading-snug">
            <strong>1 intento por día:</strong> Si sales del juego una vez iniciado, la sesión se cerrará y se otorgarán los puntos que hayas alcanzado.
          </p>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Btn fullWidth size="lg" onClick={onStart}>
            <span>¡Comenzar Desafío!</span>
          </Btn>
        </div>
      </Card>
    </div>
  )
}
