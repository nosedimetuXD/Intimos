import React, { useState, useMemo } from 'react'
import { HelpCircle, CheckCircle2, AlertCircle, ChevronRight, BookOpen, Sparkles } from 'lucide-react'
import { Card, Btn } from '../ui'
import { QUE_HARIAS } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

const SCENARIOS_COUNT = 4

export default function QueHarias({ onFinish }) {
  const sessionScenarios = useMemo(() => {
    return [...QUE_HARIAS].sort(() => 0.5 - Math.random()).slice(0, SCENARIOS_COUNT)
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const currentItem = sessionScenarios[currentIndex]

  const handleSelectOption = (idx) => {
    if (isAnswered) return
    setSelectedOpt(idx)
    setIsAnswered(true)

    const isBest = idx === currentItem.best
    if (isBest) {
      setScore(prev => prev + 1)
      confetti({ particleCount: 30, spread: 50 })
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < sessionScenarios.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOpt(null)
      setIsAnswered(false)
    } else {
      const isLastBest = selectedOpt === currentItem.best
      const finalScore = score + (isLastBest ? 0 : 0) // already accounted
      const points = finalScore * 25
      if (onFinish) {
        onFinish(finalScore, sessionScenarios.length, points)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-1 rounded-full border border-accent/25">
          Situación {currentIndex + 1} de {sessionScenarios.length}
        </span>
        <span className="text-xs text-muted font-bold flex items-center gap-1">
          <BookOpen size={13} className="text-accent-light" />
          Dilemas de fe
        </span>
      </div>

      {/* Scenario Card */}
      <Card className="p-5 space-y-4 border-border/80 shadow-lg">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
            <HelpCircle size={18} />
          </div>
          <p className="text-sm font-bold text-text-primary leading-relaxed">
            {currentItem.scenario}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2 pt-2">
          {currentItem.opts.map((opt, idx) => {
            const isSelected = selectedOpt === idx
            const isBestOption = idx === currentItem.best

            let btnStyle = 'bg-card2 hover:bg-card border-border hover:border-accent/40 text-text-primary'
            if (isAnswered) {
              if (isBestOption) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
              } else if (isSelected) {
                btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
              } else {
                btnStyle = 'bg-card2/40 border-border/40 text-muted opacity-50'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all active:scale-[0.99] flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <span className="leading-snug">{opt.text}</span>
                {isAnswered && isBestOption && (
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Revelation / Wisdom explanation */}
        {isAnswered && (
          <div className="space-y-3 pt-3 border-t border-border animate-slide-up">
            <div className="p-3 rounded-xl bg-card2 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider">
                  Principio Bíblico
                </span>
                <span className="text-[10px] font-bold text-muted">
                  {currentItem.verse}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {currentItem.revelation}
              </p>
            </div>

            <Btn fullWidth onClick={handleNext} size="md">
              <span>{currentIndex + 1 < sessionScenarios.length ? 'Siguiente dilema' : 'Ver resultado'}</span>
              <ChevronRight size={16} />
            </Btn>
          </div>
        )}
      </Card>
    </div>
  )
}
