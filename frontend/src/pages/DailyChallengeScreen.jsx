import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Zap, 
  HelpCircle, 
  Timer, 
  CheckSquare, 
  CaseUpper, 
  AlignLeft, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react'

export default function DailyChallengeScreen() {
  const navigate = useNavigate()

  const games = [
    {
      type: 'verso_flash',
      title: 'Verso Flash',
      desc: 'Identifica citas, autores y libros bíblicos en preguntas rápidas.',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      badge: 'Bíblico',
    },
    {
      type: 'que_harias',
      title: '¿Qué Harías?',
      desc: 'Decisiones reales basadas en las enseñanzas y mandamientos de Jesús.',
      icon: HelpCircle,
      color: 'from-sky-500 to-indigo-500',
      badge: 'Sabiduría',
    },
    {
      type: 'reto_60',
      title: 'Reto 60',
      desc: '60 segundos para responder la mayor cantidad de preguntas posibles.',
      icon: Timer,
      color: 'from-rose-500 to-pink-500',
      badge: 'Velocidad',
    },
    {
      type: 'verdadero_falso',
      title: 'Verdadero o Falso',
      desc: 'Mitos comunes y verdades bíblicas con explicación en cada respuesta.',
      icon: CheckSquare,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Doctrina',
    },
    {
      type: 'ahorcado',
      title: 'Ahorcado Bíblico',
      desc: 'Descubre personajes, lugares y conceptos bíblicos antes de agotar vidas.',
      icon: CaseUpper,
      color: 'from-purple-500 to-violet-500',
      badge: 'Palabras',
    },
    {
      type: 'ordena_verso',
      title: 'Ordena el Versículo',
      desc: 'Arma el versículo desordenado arrastrando o tocando cada frase.',
      icon: AlignLeft,
      color: 'from-cyan-500 to-blue-500',
      badge: 'Memoria',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Retos Bíblicos Diarios</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Aprende de la Biblia cada día mientras acumulas puntos para el ranking mensual.
        </p>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Intento único por día</span>
          <span className="font-semibold text-amber-400">Tope máx: 200 pts/día</span>
        </div>
      </div>

      {/* Grid of 6 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {games.map((g) => {
          const Icon = g.icon
          return (
            <div
              key={g.type}
              onClick={() => navigate(`/retos/${g.type}`)}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${g.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                    {g.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {g.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {g.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-indigo-400">Jugar hoy</span>
                <span className="text-[11px] font-bold text-amber-400">+10 a 100 pts</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
