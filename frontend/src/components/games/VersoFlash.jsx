import React, { useState, useMemo, useEffect } from 'react'
import { BookOpen, CheckCircle2, XCircle, ChevronRight, Eye, Sparkles, Clock } from 'lucide-react'
import { Card, Btn } from '../ui'
import { VERSO_FLASH } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

const ROUNDS_COUNT = 5

export default function VersoFlash({ onFinish }) {
  const sessionVerses = useMemo(() => {
    return [...VERSO_FLASH].sort(() => 0.5 - Math.random()).slice(0, ROUNDS_COUNT)
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('memorize') // 'memorize' | 'question' | 'feedback'
  const [countdown, setCountdown] = useState(10)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [score, setScore] = useState(0)

  const currentItem = sessionVerses[currentIndex]

  // Countdown in memorize phase
  useEffect(() => {
    if (phase !== 'memorize') return

    setCountdown(10)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('question')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, currentIndex])

  const handleSkipTimer = () => {
    setPhase('question')
  }

  const handleSelectOption = (idx) => {
    if (phase !== 'question') return

    setSelectedOpt(idx)
    setPhase('feedback')

    if (idx === currentItem.ans) {
      setScore(prev => prev + 1)
      confetti({ particleCount: 30, spread: 50 })
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < sessionVerses.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOpt(null)
      setPhase('memorize')
    } else {
      const isLastCorrect = selectedOpt === currentItem.ans
      const finalScore = score + (isLastCorrect ? 0 : 0) // already added in handleSelectOption
      const points = finalScore * 20
      if (onFinish) {
        onFinish(finalScore, sessionVerses.length, points)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-1 rounded-full border border-accent/25">
          Versículo {currentIndex + 1} de {sessionVerses.length}
        </span>
        <span className="text-xs text-muted font-bold flex items-center gap-1">
          <BookOpen size={13} className="text-accent-light" />
          {currentItem.ref}
        </span>
      </div>

      {/* Phase 1: Memorization */}
      {phase === 'memorize' && (
        <Card className="p-6 space-y-4 text-center border-accent/40 shadow-lg animate-fade-in">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold">
            <Clock size={15} />
            <span>Memoriza el versículo ({countdown}s)</span>
          </div>

          <div className="p-4 rounded-xl bg-card2/80 border border-border">
            <p className="text-base font-bold text-text-primary leading-relaxed">
              "{currentItem.full}"
            </p>
            <p className="text-xs text-accent-light font-bold mt-2">
              — {currentItem.ref}
            </p>
          </div>

          <p className="text-xs text-muted leading-snug">
            {currentItem.context}
          </p>

          <Btn fullWidth onClick={handleSkipTimer} size="md">
            <span>¡Ya me lo sé! Continuar</span>
            <ChevronRight size={16} />
          </Btn>
        </Card>
      )}

      {/* Phase 2: Complete the Verse */}
      {phase === 'question' && (
        <Card className="p-5 space-y-4 animate-slide-up">
          <div className="p-4 rounded-xl bg-card2 border border-border">
            <p className="text-sm font-bold text-text-primary leading-relaxed">
              "{currentItem.incomplete}"
            </p>
            <p className="text-xs text-muted font-bold mt-2">
              — {currentItem.ref}
            </p>
          </div>

          <p className="text-xs font-bold text-text-secondary">
            ¿Cuál es la palabra que falta?
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {currentItem.opts.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className="p-3.5 rounded-xl bg-card2 hover:bg-card border border-border hover:border-accent/40 text-xs font-bold text-text-primary transition-all active:scale-95 text-center"
              >
                {opt}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Phase 3: Feedback */}
      {phase === 'feedback' && (
        <Card className="p-5 space-y-4 animate-slide-up">
          {selectedOpt === currentItem.ans ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>¡Correcto! Memoria viva (+20 pts)</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <XCircle size={18} />
                <span>La palabra correcta era: "{currentItem.opts[currentItem.ans]}"</span>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-card2 border border-border text-xs space-y-1">
            <p className="font-bold text-text-primary">Texto completo:</p>
            <p className="text-text-secondary italic">"{currentItem.full}"</p>
            <p className="text-[11px] text-muted pt-1">{currentItem.context}</p>
          </div>

          <Btn fullWidth onClick={handleNext} size="md">
            <span>{currentIndex + 1 < sessionVerses.length ? 'Siguiente versículo' : 'Ver resultado'}</span>
            <ChevronRight size={16} />
          </Btn>
        </Card>
      )}
    </div>
  )
}
