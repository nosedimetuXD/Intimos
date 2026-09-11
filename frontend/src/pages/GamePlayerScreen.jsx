import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  HelpCircle, 
  Timer, 
  Type, 
  Shuffle, 
  RotateCcw,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Card, Btn } from '../components/ui'

// Import Dedicated Game Engines & Intro
import GameIntro from '../components/games/GameIntro'
import VersoFlash from '../components/games/VersoFlash'
import QueHarias from '../components/games/QueHarias'
import Reto60 from '../components/games/Reto60'
import VerdaderoFalso from '../components/games/VerdaderoFalso'
import AhorcadoBiblico from '../components/games/AhorcadoBiblico'
import OrdenaVersiculo from '../components/games/OrdenaVersiculo'

const GAME_METADATA = {
  verso_flash: {
    title: 'Verso Flash',
    desc: 'Entrena tu memoria leyendo el versículo y recordando la palabra que falta.',
    icon: BookOpen,
    iconColor: 'text-blue-400',
    maxPoints: 100,
    rules: [
      'Memoriza el versículo durante 10 segundos.',
      'Elige la opción correcta para completar los espacios en blanco.',
      'Aprende el contexto histórico de cada pasaje.'
    ]
  },
  que_harias: {
    title: '¿Qué Harías?',
    desc: 'Dilemas morales reales de la juventud evaluados a la luz de las enseñanzas de Jesús.',
    icon: HelpCircle,
    iconColor: 'text-amber-400',
    maxPoints: 100,
    rules: [
      'Lee la situación con atención.',
      'Selecciona la respuesta más sabia y madura.',
      'Descubre la revelación y el versículo aplicable a cada caso.'
    ]
  },
  reto_60: {
    title: 'Reto 60 Segundos',
    desc: 'Trivia bíblica a toda velocidad contra el reloj.',
    icon: Timer,
    iconColor: 'text-orange-400',
    maxPoints: 120,
    rules: [
      'Tienes 60 segundos exactos en el cronómetro.',
      'Las rachas consecutivas multiplican tus puntos (x1.5 y x2.0).',
      'Responde con rapidez para maximizar tu puntuación.'
    ]
  },
  verdadero_falso: {
    title: 'Verdadero o Falso',
    desc: 'Mitos, verdades y datos curiosos sobre la Biblia.',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    maxPoints: 100,
    rules: [
      'Determina si la afirmación bíblica es Verdadera o Falsa.',
      'Aprende con las notas bíblicas de cada ronda.',
      '5 afirmaciones por sesión.'
    ]
  },
  ahorcado: {
    title: 'Ahorcado Bíblico',
    desc: 'Adivina personajes, lugares y doctrinas bíblicas antes de agotar tus vidas.',
    icon: Type,
    iconColor: 'text-purple-400',
    maxPoints: 100,
    rules: [
      'Usa el teclado táctil en pantalla para proponer letras.',
      'Cuentas con 6 vidas (corazones) por palabra.',
      'Aprovecha la pista temática para deducir la palabra.'
    ]
  },
  ordena_verso: {
    title: 'Ordena el Versículo',
    desc: 'Arma el versículo desordenado tocando las palabras en la secuencia exacta.',
    icon: Shuffle,
    iconColor: 'text-cyan-400',
    maxPoints: 100,
    rules: [
      'Toca las palabras del banco inferior para armar la frase.',
      'Toca una palabra armada si deseas devolverla al banco.',
      'Presiona Comprobar para verificar la coincidencia exacta.'
    ]
  }
}

