import React from 'react'
import { Trophy, Medal, Award } from 'lucide-react'

export function MedalIcon({ position, size = 16, className = '' }) {
  if (position === 1) return <Trophy size={size} className={`text-amber-400 ${className}`} />
  if (position === 2) return <Medal size={size} className={`text-slate-300 ${className}`} />
  if (position === 3) return <Award size={size} className={`text-amber-600 ${className}`} />
  return <span className={`font-black text-xs text-muted ${className}`}>#{position}</span>
}

export default function MedalBadge({ position, size = 'sm', className = '' }) {
  if (position === 1) {
    return (
      <span className={`inline-flex items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-black shadow-sm shadow-amber-500/10 ${size === 'lg' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} ${className}`}>
        <Trophy size={size === 'lg' ? 18 : 14} className="text-amber-400" />
      </span>
    )
  }
  if (position === 2) {
    return (
      <span className={`inline-flex items-center justify-center rounded-lg bg-slate-300/15 border border-slate-300/30 text-slate-200 font-black shadow-sm ${size === 'lg' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} ${className}`}>
        <Medal size={size === 'lg' ? 18 : 14} className="text-slate-300" />
      </span>
    )
  }
  if (position === 3) {
    return (
      <span className={`inline-flex items-center justify-center rounded-lg bg-amber-700/15 border border-amber-700/30 text-amber-500 font-black shadow-sm ${size === 'lg' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} ${className}`}>
        <Award size={size === 'lg' ? 18 : 14} className="text-amber-600" />
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-white/5 border border-border text-muted font-bold ${size === 'lg' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'} ${className}`}>
      {position}
    </span>
  )
}
