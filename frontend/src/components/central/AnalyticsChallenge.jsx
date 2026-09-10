import React from 'react'
import { BarChart2, TrendingUp, CheckCircle2, Award, Zap } from 'lucide-react'
import { Card } from '../ui'

export default function AnalyticsChallenge() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Analytics de Retos</h1>
          <p className="text-xs text-muted">Estadísticas de efectividad y aprendizaje bíblico</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <BarChart2 size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Partidas Totales</p>
          <p className="text-xl font-black text-accent-light mt-0.5">142</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Acierto Global</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">84%</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Tiempo Promedio</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">42s</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Racha Máxima</p>
          <p className="text-xl font-black text-purple-400 mt-0.5">14 días</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="font-bold text-text-primary text-xs uppercase tracking-wider">
          Efectividad por Juego
        </h2>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-text-primary mb-1">
              <span>Verso Flash</span>
              <span className="text-emerald-400">89% aciertos</span>
            </div>
            <div className="w-full bg-card2 h-2 rounded-full overflow-hidden border border-border">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '89%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-text-primary mb-1">
              <span>¿Qué Harías?</span>
              <span className="text-emerald-400">92% aciertos</span>
            </div>
            <div className="w-full bg-card2 h-2 rounded-full overflow-hidden border border-border">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-text-primary mb-1">
              <span>Reto 60 seg</span>
              <span className="text-amber-400">76% aciertos</span>
            </div>
            <div className="w-full bg-card2 h-2 rounded-full overflow-hidden border border-border">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '76%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-text-primary mb-1">
              <span>Verdadero o Falso</span>
              <span className="text-emerald-400">81% aciertos</span>
            </div>
            <div className="w-full bg-card2 h-2 rounded-full overflow-hidden border border-border">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '81%' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
