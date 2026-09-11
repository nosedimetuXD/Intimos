import React, { useState, useEffect } from 'react'
import { Flame, CheckCircle2, Circle, Zap, BookOpen, Send, Heart, Sparkles, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Btn } from '../components/ui'
import confetti from 'canvas-confetti'

const TRIVIA_POOL = [
  { q: '¿Quién fue tragado por un gran pez?', opts: ['Elías', 'Jonás', 'Moisés', 'Daniel'], ans: 1 },
  { q: '¿Cuántos discípulos tuvo Jesús?', opts: ['7', '10', '12', '15'], ans: 2 },
  { q: '¿En qué río bautizó Juan el Bautista?', opts: ['Nilo', 'Éufrates', 'Jordán', 'Tigris'], ans: 2 },
  { q: '¿Cuál es el libro más corto de la Biblia?', opts: ['Rut', 'Abdías', 'Filemón', '3 Juan'], ans: 3 },
  { q: '¿Dónde nació Jesús?', opts: ['Nazaret', 'Belén', 'Jerusalén', 'Jericó'], ans: 1 },
  { q: '¿Cuántos días estuvo Jesús en el desierto?', opts: ['20', '30', '40', '50'], ans: 2 },
  { q: '¿Quién construyó el arca?', opts: ['Abraham', 'Moisés', 'Noé', 'Salomón'], ans: 2 },
  { q: '¿Cuántos libros tiene la Biblia?', opts: ['60', '66', '72', '78'], ans: 1 },
  { q: '¿Cuál fue la primera milagrosa señal de Jesús?', opts: ['Resucitar a Lázaro', 'Caminar sobre el agua', 'Convertir agua en vino', 'Multiplicar panes'], ans: 2 },
  { q: '¿Qué rey pidió sabiduría a Dios?', opts: ['David', 'Saúl', 'Salomón', 'Ezequías'], ans: 2 },
  { q: '¿Cómo se llama el jardín donde fue arrestado Jesús?', opts: ['Edén', 'Getsemaní', 'Siloé', 'Betania'], ans: 1 },
  { q: '¿Quién traicionó a Jesús?', opts: ['Pedro', 'Tomás', 'Juan', 'Judas Iscariote'], ans: 3 },
  { q: '¿Con qué derrota David a Goliat?', opts: ['Una espada', 'Una honda y una piedra', 'Un arco', 'Sus manos'], ans: 1 },
  { q: '¿Quién escribió el libro de Apocalipsis?', opts: ['Pablo', 'Pedro', 'Juan', 'Lucas'], ans: 2 },
  { q: '¿De qué tribu era el rey David?', opts: ['Leví', 'Benjamín', 'Judá', 'Efraín'], ans: 2 }
]

const GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', // Dom
  'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', // Lun
  'linear-gradient(135deg, #451a03 0%, #78350f 100%)', // Mar
  'linear-gradient(135deg, #4a044e 0%, #701a75 100%)', // Mie
  'linear-gradient(135deg, #083344 0%, #164e63 100%)', // Jue
  'linear-gradient(135deg, #311042 0%, #1e1b4b 100%)', // Vie
  'linear-gradient(135deg, #172554 0%, #1e3a8a 100%)', // Sab
]

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getTodayTrivia() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return TRIVIA_POOL[dayOfYear % TRIVIA_POOL.length]
}

