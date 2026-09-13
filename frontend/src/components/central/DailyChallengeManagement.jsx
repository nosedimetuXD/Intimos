import React, { useState, useEffect } from 'react'
import { Swords, Users, BookOpen, HelpCircle, Timer, CheckCircle2, ToggleLeft, Sparkles, Trophy } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, LevelBadge, Avatar } from '../ui'
import { VERSO_FLASH, QUE_HARIAS, RETO_60, VERDADERO_FALSO } from '../../data/gameQuestions'

const BANKS = [
  { id: 'verso_flash', label: 'Verso Flash', icon: BookOpen, data: VERSO_FLASH, color: 'text-blue-400' },
  { id: 'que_harias', label: '¿Qué Harías?', icon: HelpCircle, data: QUE_HARIAS, color: 'text-amber-400' },
  { id: 'reto_60', label: 'Reto 60 seg', icon: Timer, data: RETO_60, color: 'text-orange-400' },
  { id: 'vof', label: 'Verdadero o Falso', icon: CheckCircle2, data: VERDADERO_FALSO, color: 'text-emerald-400' },
]

export default function DailyChallengeManagement() {
  const [users, setUsers] = useState([])
  const [activeBank, setActiveBank] = useState('verso_flash')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    centralApi.getUsers()
      .then(res => setUsers(res || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const selectedBank = BANKS.find(b => b.id === activeBank) || BANKS[0]
  const totalQuestions = VERSO_FLASH.length + QUE_HARIAS.length + RETO_60.length + VERDADERO_FALSO.length

  const topPlayers = [...users]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 10)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-24 sm:pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Swords size={20} className="text-accent-light" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-primary">Daily Challenge</h1>
          <p className="text-xs text-muted">Gestión de banco de preguntas y estadísticas de retos diarios</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 text-center">
          <Users size={16} className="text-accent-light mx-auto mb-1" />
          <p className="text-2xl font-black text-text-primary">{users.length}</p>
          <p className="text-xs text-muted">Jugadores registrados</p>
        </Card>
        <Card className="p-3.5 text-center">
          <BookOpen size={16} className="text-accent-light mx-auto mb-1" />
          <p className="text-2xl font-black text-text-primary">{totalQuestions}</p>
          <p className="text-xs text-muted">Preguntas cargadas</p>
        </Card>
        <Card className="p-3.5 text-center">
          <ToggleLeft size={16} className="text-accent-light mx-auto mb-1" />
          <p className="text-2xl font-black text-text-primary">4</p>
          <p className="text-xs text-muted">Juegos activos</p>
        </Card>
        <Card className="p-3.5 text-center">
          <Trophy size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-amber-400">200 pts</p>
          <p className="text-xs text-muted">Tope diario máx</p>
        </Card>
      </div>

      {/* Bank selector & Preview */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-muted">
            Banco de Preguntas ({selectedBank.data.length} ítems)
          </h2>
        </div>

        {/* Bank tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {BANKS.map(b => {
            const Icon = b.icon
            const isSelected = activeBank === b.id
            return (
              <button
                key={b.id}
                onClick={() => setActiveBank(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-card2 border-border text-muted hover:text-text-primary'
                }`}
              >
                <Icon size={14} />
                <span>{b.label}</span>
              </button>
            )
          })}
        </div>

        {/* Preview items */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {selectedBank.data.slice(0, 15).map((q, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-card2 border border-border text-xs space-y-1">
              <p className="font-bold text-text-primary">
                {q.verse || q.question || q.statement || q.situation}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-muted">
                {q.reference && <span>Ref: <strong className="text-accent-light">{q.reference}</strong></span>}
                {q.correctAnswer && <span>R: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>}
                {q.answer !== undefined && <span>R: <strong className="text-emerald-400">{q.answer ? 'Verdadero' : 'Falso'}</strong></span>}
                {q.explanation && <span className="truncate italic">({q.explanation})</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Players in Games */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-muted">
            Top Jugadores Íntimos
          </h2>
        </div>

        <div className="space-y-2">
          {topPlayers.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card2 border border-border text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-black text-muted w-5 text-center">{i + 1}</span>
                <Avatar src={u.photo} name={u.full_name} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-text-primary truncate">{u.full_name}</p>
                  <p className="text-[10px] text-muted">{u.role || 'Miembro'}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-amber-400">{u.total_points || 0} pts</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
