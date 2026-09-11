import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Timer, Zap, Flame, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Card, Btn } from '../ui'
import { RETO_60 } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

export default function Reto60({ onFinish }) {
  // Shuffle questions
  const questions = useMemo(() => {
    return [...RETO_60].sort(() => 0.5 - Math.random())
  }, [])

  const [timeLeft, setTimeLeft] = useState(60)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [isGameOver, setIsGameOver] = useState(false)

  const timerRef = useRef(null)

  // Multiplier based on streak
  const multiplier = streak >= 5 ? 2.0 : streak >= 3 ? 1.5 : 1.0

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setIsGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [])

  // Call onFinish when game finishes
  useEffect(() => {
    if (isGameOver && onFinish) {
      const finalAwarded = Math.min(120, totalPoints)
      onFinish(correctCount, correctCount + wrongCount, finalAwarded)
      confetti({ particleCount: 50, spread: 70 })
    }
  }, [isGameOver])

  const currentQ = questions[currentIndex % questions.length]

  const handleAnswer = (optionIdx) => {
    if (isGameOver || feedback) return

    const isCorrect = optionIdx === currentQ.ans

    if (isCorrect) {
      const earned = Math.round(10 * multiplier)
      setTotalPoints(prev => prev + earned)
      setStreak(prev => prev + 1)
      setCorrectCount(prev => prev + 1)
      setFeedback('correct')
    } else {
      setStreak(0)
      setWrongCount(prev => prev + 1)
      setFeedback('wrong')
    }

    // Auto advance quickly
    setTimeout(() => {
      setFeedback(null)
      setCurrentIndex(prev => prev + 1)
    }, 400)
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* HUD Header */}
      <div className="grid grid-cols-3 gap-2">
        {/* Timer Box */}
        <div className={`p-3 rounded-2xl border text-center transition-all ${
          timeLeft <= 10 
            ? 'bg-rose-500/20 border-rose-500/40 animate-pulse' 
            : 'bg-card border-border'
        }`}>
          <div className="flex items-center justify-center gap-1 text-muted text-[10px] font-bold uppercase tracking-wider">
            <Timer size={12} className={timeLeft <= 10 ? 'text-rose-400' : 'text-accent-light'} />
            <span>Tiempo</span>
          </div>
          <p className={`text-2xl font-black mt-0.5 ${timeLeft <= 10 ? 'text-rose-400' : 'text-text-primary'}`}>
            {timeLeft}s
          </p>
        </div>

        {/* Streak Multiplier */}
        <div className="p-3 rounded-2xl border bg-card border-border text-center">
          <div className="flex items-center justify-center gap-1 text-muted text-[10px] font-bold uppercase tracking-wider">
            <Flame size={12} className={streak >= 3 ? 'text-orange-400' : 'text-muted'} />
            <span>Racha</span>
          </div>
          <p className="text-2xl font-black text-orange-400 mt-0.5">
            {multiplier > 1.0 ? `x${multiplier}` : `${streak}`}
          </p>
        </div>

        {/* Points Accumulated */}
        <div className="p-3 rounded-2xl border bg-card border-border text-center">
          <div className="flex items-center justify-center gap-1 text-muted text-[10px] font-bold uppercase tracking-wider">
            <Zap size={12} className="text-amber-400" />
            <span>Puntos</span>
          </div>
          <p className="text-2xl font-black text-accent-light mt-0.5">
            {totalPoints}
          </p>
        </div>
      </div>

      {/* Main Question Card */}
      {!isGameOver ? (
        <Card className={`p-5 space-y-4 border transition-all ${
          feedback === 'correct' 
            ? 'border-emerald-500/50 bg-emerald-500/10' 
            : feedback === 'wrong' 
              ? 'border-rose-500/50 bg-rose-500/10' 
              : 'border-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Pregunta #{currentIndex + 1}
            </span>
            <span className="text-[10px] font-semibold text-text-secondary bg-card2 px-2 py-0.5 rounded-full border border-border">
              {currentQ.ref}
            </span>
          </div>

          <h2 className="text-base font-bold text-text-primary min-h-[48px] flex items-center">
            {currentQ.q}
          </h2>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {currentQ.opts.map((option, idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={feedback !== null}
                  className="p-3.5 rounded-xl bg-card2 hover:bg-card border border-border hover:border-accent/40 text-xs font-bold text-text-primary text-left transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <span>{option}</span>
                </button>
              )
            })}
          </div>
        </Card>
      ) : (
        /* Game Over Card */
        <Card className="p-6 text-center space-y-4 border-accent/40 shadow-xl animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto text-accent-light">
            <Sparkles size={28} />
          </div>

          <div>
            <h2 className="text-xl font-black text-text-primary">¡Tiempo agotado!</h2>
            <p className="text-xs text-muted mt-1">Gran velocidad y destreza mental</p>
          </div>

          <div className="p-4 rounded-xl bg-card2 border border-border grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Aciertos</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{correctCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase">Puntos Ganados</p>
              <p className="text-xl font-black text-accent-light mt-0.5">+{Math.min(120, totalPoints)} pts</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
