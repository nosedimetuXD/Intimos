import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  Star, 
  Megaphone, 
  MessageSquare, 
  Gift, 
  Lightbulb, 
  DollarSign, 
  UserCog, 
  Tent,
  BookOpen,
  QrCode,
  ListMusic,
  BarChart2,
  UsersRound,
  Settings,
  Zap,
  Swords
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { centralApi, servicesApi } from '../api'
import { Card } from '../components/ui'

function StatCard({ icon: Icon, label, value, to, color = '#2563EB' }) {
  return (
    <Link to={to}>
      <Card className="hover:border-accent/40 transition-all hover:-translate-y-0.5 cursor-pointer h-full">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-muted leading-tight">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function CentralHome() {
  const { isPastoral, canManageUsers, isSuperAdmin } = useAuth()
  const [usersCount, setUsersCount] = useState(28)
  const [servicesCount, setServicesCount] = useState(1)
  const [announcementsCount, setAnnouncementsCount] = useState(1)
  const [suggestionsCount, setSuggestionsCount] = useState(2)
  const [completionsCount, setCompletionsCount] = useState(4)

  useEffect(() => {
    centralApi.getUsers().then(u => {
      if (u && u.length > 0) setUsersCount(u.length)
    }).catch(() => {})

    servicesApi.list().then(s => {
      if (s) {
        const up = s.filter(x => x.status === 'upcoming').length
        setServicesCount(up)
      }
    }).catch(() => {})

    centralApi.getAnnouncements().then(a => {
      if (a && a.length > 0) setAnnouncementsCount(a.length)
    }).catch(() => {})

    try {
      const sugs = JSON.parse(localStorage.getItem('intimos_suggestions') || '[]')
      if (sugs.length > 0) setSuggestionsCount(sugs.filter(s => s.status === 'recibida').length)
    } catch {}
  }, [])

  const modules = [
    { to: '/central/servicios', icon: Calendar, label: 'Servicios', desc: 'Crear y gestionar servicios' },
    { to: '/central/asistencia', icon: CheckSquare, label: 'Asistencia', desc: 'Check-in y registros' },
    { to: '/central/directorio', icon: Users, label: 'Directorio', desc: 'Ver todos los miembros' },
    { to: '/central/puntos', icon: Star, label: 'Puntos', desc: 'Gestionar puntaje' },
    { to: '/central/avisos', icon: Megaphone, label: 'Avisos', desc: 'Publicar anuncios' },
    { to: '/central/sugerencias', icon: MessageSquare, label: 'Sugerencias', desc: 'Revisar feedback' },
    { to: '/central/ideas', icon: Lightbulb, label: 'Ideas', desc: 'Banco de ideas' },
    { to: '/central/cumpleanos', icon: Gift, label: 'Cumpleaños', desc: 'Gestionar fechas' },
    { to: '/central/campamento', icon: Tent, label: 'Campamento', desc: 'Descuentos por asistencia' },
    ...(isPastoral ? [
      { to: '/central/finanzas', icon: DollarSign, label: 'Finanzas', desc: 'Ingresos y egresos' },
    ] : []),
    ...(canManageUsers ? [
      { to: '/central/usuarios', icon: UserCog, label: 'Usuarios', desc: 'Gestión de cuentas' },
    ] : []),
  ]

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24 sm:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Central</h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">Panel del equipo de liderazgo</p>
      </div>

      {/* Quick Stats Grid (2 columns on mobile, 3 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Miembros activos" value={usersCount} to="/central/directorio" color="#2563EB" />
        <StatCard icon={Calendar} label="Servicios próximos" value={servicesCount} to="/central/servicios" color="#EC4899" />
        <StatCard icon={MessageSquare} label="Sugerencias nuevas" value={suggestionsCount} to="/central/sugerencias" color="#F59E0B" />
        <StatCard icon={CheckSquare} label="Reto: completaciones" value={completionsCount} to="/central/retos" color="#10B981" />
        <StatCard icon={Megaphone} label="Avisos publicados" value={announcementsCount} to="/central/avisos" color="#9333EA" />
        <StatCard icon={Star} label="Módulos activos" value={isPastoral ? 11 : 9} to="/central" color="#7C3AED" />
      </div>

      {/* Quick Nav Grid */}
      <div>
        <h2 className="font-bold text-muted mb-3 text-xs uppercase tracking-wider">
          Acceso rápido
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {modules.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to}>
              <Card className="hover:border-accent/40 transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <Icon size={20} className="text-accent-light mb-2" />
                <p className="text-xs sm:text-sm font-bold text-text-primary">{label}</p>
                <p className="text-[10px] text-muted mt-0.5 leading-snug">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
