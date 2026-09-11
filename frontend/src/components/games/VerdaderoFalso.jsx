import React, { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, ChevronRight, BookOpen, Sparkles, Check, X } from 'lucide-react'
import { Card, Btn } from '../ui'
import { VERDADERO_FALSO } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

const QUESTIONS_COUNT = 5

export default function VerdaderoFalso({ onFinish }) {
  const sessionQuestions = useMemo(() => {
    return [...VERDADERO_FALSO].sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_COUNT)
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAns, setSelectedAns] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const currentItem = sessionQuestions[currentIndex]

  const handleSelect = (userBool) => {
    if (isAnswered) return
    setSelectedAns(userBool)
    setIsAnswered(true)

    const isCorrect = userBool === currentItem.ans
    if (isCorrect) {
      setScore(prev => prev + 1)
      confetti({ particleCount: 30, spread: 50 })
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAns(null)
      setIsAnswered(false)
    } else {
      const isLastCorrect = selectedAns === currentItem.ans
      const points = score * 20
      if (onFinish) {
        onFinish(score, sessionQuestions.length, points)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-1 rounded-full border border-accent/25">
          Pregunta {currentIndex + 1} de {sessionQuestions.length}
        </span>
        <span className="text-xs text-muted font-bold flex items-center gap-1">
          <BookOpen size={13} className="text-accent-light" />
          {currentItem.ref}
        </span>
      </div>

      {/* Main Statement Card */}
      <Card className="p-6 space-y-5 border-border/80 shadow-lg text-center">
        <div className="min-h-[70px] flex items-center justify-center">
          <p className="text-base font-bold text-text-primary leading-relaxed">
            "{currentItem.q}"
          </p>
        </div>

        {/* Binary Choices */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Verdadero */}
          <button
            onClick={() => handleSelect(true)}
            disabled={isAnswered}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 ${
              isAnswered
                ? currentItem.ans === true
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : selectedAns === true
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-card2 border-border text-muted opacity-40'
                : 'bg-card2 hover:bg-card border-border hover:border-emerald-500/40 text-text-primary'
            }`}
          >
            <CheckCircle2 size={24} className={isAnswered && currentItem.ans === true ? "text-emerald-400" : "text-emerald-500/70"} />
            <span>VERDADERO</span>
          </button>

          {/* Falso */}
          <button
            onClick={() => handleSelect(false)}
            disabled={isAnswered}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 ${
              isAnswered
                ? currentItem.ans === false
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : selectedAns === false
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-card2 border-border text-muted opacity-40'
                : 'bg-card2 hover:bg-card border-border hover:border-rose-500/40 text-text-primary'
            }`}
          >
            <XCircle size={24} className={isAnswered && currentItem.ans === false ? "text-emerald-400" : "text-rose-500/70"} />
            <span>FALSO</span>
          </button>
        </div>

        {/* Explanation box */}
        {isAnswered && (
          <div className="space-y-3 pt-3 border-t border-border animate-slide-up text-left">
            <div className="p-3.5 rounded-xl bg-card2 border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider">
                  Explicación Bíblica
                </span>
                <span className="text-[10px] font-bold text-muted">
                  {currentItem.ref}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {currentItem.explanation}
              </p>
            </div>

            <Btn fullWidth onClick={handleNext} size="md">
              <span>{currentIndex + 1 < sessionQuestions.length ? 'Siguiente afirmación' : 'Ver resultado'}</span>
              <ChevronRight size={16} />
            </Btn>
          </div>
        )}
      </Card>
    </div>
  )
}
