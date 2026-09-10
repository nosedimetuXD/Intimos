import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Clock, BookOpen, MapPin } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { servicesApi } from '../api'
import { Card, Empty } from '../components/ui'

const SERVICE_TYPE_COLORS = {
  'Regular': '#2563EB',
  'Noche de Cine': '#EC4899',
  'Parque': '#10B981',
  'Especial': '#F59E0B',
}

function CalendarView({ services }) {
  const [viewDate, setViewDate] = useState(new Date())
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

  function serviceOnDay(day) {
    return services.filter(s => {
      try { return isSameDay(parseISO(s.scheduled_at || s.date), day) } catch { return false }
    })
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} 
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors text-sm font-bold"
        >
          ‹
        </button>
        <p className="font-bold text-xs sm:text-sm text-text-primary capitalize">
          {format(viewDate, 'MMMM yyyy', { locale: es })}
        </p>
        <button 
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} 
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors text-sm font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[10px] text-muted font-bold py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const svcs = serviceOnDay(day)
          const today = isToday(day)
          return (
            <div 
              key={day.toISOString()} 
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs relative transition-colors ${
                today 
                  ? 'bg-accent/20 text-accent-light font-black border border-accent/40' 
                  : 'hover:bg-white/5 text-text-secondary font-medium'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {svcs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {svcs.slice(0, 2).map((s, idx) => (
                    <span 
                      key={idx} 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ background: SERVICE_TYPE_COLORS[s.type] || '#2563EB' }} 
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 pt-3 border-t border-border">
        {['Regular', 'Noche de Cine', 'Parque', 'Especial'].map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: SERVICE_TYPE_COLORS[type] }} />
            <span className="text-[11px] text-muted font-medium">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ServicesScreen() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    servicesApi.list()
      .then(data => setServices(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = services.filter(s => s.status === 'upcoming')
  const past = services.filter(s => s.status === 'past')
  const displayed = filter === 'upcoming' ? upcoming : filter === 'past' ? past : services
  const sorted = [...displayed].sort((a, b) => {
    try { return new Date(b.scheduled_at) - new Date(a.scheduled_at) } catch { return 0 }
  })

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-text-primary">Servicios</h1>
      </div>

      <CalendarView services={services} />

      <div className="flex gap-2">
        {[['all', 'Todos'], ['upcoming', 'Próximos'], ['past', 'Pasados']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === val 
                ? 'bg-accent text-white shadow-md shadow-accent/25' 
                : 'bg-card text-muted border border-border hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted">Cargando servicios...</div>
      ) : sorted.length === 0 ? (
        <Empty icon="📅" title="No hay servicios" subtitle="Pronto aparecerán aquí los próximos servicios del grupo." />
      ) : (
        <div className="space-y-2.5">
          {sorted.map(svc => (
            <Link key={svc.id} to={`/servicios/${svc.id}`}>
              <Card className="hover:border-accent/40 transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `${SERVICE_TYPE_COLORS[svc.type || 'Regular']}20`, 
                      border: `1px solid ${SERVICE_TYPE_COLORS[svc.type || 'Regular']}40` 
                    }}
                  >
                    <Calendar size={18} style={{ color: SERVICE_TYPE_COLORS[svc.type || 'Regular'] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-text-primary text-xs sm:text-sm leading-tight truncate">
                        {svc.title}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 border ${
                        svc.status === 'upcoming' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                          : 'bg-card2 text-muted border-border'
                      }`}>
                        {svc.status === 'upcoming' ? 'Próximo' : 'Pasado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(svc.scheduled_at), "d 'de' MMMM · h:mm a", { locale: es })}
                      </span>
                    </div>

                    {svc.location && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                        <MapPin size={12} />
                        <span>{svc.location}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
