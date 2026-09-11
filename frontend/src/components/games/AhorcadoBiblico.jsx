import React, { useState, useMemo } from 'react'
import { Heart, HelpCircle, CheckCircle2, XCircle, ChevronRight, Trophy, Sparkles } from 'lucide-react'
import { Card, Btn } from '../ui'
import { AHORCADO_BIBLICO } from '../../data/gameQuestions'
import confetti from 'canvas-confetti'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const MAX_WRONG = 6
const WORDS_PER_SESSION = 5

export default function AhorcadoBiblico({ onFinish, onBack }) {
  // Select 5 random words from pool
  const sessionWords = useMemo(() => {
    const shuffled = [...AHORCADO_BIBLICO].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, WORDS_PER_SESSION)
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [guessedLetters, setGuessedLetters] = useState(new Set())
  const [wrongCount, setWrongCount] = useState(0)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [sessionFinished, setSessionFinished] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const currentItem = sessionWords[currentIndex]
  const wordClean = currentItem.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // Check if word is fully guessed
  const isWordWon = wordClean.split('').every(letter => guessedLetters.has(letter) || letter === ' ')
  const isWordLost = wrongCount >= MAX_WRONG
  const isRoundOver = isWordWon || isWordLost

  const handleLetterClick = (letter) => {
    if (isRoundOver || guessedLetters.has(letter)) return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (!wordClean.includes(letter)) {
      const nextWrong = wrongCount + 1
      setWrongCount(nextWrong)
      if (nextWrong >= MAX_WRONG) {
        setShowExplanation(true)
      }
    } else {
      // Check if this guess finished the word
      const won = wordClean.split('').every(l => newGuessed.has(l) || l === ' ')
      if (won) {
        setWordsCompleted(prev => prev + 1)
        setShowExplanation(true)
        confetti({ particleCount: 30, spread: 50 })
      }
    }
  }

  const handleNextWord = () => {
    if (currentIndex + 1 < sessionWords.length) {
      setCurrentIndex(prev => prev + 1)
      setGuessedLetters(new Set())
      setWrongCount(0)
      setShowExplanation(false)
    } else {
      // Finished all words
      setSessionFinished(true)
      const points = Math.min(100, (wordsCompleted + (isWordWon ? 1 : 0)) * 20)
      if (onFinish) {
        onFinish(wordsCompleted + (isWordWon ? 1 : 0), sessionWords.length, points)
      }
    }
  }

  // Draw Hangman SVG
  const renderHangmanSVG = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-accent-light fill-none stroke-[3] mx-auto">
        {/* Gallows Base */}
        <line x1="15" y1="90" x2="85" y2="90" />
        <line x1="35" y1="90" x2="35" y2="10" />
        <line x1="35" y1="10" x2="70" y2="10" />
        <line x1="70" y1="10" x2="70" y2="22" />

        {/* Head */}
        {wrongCount >= 1 && <circle cx="70" cy="30" r="8" className="stroke-rose-400" />}
        {/* Torso */}
        {wrongCount >= 2 && <line x1="70" y1="38" x2="70" y2="60" className="stroke-rose-400" />}
        {/* Left Arm */}
        {wrongCount >= 3 && <line x1="70" y1="44" x2="56" y2="52" className="stroke-rose-400" />}
        {/* Right Arm */}
        {wrongCount >= 4 && <line x1="70" y1="44" x2="84" y2="52" className="stroke-rose-400" />}
        {/* Left Leg */}
        {wrongCount >= 5 && <line x1="70" y1="60" x2="58" y2="76" className="stroke-rose-400" />}
        {/* Right Leg */}
        {wrongCount >= 6 && <line x1="70" y1="60" x2="82" y2="76" className="stroke-rose-400" />}
      </svg>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-accent-light bg-accent/15 px-2.5 py-1 rounded-full border border-accent/25">
            Palabra {currentIndex + 1} de {sessionWords.length}
          </span>
          <span className="text-xs text-muted font-bold">
            {currentItem.cat}
          </span>
        </div>

        {/* Lives / Hearts */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_WRONG }).map((_, i) => (
            <Heart
              key={i}
              size={16}
              className={i < (MAX_WRONG - wrongCount) ? "text-rose-500 fill-rose-500" : "text-border fill-transparent"}
            />
          ))}
        </div>
      </div>

      {/* Main Board Card */}
      <Card className="p-5 text-center space-y-4 border-border/80 shadow-lg">
        {/* Gallows */}
        <div className="py-2">
          {renderHangmanSVG()}
        </div>

        {/* Clue / Hint */}
        <div className="p-2.5 rounded-xl bg-card2 border border-border/50 text-xs text-text-secondary flex items-center justify-center gap-2">
          <HelpCircle size={15} className="text-amber-400 flex-shrink-0" />
          <span>{currentItem.hint}</span>
        </div>

        {/* Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-3 min-h-[50px]">
          {wordClean.split('').map((letter, idx) => {
            if (letter === ' ') {
              return <div key={idx} className="w-4" />
            }
            const revealed = guessedLetters.has(letter) || isWordLost
            return (
              <div
                key={idx}
                className={`w-9 h-11 rounded-xl border flex items-center justify-center text-lg font-black transition-all ${
                  revealed
                    ? isWordLost && !guessedLetters.has(letter)
                      ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                      : 'border-accent/40 bg-accent/15 text-text-primary'
                    : 'border-border bg-card2 text-transparent'
                }`}
              >
                {revealed ? letter : ''}
              </div>
            )
          })}
        </div>

        {/* Round Feedback */}
        {isRoundOver && (
          <div className="pt-2 animate-slide-up">
            {isWordWon ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>¡Acertaste la palabra! (+20 pts)</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 mb-3">
                <XCircle size={16} />
                <span>Era: "{currentItem.word}"</span>
              </div>
            )}

            <Btn fullWidth size="md" onClick={handleNextWord}>
              <span>{currentIndex + 1 < sessionWords.length ? 'Siguiente palabra' : 'Ver resultado final'}</span>
              <ChevronRight size={16} />
            </Btn>
          </div>
        )}
      </Card>

      {/* On-Screen Keyboard */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 pt-1">
        {ALPHABET.map((letter) => {
          const used = guessedLetters.has(letter)
          const isCorrect = used && wordClean.includes(letter)
          const isWrong = used && !wordClean.includes(letter)

          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={used || isRoundOver}
              className={`h-10 rounded-xl text-xs font-black transition-all active:scale-95 disabled:cursor-not-allowed ${
                isCorrect
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isWrong
                    ? 'bg-white/5 text-muted border border-border/30 opacity-40'
                    : 'bg-card2 hover:bg-card border border-border text-text-primary hover:border-accent/40'
              }`}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </div>
  )
}
