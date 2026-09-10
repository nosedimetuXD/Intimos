import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  Swords, 
  BookOpen, 
  Users, 
  User, 
  LayoutDashboard, 
  LogOut,
  Flame,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  QrCode
} from 'lucide-react'
import { Avatar } from '../ui'

const LEVEL_EMOJIS = {
  'Semilla': '🌱',
  'Buscador': '🔍',
  'Discípulo': '🌿',
  'Guerrero': '⚔️',
  'Pilar': '🏛️',
  'Líder': '👑'
}

export default function Layout({ children }) {
  const { currentUser, totalPoints, level, isTeam, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isCentral = location.pathname.startsWith('/central')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const publicNav = [
    { path: '/home', label: 'Inicio', icon: Home },
    { path: '/retos', label: 'Retos', icon: Swords },
    { path: '/biblia', label: 'Biblia', icon: BookOpen },
    { path: '/comunidad', label: 'Comunidad', icon: Users },
    { path: '/perfil', label: 'Perfil', icon: User },
  ]

  const navLinkClass = (isActive, collapsed = false) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-accent/15 text-accent-light border border-accent/25 shadow-sm'
        : 'text-muted hover:text-text-primary hover:bg-white/5'
    } ${collapsed ? 'justify-center px-2' : ''}`

  const levelEmoji = LEVEL_EMOJIS[level] || '🌱'

  return (
    <div className="flex h-dvh bg-bg overflow-hidden text-text-primary">
      {/* Desktop Sidebar (hidden on mobile, visible on sm+) */}
      <aside
        className={`hidden sm:flex flex-col border-r border-border transition-all duration-300 flex-shrink-0 h-dvh sticky top-0 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Sidebar Brand Header */}
        <div className={`p-4 border-b border-border flex items-center flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center font-black text-white text-xs shadow-md shadow-accent/40 flex-shrink-0">
                Í
              </div>
              <div>
                <p className="font-black text-xs accent-gradient-text tracking-wide uppercase">
                  {isCentral ? 'Central · Íntimos' : 'Íntimos'}
                </p>
                <p className="text-[10px] text-muted leading-tight">De Cerca</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(c => !c)} 
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted transition-colors"
            title={sidebarCollapsed ? "Expandir" : "Colapsar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {publicNav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
              title={sidebarCollapsed ? label : ''}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {isTeam && (
            <div className="pt-2 border-t border-border/60 mt-2">
              <NavLink
                to="/central"
                className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                title={sidebarCollapsed ? 'Panel Central' : ''}
              >
                <LayoutDashboard size={17} className="flex-shrink-0 text-amber-400" />
                {!sidebarCollapsed && <span className="truncate text-amber-300">Panel Central</span>}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-2.5 border-t border-border space-y-2">
          {!sidebarCollapsed && currentUser && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border">
              <Avatar src={currentUser?.photo} name={currentUser?.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary truncate">{currentUser?.full_name?.split(' ')[0]}</p>
                <p className="text-[10px] text-amber-400 font-semibold">{totalPoints} pts · {levelEmoji} {level}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 border-r border-border flex flex-col animate-slide-in shadow-2xl"
            style={{ background: 'var(--sidebar-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center font-black text-white text-xs shadow-md shadow-accent/40">
                  Í
                </div>
                <div>
                  <p className="font-black text-xs accent-gradient-text tracking-wide uppercase">Íntimos</p>
                  <p className="text-[10px] text-muted">De Cerca</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {publicNav.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}

              {isTeam && (
                <div className="pt-2 border-t border-border/60 mt-2">
                  <NavLink
                    to="/central"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <LayoutDashboard size={18} className="text-amber-400" />
                    <span className="text-amber-300">Panel Central</span>
                  </NavLink>
                </div>
              )}
            </nav>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        {/* Mobile Header */}
        <header
          className="sm:hidden flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0"
          style={{ background: 'var(--sidebar-bg)' }}
        >
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted">
              <Menu size={20} />
            </button>
            <div>
              <p className="font-black text-xs accent-gradient-text tracking-wider uppercase">Íntimos</p>
              <p className="text-[9px] text-muted uppercase tracking-wider font-semibold">De Cerca</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Points Flame Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs font-bold shadow-inner">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span className="text-amber-300">{totalPoints}</span>
              <span className="text-[10px] text-muted font-medium">pts</span>
            </div>

            {/* Level Chip */}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent-light">
              {levelEmoji} {level}
            </span>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter pb-24 sm:pb-6">
            {children}
          </div>
        </main>

        {/* Mobile Floating Glass Bottom Dock */}
        {!isCentral && (
          <nav
            className="sm:hidden fixed z-40 flex"
            style={{
              left: '14px',
              right: '14px',
              bottom: '8px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.65), 0 2px 10px rgba(0,0,0,0.4)',
            }}
          >
            {publicNav.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-accent-light' : 'text-muted hover:text-text-secondary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-accent/20 scale-110 shadow-sm' : ''}`}>
                      <Icon size={18} className={isActive ? 'text-accent-light' : ''} />
                    </div>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
