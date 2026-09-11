import React from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

// ── BUTTON ───────────────────────────────────────────────────────────────────
export function Btn({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  type = 'button', 
  disabled = false, 
  fullWidth = false 
}) {
  const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs gap-2',
    lg: 'px-5 py-3 text-sm gap-2',
  }
  
  const variants = {
    primary: 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/25 border border-blue-400/20',
    secondary: 'bg-card2 hover:bg-[#252525] text-text-primary border border-border',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30',
    ghost: 'hover:bg-white/5 text-text-secondary',
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

// ── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick, noPad = false, style }) {
  const base = `bg-card rounded-2xl border border-border ${noPad ? '' : 'p-4 sm:p-5'} ${
    onClick ? 'cursor-pointer hover:border-accent/40 transition-colors active:scale-[0.99]' : ''
  }`
  
  return (
    <div className={`${base} ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  )
}

// ── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} bg-card border border-border rounded-t-2xl sm:rounded-2xl animate-slide-up overflow-hidden max-h-[90dvh] flex flex-col z-10 shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="font-bold text-text-primary text-sm">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-muted transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  )
}

// ── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  }
  
  const initials = typeof name === 'string' && name.trim()
    ? name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() 
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 border border-border ${className}`}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling?.style.removeProperty('display') }}
      />
    )
  }
  
  return (
    <div className={`${sizes[size]} rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-light font-black flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, label, color = 'accent' }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-[11px] text-muted font-medium">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className="h-2 bg-card2 rounded-full overflow-hidden border border-border/40">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color === 'accent' ? '#2563EB' : color }}
        />
      </div>
    </div>
  )
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, title, subtitle }) {
  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) return Icon
    if (typeof Icon === 'string') {
      return <span className="text-3xl opacity-60">{Icon}</span>
    }
    const Comp = Icon
    return <Comp size={38} strokeWidth={1.5} className="text-muted/70" />
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {Icon && (
        <div className="mb-3 text-muted/60 flex items-center justify-center">
          {renderIcon()}
        </div>
      )}
      <p className="text-text-secondary font-semibold text-sm">{title}</p>
      {subtitle && <p className="text-xs text-muted mt-1 max-w-xs">{subtitle}</p>}
    </div>
  )
}

export { default as LevelBadge, LevelIcon } from './LevelBadge'
export { default as MedalBadge, MedalIcon } from './MedalBadge'

