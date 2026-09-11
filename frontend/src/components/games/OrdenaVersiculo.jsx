import React, { useState, useMemo } from 'react'
import { RotateCcw, CheckCircle2, XCircle, ChevronRight, Sparkles, BookOpen } from 'lucide-react'
import { Card, Btn } from '../ui'
import { ORDENA_VERSICULO } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function OrdenaVersiculo({ onFinish, onBack }) {
  const sessionVerses = useMemo(() => {
    return [...ORDENA_VERSICULO].sort(() => 0.5 - Math.random())
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [placedWords, setPlacedWords] = useState([])
  const [availableWords, setAvailableWords] = useState(() => {
    const first = sessionVerses[0]
    return shuffleArray(first.words.map((w, idx) => ({ id: `${idx}-${w}`, text: w })))
  })
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)

  const currentVerse = sessionVerses[currentIndex]

  const handlePickWord = (wordItem) => {
    if (isEvaluated) return
    setPlacedWords(prev => [...prev, wordItem])
    setAvailableWords(prev => prev.filter(w => w.id !== wordItem.id))
  }

  const handleRemoveWord = (wordItem) => {
    if (isEvaluated) return
    setPlacedWords(prev => prev.filter(w => w.id !== wordItem.id))
    setAvailableWords(prev => [...prev, wordItem])
  }

  const handleReset = () => {
    if (isEvaluated) return
    setPlacedWords([])
    setAvailableWords(shuffleArray(currentVerse.words.map((w, idx) => ({ id: `${idx}-${w}`, text: w }))))
  }

  const handleCheckAnswer = () => {
    if (placedWords.length === 0 || isEvaluated) return

    const userSentence = placedWords.map(w => w.text).join(' ')
    const correctSentence = currentVerse.words.join(' ')

    const win = userSentence.trim().toLowerCase() === correctSentence.trim().toLowerCase()
    setIsCorrect(win)
    setIsEvaluated(true)

    if (win) {
      setScore(prev => prev + 1)
      confetti({ particleCount: 30, spread: 50 })
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < sessionVerses.length) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      setPlacedWords([])
      setAvailableWords(shuffleArray(sessionVerses[nextIdx].words.map((w, idx) => ({ id: `${idx}-${w}`, text: w }))))
      setIsEvaluated(false)
      setIsCorrect(false)
    } else {
      const totalPoints = (score + (isCorrect ? 1 : 0)) * 20
      if (onFinish) {
        onFinish(score + (isCorrect ? 1 : 0), sessionVerses.length, totalPoints)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-1 rounded-full border border-accent/25">
          Versículo {currentIndex + 1} de {sessionVerses.length}
        </span>
        <span className="text-xs text-muted font-bold flex items-center gap-1">
          <BookOpen size={13} className="text-accent-light" />
          {currentVerse.ref}
        </span>
      </div>

      {/* Target Placement Area */}
      <Card className="p-4 min-h-[140px] flex flex-col justify-between border-dashed border-2 border-border/80">
        <div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
            Tu versículo armado:
          </p>

          <div className="flex flex-wrap gap-1.5 min-h-[60px] items-center p-2 rounded-xl bg-card2/50 border border-border/40">
            {placedWords.length === 0 ? (
              <p className="text-xs text-muted italic">Toca las palabras de abajo en el orden correcto...</p>
            ) : (
              placedWords.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRemoveWord(item)}
                  disabled={isEvaluated}
                  className="px-2.5 py-1 rounded-lg bg-accent/20 border border-accent/40 text-xs font-bold text-text-primary hover:bg-accent/30 transition-all active:scale-95"
                >
                  {item.text}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <button
            onClick={handleReset}
            disabled={isEvaluated || placedWords.length === 0}
            className="flex items-center gap-1 text-xs text-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            <RotateCcw size={14} />
            <span>Reiniciar</span>
          </button>

          {!isEvaluated && (
            <Btn
              size="sm"
              onClick={handleCheckAnswer}
              disabled={placedWords.length < currentVerse.words.length}
            >
              Comprobar
            </Btn>
          )}
        </div>
      </Card>

      {/* Word Bank */}
      {!isEvaluated ? (
        <Card className="p-4 space-y-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
            Banco de palabras:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableWords.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePickWord(item)}
                className="px-3 py-1.5 rounded-xl bg-card2 hover:bg-card border border-border text-xs font-bold text-text-primary transition-all active:scale-95 shadow-sm"
              >
                {item.text}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        /* Evaluation Feedback */
        <Card className="p-4 space-y-3 animate-slide-up">
          {isCorrect ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>¡Orden perfecto! +20 puntos</span>
            </div>
          ) : (
            <div className="space-y-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <XCircle size={16} />
                <span>Orden incorrecto</span>
              </div>
              <p className="text-text-secondary italic text-[11px] pt-1">
                Correcto: "{currentVerse.full}"
              </p>
            </div>
          )}

          <Btn fullWidth size="md" onClick={handleNext}>
            <span>{currentIndex + 1 < sessionVerses.length ? 'Siguiente versículo' : 'Finalizar reto'}</span>
            <ChevronRight size={16} />
          </Btn>
        </Card>
      )}
    </div>
  )
}