export default function PulsoDiario() {
  const navigate = useNavigate()
  const { currentUser, refreshProfile } = useAuth()
  const today = getTodayKey()
  const storageKey = `intimos_pulso_${currentUser?.id}_${today}`

  const [pulse, setPulse] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {}
    } catch {
      return {}
    }
  })

  const [triviaSelected, setTriviaSelected] = useState(pulse.triviaSelected ?? null)
  const [prayerText, setPrayerText] = useState('')
  const [prayerDone, setPrayerDone] = useState(pulse.prayer || false)
  const [reflectionDone, setReflectionDone] = useState(pulse.reflection || false)

  const trivia = getTodayTrivia()
  const dayIdx = new Date().getDay()
  const bg = GRADIENTS[dayIdx]

  function save(updates) {
    const next = { ...pulse, ...updates }
    setPulse(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  function handleTrivia(idx) {
    if (pulse.triviaAnswered) return
    setTriviaSelected(idx)
    const isCorrect = idx === trivia.ans
    save({ triviaAnswered: true, triviaCorrect: isCorrect, triviaSelected: idx })

    if (isCorrect) {
      confetti({ particleCount: 30, spread: 50 })
    }
    if (refreshProfile) refreshProfile()
  }

  function handlePrayerSubmit(e) {
    e.preventDefault()
    if (!prayerText.trim() || prayerDone) return

    save({ prayer: true, prayerText: prayerText.trim() })
    setPrayerDone(true)
    setPrayerText('')
    confetti({ particleCount: 30, spread: 45 })
    if (refreshProfile) refreshProfile()
  }

  function handleMarkReflection() {
    save({ reflection: true })
    setReflectionDone(true)
    confetti({ particleCount: 20, spread: 40 })
    if (refreshProfile) refreshProfile()
  }

  const tasks = [
    {
      id: 'reflection',
      label: 'Reflexión del versículo del día',
      pts: 5,
      done: reflectionDone,
      icon: BookOpen,
      iconColor: 'text-accent-light'
    },
    {
      id: 'trivia',
      label: 'Trivia bíblica diaria',
      pts: 10,
      done: !!pulse.triviaAnswered && !!pulse.triviaCorrect,
      icon: Zap,
      iconColor: 'text-amber-400'
    },
    {
      id: 'prayer',
      label: 'Oración personal registrada',
      pts: 5,
      done: prayerDone,
      icon: Heart,
      iconColor: 'text-rose-400'
    },
  ]

  const completedCount = tasks.filter(t => t.done).length
  const pointsToday = (reflectionDone ? 5 : 0) + (pulse.triviaCorrect ? 10 : 0) + (prayerDone ? 5 : 0)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24 sm:pb-6 space-y-4">
      {/* Top Back */}
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition-colors font-semibold"
      >
        <ChevronLeft size={16} />
        <span>Volver a Inicio</span>
      </button>

      {/* Hero Header */}
      <div className="rounded-3xl p-6 text-center relative overflow-hidden border border-border shadow-2xl" style={{ background: bg }}>
        <div className="relative z-10 space-y-3">
          <p className="text-[11px] text-white/70 uppercase tracking-widest font-bold">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Pulso Diario</h1>
          <p className="text-xs text-white/80 max-w-xs mx-auto">
            Mantén tu fuego espiritual encendido cada día
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 pt-3">
            <div className="text-center">
              <p className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                <Flame size={20} /> 1
              </p>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">racha activa</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">{completedCount} / 3</p>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">hábitos hoy</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-accent-light">+{pointsToday}</p>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">pts ganados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1.5">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              t.done ? 'bg-emerald-400' : 'bg-card2'
            }`}
          />
        ))}
      </div>

      {/* Task 1: Reflexión */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-accent-light flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-text-primary">1. Reflexión del versículo</h3>
              <p className="text-[10px] text-muted">+5 puntos de meditación</p>
            </div>
          </div>

          {reflectionDone ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              <CheckCircle2 size={13} /> Completado
            </span>
          ) : (
            <Btn size="sm" onClick={handleMarkReflection}>
              <span>Marcar lista</span>
            </Btn>
          )}
        </div>
      </Card>

      {/* Task 2: Trivia Bíblica Diaria */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-text-primary">2. Trivia Bíblica del Día</h3>
              <p className="text-[10px] text-muted">+10 puntos por acertar</p>
            </div>
          </div>

          {pulse.triviaAnswered && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              pulse.triviaCorrect 
                ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25' 
                : 'text-rose-400 bg-rose-500/15 border-rose-500/25'
            }`}>
              {pulse.triviaCorrect ? '¡Correcto! +10 pts' : 'Fallaste'}
            </span>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-card2 border border-border space-y-2.5">
          <p className="text-xs font-bold text-text-primary">{trivia.q}</p>
          <div className="grid grid-cols-2 gap-2">
            {trivia.opts.map((opt, idx) => {
              const isSelected = triviaSelected === idx
              const isCorrectOpt = idx === trivia.ans
              let optStyle = 'bg-card hover:bg-card/80 border-border text-text-primary'
              if (pulse.triviaAnswered) {
                if (isCorrectOpt) optStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                else if (isSelected) optStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                else optStyle = 'opacity-40 border-border'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleTrivia(idx)}
                  disabled={pulse.triviaAnswered}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all active:scale-95 ${optStyle}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Task 3: Oración del Día */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Heart size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-text-primary">3. Oración Personal</h3>
              <p className="text-[10px] text-muted">+5 puntos de consagración</p>
            </div>
          </div>

          {prayerDone && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              <CheckCircle2 size={13} /> Registrada
            </span>
          )}
        </div>

        {!prayerDone ? (
          <form onSubmit={handlePrayerSubmit} className="space-y-2">
            <textarea
              value={prayerText}
              onChange={e => setPrayerText(e.target.value)}
              placeholder="Escribe tu motivo de oración o agradecimiento a Dios hoy..."
              rows={2}
              className="w-full resize-none text-xs p-3 rounded-xl bg-card2 border border-border"
            />
            <Btn type="submit" size="sm" fullWidth disabled={!prayerText.trim()}>
              <Send size={13} />
              <span>Guardar oración (+5 pts)</span>
            </Btn>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-card2/50 border border-border/50 text-xs italic text-text-secondary">
            "{pulse.prayerText || 'Oración personal consagrada en la presencia de Dios.'}"
          </div>
        )}
      </Card>
    </div>
  )
}
