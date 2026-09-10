import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  Gamepad2, 
  BookOpen, 
  Users, 
  User, 
  ShieldAlert, 
  LogOut,
  Sparkles
} from 'lucide-react'

export default function Layout({ children }) {
  const { currentUser, totalPoints, level, isTeam, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/home', label: 'Inicio', icon: Home },
    { to: '/retos', label: 'Retos', icon: Gamepad2 },
    { to: '/biblia', label: 'Biblia', icon: BookOpen },
    { to: '/comunidad', label: 'Ranking', icon: Users },
    { to: '/perfil', label: 'Perfil', icon: User },
  ]

  if (isTeam) {
    navItems.push({ to: '/central', label: 'Central', icon: ShieldAlert, highlight: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-24">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
            Í
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Íntimos <span className="text-xs font-normal text-indigo-400">De Cerca</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              {currentUser?.full_name?.split(' ')[0] || 'Miembro'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Points Chip */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-full px-3 py-1 text-xs shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">{totalPoints}</span>
            <span className="text-[10px] text-slate-400 font-medium">pts</span>
          </div>

          {/* Level Badge */}
          <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-2.5 py-0.5 hidden sm:inline-block">
            {level}
          </span>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 text-[11px] font-medium
                  ${isActive 
                    ? item.highlight 
                      ? 'bg-rose-500/20 text-rose-300 font-bold' 
                      : 'bg-indigo-600/20 text-indigo-400 font-bold scale-105' 
                    : item.highlight 
                      ? 'text-rose-400/70 hover:text-rose-300' 
                      : 'text-slate-400 hover:text-slate-200'}
                `}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${item.highlight ? 'text-rose-400' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
