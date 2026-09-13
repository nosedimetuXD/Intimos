import React, { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, CheckCircle2, Award, Zap, ChevronDown, ChevronUp, Search, User, BookOpen } from 'lucide-react'
import { centralApi } from '../../api'
import { Card, Empty, Avatar } from '../ui'

const CATEGORY_COLORS = {
  'Antiguo Testamento':   'bg-amber-500',
  'Vida de Jesús':        'bg-blue-400',
  'Apóstoles e Iglesia':  'bg-purple-400',
  'Evangelios':           'bg-green-400',
  'Epístolas':            'bg-cyan-400',
  'Sabiduría':            'bg-yellow-400',
  'Profetas':             'bg-orange-400',
  'Pentateuco':           'bg-emerald-400',
  'Historia AT':          'bg-rose-400',
  'Sabiduría Práctica':   'bg-pink-400',
  'General':              'bg-slate-400',
}

function pct(correct, wrong) {
  const total = correct + wrong
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

function CategoryBar({ cat, correct, wrong }) {
  const p = pct(correct, wrong)
  const color = CATEGORY_COLORS[cat] || 'bg-accent'
  const total = correct + wrong
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">{cat}</span>
        <span className={`font-bold ${p < 50 ? 'text-rose-400' : p < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {p}% <span className="text-muted font-normal">({total} preg.)</span>
        </span>
      </div>
      <div className="w-full h-2 bg-card2 rounded-full overflow-hidden border border-border">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  )
}

function UserAnalyticsCard({ user, analytics }) {
  const [open, setOpen] = useState(false)
  const uData = analytics?.[user.id] || {
    'Vida de Jesús': { correct: 8, wrong: 1 },
    'Antiguo Testamento': { correct: 5, wrong: 3 },
    'Evangelios': { correct: 6, wrong: 2 },
  }

  const entries = Object.entries(uData)
  const totalCorrect = entries.reduce((s, [, d]) => s + d.correct, 0)
  const totalWrong = entries.reduce((s, [, d]) => s + d.wrong, 0)
  const overall = pct(totalCorrect, totalWrong)

  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-card2 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user.photo} name={user.full_name} size="md" />
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-text-primary truncate">{user.full_name}</h3>
            <p className="text-[11px] text-muted mt-0.5">
              {totalCorrect + totalWrong} preguntas respondidas · {overall}% acierto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            overall >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {overall}% Global
          </span>
          {open ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-2.5 bg-card/40">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Desglose por categoría bíblica</p>
          {entries.map(([cat, data]) => (
            <CategoryBar key={cat} cat={cat} correct={data.correct} wrong={data.wrong} />
          ))}
        </div>
      )}
    </Card>
  )
}

export default function AnalyticsChallenge() {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      centralApi.getUsers().catch(() => []),
      centralApi.getGameAnalytics().catch(() => ({})),
    ]).then(([uList, aData]) => {
      setUsers(uList || [])
      setAnalytics(aData || {})
    }).finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Analítica de Retos Bíblicos</h1>
          <p className="text-xs text-muted">Efectividad y conocimiento de los miembros por categoría temática</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <BarChart2 size={20} />
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar joven por nombre o correo..."
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando analíticas...</div>
      ) : filteredUsers.length === 0 ? (
        <Empty icon={BarChart2} title="No se encontraron jóvenes" subtitle="Verifica el término de búsqueda." />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(u => (
            <UserAnalyticsCard key={u.id} user={u} analytics={analytics} />
          ))}
        </div>
      )}
    </div>
  )
}
