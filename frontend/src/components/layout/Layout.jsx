import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  MessageSquare, 
  Music2, 
  BookOpen, 
  Swords, 
  LayoutDashboard, 
  ClipboardCheck, 
  Lightbulb, 
  Star, 
  Megaphone, 
  Gift, 
  Tent, 
  Zap, 
  UserCog, 
  DollarSign, 
  QrCode, 
  ListMusic, 
  BarChart2, 
  UsersRound, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  LogOut, 
  Sparkles 
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

// ── Public Navigation (App) ──
const publicNav = [
  { path: '/home', label: 'Inicio', icon: Home },
  { path: '/servicios', label: 'Servicios', icon: Calendar },
  { path: '/comunidad', label: 'Comunidad', icon: Users },
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/mi-voz', label: 'Mi Voz', icon: MessageSquare },
]

const publicNavExtra = [
  { path: '/musica', label: 'Música', icon: Music2 },
  { path: '/biblia', label: 'Biblia', icon: BookOpen },
  { path: '/retos', label: 'Daily Challenge', icon: Swords },
]

// ── Central Navigation ──
const centralNav = [
  { path: '/central', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/central/servicios', label: 'Servicios', icon: Calendar },
  { path: '/central/asistencia', label: 'Asistencia', icon: ClipboardCheck },
  { path: '/central/ideas', label: 'Banco de Ideas', icon: Lightbulb },
  { path: '/central/directorio', label: 'Directorio', icon: BookOpen },
  { path: '/central/puntos', label: 'Puntos', icon: Star },
  { path: '/central/avisos', label: 'Avisos', icon: Megaphone },
  { path: '/central/sugerencias', label: 'Sugerencias', icon: MessageSquare },
  { path: '/central/cumpleanos', label: 'Cumpleaños', icon: Gift },
  { path: '/central/campamento', label: 'Campamento', icon: Tent },
  { path: '/central/retos', label: 'Retos semanales', icon: Zap },
  { path: '/central/daily-challenge', label: 'Daily Challenge', icon: Swords },
]

const userManagerNav = [
  { path: '/central/usuarios', label: 'Usuarios', icon: UserCog },
]

const pastoralNav = [
  { path: '/central/reflexiones', label: 'Reflexiones', icon: BookOpen },
  { path: '/central/finanzas', label: 'Finanzas', icon: DollarSign },
  { path: '/central/qr', label: 'Config. QR', icon: QrCode },
  { path: '/central/playlists', label: 'Playlists', icon: ListMusic },
  { path: '/central/analytics', label: 'Analytics Juegos', icon: BarChart2 },
]

const superAdminNav = [
  { path: '/central/grupos', label: 'Grupos', icon: UsersRound },
  { path: '/central/funcionalidades', label: 'Funcionalidades', icon: Settings },
  { path: '/central/puntos-config', label: 'Ajustes de Puntos', icon: Star },
]

export default function Layout({ children }) {
  const { currentUser, totalPoints, level, isTeam, canManageUsers, isPastoral, isSuperAdmin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const isCentral = location.pathname.startsWith('/central')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = (isActive, collapsed = false) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
      isActive
        ? 'bg-accent/20 text-accent-light'
        : 'text-muted hover:text-text-primary hover:bg-white/5'
    } ${collapsed ? 'justify-center px-2' : ''}`

  const levelEmoji = LEVEL_EMOJIS[level] || '🌱'

  return (
    <div className="flex h-dvh bg-bg overflow-hidden text-text-primary">
      {/* Desktop Sidebar (visible on sm+) */}
      <aside
        className={`hidden sm:flex flex-col border-r border-border transition-all duration-300 flex-shrink-0 h-dvh sticky top-0 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <div className={`p-4 border-b border-border flex items-center flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div>
              <p className="font-black text-sm accent-gradient-text tracking-wide">
                {isCentral ? 'Central · Íntimos' : 'Íntimos'}
              </p>
              {isCentral && <p className="text-[10px] text-muted">Panel del equipo</p>}
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(c => !c)} 
            className="p-1 rounded-lg hover:bg-white/5 text-muted transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {isCentral ? (
            <>
              {centralNav.map(({ path, label, icon: Icon, exact }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={exact}
                  className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                  title={sidebarCollapsed ? label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}

              {canManageUsers && (
                <>
                  {!sidebarCollapsed && (
                    <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                      Equipo
                    </div>
                  )}
                  {userManagerNav.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                      title={sidebarCollapsed ? label : ''}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </>
              )}

              {isPastoral && (
                <>
                  {!sidebarCollapsed && (
                    <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                      Pastoral
                    </div>
                  )}
                  {pastoralNav.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                      title={sidebarCollapsed ? label : ''}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </>
              )}

              {isSuperAdmin && (
                <>
                  {!sidebarCollapsed && (
                    <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                      Super Admin
                    </div>
                  )}
                  {superAdminNav.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                      title={sidebarCollapsed ? label : ''}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {publicNav.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                  title={sidebarCollapsed ? label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}

              {!sidebarCollapsed && (
                <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                  Más
                </div>
              )}
              {publicNavExtra.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => navLinkClass(isActive, sidebarCollapsed)}
                  title={sidebarCollapsed ? label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-2 border-t border-border space-y-1">
          {!isCentral && isTeam && (
            <NavLink
              to="/central"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-accent-light bg-accent/10 hover:bg-accent/20 transition-colors font-medium ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Ir a Central' : ''}
            >
              <LayoutDashboard size={15} />
              {!sidebarCollapsed && <span>Ir a Central</span>}
            </NavLink>
          )}

          {isCentral && (
            <NavLink
              to="/home"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-text-primary hover:bg-white/5 transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Volver a la app' : ''}
            >
              <ChevronLeft size={15} />
              {!sidebarCollapsed && <span>Volver a la app</span>}
            </NavLink>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-text-primary hover:bg-white/5 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={`Cambiar a modo ${theme === 'dark' ? 'Claro' : 'Oscuro'}`}
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Cerrar sesión' : ''}
          >
            <LogOut size={15} />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (exact match to screenshots 1, 2, 3) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 border-r border-border flex flex-col animate-slide-in shadow-2xl"
            style={{ background: 'var(--sidebar-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <p className="font-black text-sm accent-gradient-text tracking-wide">
                {isCentral ? 'Central · Íntimos' : 'Íntimos'}
              </p>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {isCentral ? (
                <>
                  {centralNav.map(({ path, label, icon: Icon, exact }) => (
                    <NavLink
                      key={path}
                      to={path}
                      end={exact}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}

                  {canManageUsers && (
                    <>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                        Equipo
                      </div>
                      {userManagerNav.map(({ path, label, icon: Icon }) => (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => navLinkClass(isActive)}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </>
                  )}

                  {isPastoral && (
                    <>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                        Pastoral
                      </div>
                      {pastoralNav.map(({ path, label, icon: Icon }) => (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => navLinkClass(isActive)}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </>
                  )}

                  {isSuperAdmin && (
                    <>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                        Super Admin
                      </div>
                      {superAdminNav.map(({ path, label, icon: Icon }) => (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => navLinkClass(isActive)}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {publicNav.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}

                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider px-3 pt-3 pb-1">
                    Más
                  </div>
                  {publicNavExtra.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </>
              )}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="flex-shrink-0 p-2 border-t border-border space-y-1">
              {!isCentral && isTeam && (
                <NavLink
                  to="/central"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-accent-light bg-accent/10 hover:bg-accent/20 transition-colors font-medium"
                >
                  <LayoutDashboard size={15} />
                  <span>Ir a Central</span>
                </NavLink>
              )}

              {isCentral && (
                <NavLink
                  to="/home"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={15} />
                  <span>Volver a la app</span>
                </NavLink>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                <span>{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={15} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        {/* Mobile Header (matches screenshots 4 & 5) */}
        <header
          className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0"
          style={{ background: 'var(--sidebar-bg)' }}
        >
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
          >
            <Menu size={20} />
          </button>

          <p className="font-black text-sm accent-gradient-text tracking-wide">
            {isCentral ? 'Central · Íntimos' : 'Íntimos'}
          </p>

          {!isCentral ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-card border border-border text-xs font-bold">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                <span className="text-amber-300">{totalPoints}</span>
              </div>
            </div>
          ) : (
            <div className="w-8" />
          )}
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className={`page-enter ${!isCentral ? 'pb-24 sm:pb-6' : 'pb-6'}`}>
            {children}
          </div>
        </main>

        {/* Floating Glass Bottom Dock (only in public app mode) */}
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
