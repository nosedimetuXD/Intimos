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
  const [stats, setStats] = useState({
    active_users: 0,
    upcoming_services: 0,
    pending_suggestions: 0,
    challenge_completions: 0,
    announcements: 0,
  })

  useEffect(() => {
    centralApi.getStats()
      .then(res => {
        if (res) setStats(res)
      })
      .catch(() => {
        // Fallback to individual calls if needed
        centralApi.getUsers().then(u => {
          if (u) setStats(prev => ({ ...prev, active_users: u.length }))
        }).catch(() => {})
        servicesApi.list().then(s => {
          if (s) setStats(prev => ({ ...prev, upcoming_services: s.filter(x => x.status === 'upcoming').length }))
        }).catch(() => {})
        centralApi.getAnnouncements().then(a => {
          if (a) setStats(prev => ({ ...prev, announcements: a.length }))
        }).catch(() => {})
      })
  }, [])

  const teamModules = [
    { to: '/central/servicios', icon: Calendar, label: 'Servicios', desc: 'Crear y gestionar servicios' },
    { to: '/central/asistencia', icon: CheckSquare, label: 'Asistencia', desc: 'Check-in y registros' },
    { to: '/central/directorio', icon: Users, label: 'Directorio', desc: 'Ver todos los miembros' },
    { to: '/central/puntos', icon: Star, label: 'Puntos', desc: 'Gestionar puntaje' },
    { to: '/central/avisos', icon: Megaphone, label: 'Avisos', desc: 'Publicar anuncios' },
    { to: '/central/sugerencias', icon: MessageSquare, label: 'Sugerencias', desc: 'Revisar feedback' },
    { to: '/central/ideas', icon: Lightbulb, label: 'Ideas', desc: 'Banco de ideas' },
    { to: '/central/cumpleanos', icon: Gift, label: 'Cumpleaños', desc: 'Gestionar fechas' },
    { to: '/central/campamento', icon: Tent, label: 'Campamento', desc: 'Descuentos por asistencia' },
    { to: '/central/retos', icon: Swords, label: 'Reto Semanal', desc: 'Gestionar retos activos' },
    { to: '/central/daily-challenge', icon: Zap, label: 'Reto Diario', desc: 'Configurar juegos bíblicos' },
    ...(canManageUsers ? [
      { to: '/central/usuarios', icon: UserCog, label: 'Usuarios', desc: 'Gestión de cuentas' },
    ] : []),
  ]

  const pastoralModules = [
    { to: '/central/reflexiones', icon: BookOpen, label: 'Reflexiones', desc: 'Moderación de devocionales' },
    { to: '/central/finanzas', icon: DollarSign, label: 'Finanzas', desc: 'Ingresos y egresos' },
    { to: '/central/qr', icon: QrCode, label: 'QR Check-in', desc: 'Configurar y proyectar QR' },
    { to: '/central/playlists', icon: ListMusic, label: 'Playlists', desc: 'Listas de Spotify / Apple' },
    { to: '/central/analytics', icon: BarChart2, label: 'Analítica Juegos', desc: 'Rendimiento en retos' },
  ]

  const superAdminModules = [
    { to: '/central/grupos', icon: UsersRound, label: 'Grupos', desc: 'Administrar grupos y líderes' },
    { to: '/central/funcionalidades', icon: Settings, label: 'Funcionalidades', desc: 'Feature flags activas' },
    { to: '/central/puntos-config', icon: Zap, label: 'Puntos Config', desc: 'Valores y reglas del sistema' },
  ]

  const totalActiveModules = teamModules.length + (isPastoral ? pastoralModules.length : 0) + (isSuperAdmin ? superAdminModules.length : 0)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24 sm:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Central</h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">Panel del equipo de liderazgo</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Miembros registrados" value={stats.active_users || 0} to="/central/directorio" color="#2563EB" />
        <StatCard icon={Calendar} label="Servicios próximos" value={stats.upcoming_services || 0} to="/central/servicios" color="#EC4899" />
        <StatCard icon={MessageSquare} label="Sugerencias pendientes" value={stats.pending_suggestions || 0} to="/central/sugerencias" color="#F59E0B" />
        <StatCard icon={CheckSquare} label="Reto: completaciones" value={stats.challenge_completions || 0} to="/central/retos" color="#10B981" />
        <StatCard icon={Megaphone} label="Avisos publicados" value={stats.announcements || 0} to="/central/avisos" color="#9333EA" />
        <StatCard icon={Star} label="Módulos accesibles" value={totalActiveModules} to="/central" color="#7C3AED" />
      </div>

      {/* Team Modules */}
      <div>
        <h2 className="font-bold text-muted mb-3 text-xs uppercase tracking-wider">
          Módulos de Equipo
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {teamModules.map(({ to, icon: Icon, label, desc }) => (
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

      {/* Pastoral Modules */}
      {isPastoral && (
        <div>
          <h2 className="font-bold text-muted mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-400" />
            Acceso Pastoral
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pastoralModules.map(({ to, icon: Icon, label, desc }) => (
              <Link key={to} to={to}>
                <Card className="hover:border-indigo-400/40 transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <Icon size={20} className="text-indigo-400 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-text-primary">{label}</p>
                  <p className="text-[10px] text-muted mt-0.5 leading-snug">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Super Admin Modules */}
      {isSuperAdmin && (
        <div>
          <h2 className="font-bold text-muted mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Settings size={14} className="text-amber-400" />
            Administración del Sistema
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {superAdminModules.map(({ to, icon: Icon, label, desc }) => (
              <Link key={to} to={to}>
                <Card className="hover:border-amber-400/40 transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <Icon size={20} className="text-amber-400 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-text-primary">{label}</p>
                  <p className="text-[10px] text-muted mt-0.5 leading-snug">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