export default function GamePlayerScreen() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { currentUser, refreshProfile } = useAuth()

  const [phase, setPhase] = useState('loading') // 'loading' | 'already_played' | 'intro' | 'playing' | 'completed'
  const [finalScore, setFinalScore] = useState(0)
  const [finalMax, setFinalMax] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)

  const todayStr = new Date().toISOString().split('T')[0]
  const gameKey = `intimos_game_${type}_${todayStr}_${currentUser?.id}`
  const progressKey = `intimos_progress_${type}_${todayStr}_${currentUser?.id}`

  const meta = GAME_METADATA[type] || {
    title: 'Desafío Bíblico',
    desc: 'Pon a prueba tus conocimientos.',
    icon: Trophy,
    iconColor: 'text-accent-light',
    maxPoints: 100,
    rules: ['Completa el desafío para ganar puntos.']
  }

  useEffect(() => {
    // 1. Check if user already played today
    const cachedResult = localStorage.getItem(gameKey)
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult)
        setFinalScore(parsed.score || 0)
        setFinalMax(parsed.max_score || 0)
        setPointsEarned(parsed.points_awarded || 0)
      } catch {}
      setPhase('already_played')
      return
    }

    // 2. Anti-abandonment check: if user started and left, close attempt
    const inProgress = localStorage.getItem(progressKey)
    if (inProgress) {
      try {
        const parsed = JSON.parse(inProgress)
        setFinalScore(parsed.score || 0)
        setFinalMax(parsed.max_score || 5)
        setPointsEarned(parsed.points_awarded || 10)
        localStorage.setItem(gameKey, JSON.stringify(parsed))
        localStorage.removeItem(progressKey)
        setPhase('already_played')
        return
      } catch {}
    }

    setPhase('intro')
  }, [type, todayStr, currentUser?.id])

  const handleStartGame = () => {
    // Set in-progress flag to protect against timer restarts
    localStorage.setItem(progressKey, JSON.stringify({
      score: 0,
      max_score: 5,
      points_awarded: 10,
      started_at: new Date().toISOString()
    }))
    setPhase('playing')
  }

  const handleGameFinish = async (score, maxScore, pointsAwarded) => {
    setFinalScore(score)
    setFinalMax(maxScore)
    setPointsEarned(pointsAwarded)
    setPhase('completed')

    const resultData = {
      score,
      max_score: maxScore,
      points_awarded: pointsAwarded,
      completed_at: new Date().toISOString()
    }

    // Save locally
    localStorage.setItem(gameKey, JSON.stringify(resultData))
    localStorage.removeItem(progressKey)

    // Submit to backend
    try {
      await gamesApi.submitGame(type, {
        score,
        max_score: maxScore,
        points_awarded: pointsAwarded
      })
      if (refreshProfile) {
        refreshProfile()
      }
    } catch (err) {
      console.warn('Backend submit fallback:', err)
    }

    confetti({ particleCount: 70, spread: 80 })
  }

  // Render Based on Current Phase
  if (phase === 'loading') {
    return (
      <div className="p-8 text-center text-xs text-muted flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-3" />
        <span>Cargando desafío...</span>
      </div>
    )
  }

  // Already Played Screen
  if (phase === 'already_played') {
    const IconComp = meta.icon
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
        <button
          onClick={() => navigate('/retos')}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition-colors font-semibold"
        >
          <ChevronLeft size={16} />
          <span>Volver a Desafíos</span>
        </button>

        <Card className="p-6 text-center space-y-4 border-emerald-500/30 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <h1 className="text-xl font-black text-text-primary">¡Desafío Completado Hoy!</h1>
            <p className="text-xs text-muted mt-1">Ya realizaste tu intento diario para {meta.title}.</p>
          </div>

          <div className="p-4 rounded-xl bg-card2 border border-border grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Resultado</p>
              <p className="text-lg font-black text-text-primary mt-0.5">{finalScore} / {finalMax}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Puntos Ganados</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">+{pointsEarned} pts</p>
            </div>
          </div>

          <p className="text-[11px] text-muted">
            Vuelve mañana para un nuevo reto y seguir sumando puntos en el ranking.
          </p>

          <Btn fullWidth onClick={() => navigate('/retos')}>
            <span>Volver a Desafíos</span>
          </Btn>
        </Card>
      </div>
    )
  }

  // Intro Screen
  if (phase === 'intro') {
    return (
      <GameIntro
        title={meta.title}
        desc={meta.desc}
        icon={meta.icon}
        iconColor={meta.iconColor}
        rules={meta.rules}
        maxPoints={meta.maxPoints}
        onStart={handleStartGame}
        onBack={() => navigate('/retos')}
      />
    )
  }

  // Completed Celebration Screen
  if (phase === 'completed') {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4 animate-slide-up">
        <Card className="p-6 text-center space-y-5 border-accent/40 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent-light shadow-lg shadow-accent/20">
            <Trophy size={36} className="text-amber-400" />
          </div>

          <div>
            <span className="text-xs font-bold text-accent-light uppercase tracking-wider">
              ¡Reto Finalizado!
            </span>
            <h1 className="text-2xl font-black text-text-primary mt-1">{meta.title}</h1>
            <p className="text-xs text-muted mt-1">¡Excelente dedicación a la Palabra!</p>
          </div>

          <div className="p-4 rounded-2xl bg-card2 border border-border grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Aciertos</p>
              <p className="text-2xl font-black text-text-primary mt-0.5">{finalScore} / {finalMax}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Puntos Sumados</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">+{pointsEarned} pts</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Btn fullWidth size="lg" onClick={() => navigate('/retos')}>
              <span>Continuar a Desafíos</span>
            </Btn>
            <Btn fullWidth variant="ghost" size="sm" onClick={() => navigate('/comunidad')}>
              <span>Ver mi posición en el Ranking</span>
            </Btn>
          </div>
        </Card>
      </div>
    )
  }

  // Active Game Engine Router
  return (
    <div>
      {/* Top Back header inside game */}
      <div className="p-4 max-w-lg mx-auto flex items-center justify-between">
        <button
          onClick={() => {
            if (window.confirm('¿Seguro que deseas salir? Tu intento de hoy se guardará con la puntuación actual.')) {
              handleGameFinish(0, 5, 5)
              navigate('/retos')
            }
          }}
          className="flex items-center gap-1 text-xs text-muted hover:text-text-primary transition-colors font-semibold"
        >
          <ChevronLeft size={16} />
          <span>Abandonar</span>
        </button>
        <p className="text-xs font-bold text-text-primary">{meta.title}</p>
        <div className="w-12" />
      </div>

      {type === 'verso_flash' && <VersoFlash onFinish={handleGameFinish} />}
      {type === 'que_harias' && <QueHarias onFinish={handleGameFinish} />}
      {type === 'reto_60' && <Reto60 onFinish={handleGameFinish} />}
      {type === 'verdadero_falso' && <VerdaderoFalso onFinish={handleGameFinish} />}
      {type === 'ahorcado' && <AhorcadoBiblico onFinish={handleGameFinish} />}
      {type === 'ordena_verso' && <OrdenaVersiculo onFinish={handleGameFinish} />}
    </div>
  )
}
