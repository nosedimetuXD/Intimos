import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, HelpCircle, Trophy, BookOpen } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function GamePlayerScreen() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadGame() {
      try {
        const res = await gamesApi.getQuestions(type)
        if (res.already_played) {
          setAlreadyPlayed(true)
        } else {
          setQuestions(res.questions || [])
        }
      } catch (err) {
        console.error('Error loading game:', err)
      } finally {
        setLoading(false)
      }
    }
    loadGame()
  }, [type])

  const handleSelectOption = (option) => {
    if (answered) return
    setSelectedOption(option)
    setAnswered(true)

    // For questions that have options, we record user choice
    // We increment score
    setScore(prev => prev + 1)
  }

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      finishGame()
    }
  }

  const finishGame = async () => {
    setSubmitting(true)
    try {
      const finalScore = score + (answered ? 0 : 0)
      const res = await gamesApi.submitGame(type, {
        score: finalScore,
        max_score: questions.length,
        time_spent_sec: 45,
      })
      setSubmissionResult(res)
      setFinished(true)
      await refreshProfile()

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      })
    } catch (err) {
      alert(err.message || 'Error al enviar resultados')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs font-medium">
        Cargando preguntas del día...
      </div>
    )
  }

  if (alreadyPlayed) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center font-bold text-2xl">
          ⏳
        </div>
        <h2 className="text-base font-bold text-white">¡Ya jugaste hoy!</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Cada reto tiene un intento único diario para que la competencia sea justa. ¡Vuelve mañana!
        </p>
        <button
          onClick={() => navigate('/retos')}
          className="mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
        >
          Volver a Retos
        </button>
      </div>
    )
  }

  if (finished && submissionResult) {
    return (
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">¡Reto Completado!</h2>
        <p className="text-xs text-slate-300">{submissionResult.message}</p>
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 font-bold px-4 py-2 rounded-full text-sm border border-amber-500/30">
          <Sparkles className="w-4 h-4" />
          <span>+{submissionResult.points_awarded} Puntos Añadidos</span>
        </div>

        <div className="pt-4 space-y-2">
          <button
            onClick={() => navigate('/comunidad')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-colors"
          >
            Ver Tabla de Ranking
          </button>
          <button
            onClick={() => navigate('/retos')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            Otros Retos
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  if (!currentQ) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No hay preguntas disponibles para este juego hoy.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/retos')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pregunta</span>
          <p className="text-xs font-black text-white">{currentIndex + 1} de {questions.length}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
        {currentQ.bible_ref && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{currentQ.bible_ref}</span>
          </div>
        )}

        <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options && currentQ.options.length > 0 ? (
            currentQ.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left p-3.5 rounded-2xl text-xs font-semibold transition-all duration-150 border ${
                  selectedOption === opt
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            // Ahorcado o input libre
            <div className="text-center py-4">
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white uppercase text-center font-bold tracking-widest"
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <button
                onClick={() => setAnswered(true)}
                className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Comprobar
              </button>
            </div>
          )}
        </div>

        {/* Next Button */}
        {answered && (
          <div className="pt-2 animate-fadeIn">
            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30"
            >
              {currentIndex + 1 === questions.length ? (submitting ? 'Guardando...' : 'Finalizar Reto') : 'Siguiente Pregunta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
