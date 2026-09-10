import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, CheckCircle2, Sparkles, BookOpen, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Card, Btn } from '../components/ui'

export default function GamePlayerScreen() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { currentUser, refreshProfile } = useAuth()

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

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function loadGame() {
      // First check local storage cache
      if (localStorage.getItem(`intimos_game_${type}_${todayStr}_${currentUser?.id}`)) {
        setAlreadyPlayed(true)
        setLoading(false)
        return
      }

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
  }, [type, todayStr, currentUser?.id])

  const handleSelectOption = (option) => {
    if (answered) return
    setSelectedOption(option)
    setAnswered(true)
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
      const finalScore = score
      const res = await gamesApi.submitGame(type, {
        score: finalScore,
        max_score: questions.length,
        time_spent_sec: 45,
      })
      setSubmissionResult(res)
      setFinished(true)
      localStorage.setItem(`intimos_game_${type}_${todayStr}_${currentUser?.id}`, 'true')
      await refreshProfile()

      confetti({
        particleCount: 90,
        spread: 70,
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
      <div className="py-24 text-center text-muted text-xs font-semibold">
        Cargando preguntas del día...
      </div>
    )
  }

  if (alreadyPlayed) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 mx-auto flex items-center justify-center font-bold text-2xl border border-amber-500/25">
            ⏳
          </div>
          <h2 className="text-base font-bold text-text-primary">¡Ya completaste este reto hoy!</h2>
          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            Cada reto cuenta con un intento único por día para asegurar la igualdad en el ranking. ¡Vuelve mañana para más puntos!
          </p>
          <div className="pt-2">
            <Btn onClick={() => navigate('/retos')}>
              Volver a Retos
            </Btn>
          </div>
        </Card>
      </div>
    )
  }

  if (finished && submissionResult) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card className="text-center space-y-4 border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg">
            <Trophy size={32} />
          </div>
          <h2 className="text-lg font-black text-text-primary">¡Reto Completado!</h2>
          <p className="text-xs text-text-secondary">{submissionResult.message}</p>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 font-bold px-4 py-2 rounded-full text-xs border border-amber-500/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>+{submissionResult.points_awarded} Puntos Añadidos</span>
          </div>

          <div className="pt-3 space-y-2">
            <Btn fullWidth onClick={() => navigate('/comunidad')}>
              Ver Tabla de Ranking
            </Btn>
            <Btn fullWidth variant="secondary" onClick={() => navigate('/retos')}>
              Otros Retos
            </Btn>
          </div>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  if (!currentQ) {
    return (
      <div className="text-center py-16 text-muted text-xs">
        No hay preguntas disponibles para este juego hoy.
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/retos')}
          className="p-2 rounded-xl bg-card border border-border text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Pregunta</span>
          <p className="text-xs font-black text-text-primary">{currentIndex + 1} de {questions.length}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Question Card */}
      <Card className="space-y-4">
        {currentQ.bible_ref && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-light bg-accent/15 px-3 py-1 rounded-full w-fit border border-accent/25">
            <BookOpen size={13} />
            <span>{currentQ.bible_ref}</span>
          </div>
        )}

        <h3 className="text-sm sm:text-base font-bold text-text-primary leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2 pt-2">
          {currentQ.options && currentQ.options.length > 0 ? (
            currentQ.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left p-3.5 rounded-2xl text-xs font-semibold transition-all duration-150 border ${
                  selectedOption === opt
                    ? 'bg-accent border-accent text-white shadow-md shadow-accent/25'
                    : 'bg-card2 border-border text-text-primary hover:border-accent/40'
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="text-center py-4 space-y-3">
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                className="text-center uppercase font-bold tracking-wider"
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <Btn fullWidth onClick={() => setAnswered(true)}>
                Comprobar
              </Btn>
            </div>
          )}
        </div>

        {/* Next / Finish Button */}
        {answered && (
          <div className="pt-2">
            <Btn
              fullWidth
              size="lg"
              onClick={handleNext}
              disabled={submitting}
            >
              {currentIndex + 1 === questions.length 
                ? (submitting ? 'Guardando...' : 'Finalizar Reto') 
                : 'Siguiente Pregunta'}
            </Btn>
          </div>
        )}
      </Card>
    </div>
  )
}
