import React from 'react'
import { Sprout, Compass, Footprints, Landmark, Crown } from 'lucide-react'

export const LEVEL_CONFIG = {
  'Semilla': {
    name: 'Semilla',
    icon: Sprout,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    pillColor: 'text-emerald-300',
  },
  'Buscador': {
    name: 'Buscador',
    icon: Compass,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/25',
    pillColor: 'text-sky-300',
  },
  'Discípulo': {
    name: 'Discípulo',
    icon: Footprints,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/25',
    pillColor: 'text-indigo-300',
  },
  'Pilar': {
    name: 'Pilar',
    icon: Landmark,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    pillColor: 'text-amber-300',
  },
  'Líder': {
    name: 'Líder',
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/25',
    pillColor: 'text-yellow-300',
  },
}

export function LevelIcon({ level = 'Semilla', size = 16, className = '' }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['Semilla']
  const IconComponent = config.icon
  return <IconComponent size={size} className={`${config.color} ${className}`} />
}

export default function LevelBadge({ level = 'Semilla', size = 'sm', showLabel = true, className = '' }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG['Semilla']
  const IconComponent = config.icon

  const sizeStyles = {
    xs: { icon: 12, text: 'text-[10px] px-1.5 py-0.5 gap-1' },
    sm: { icon: 14, text: 'text-xs px-2 py-0.5 gap-1.5' },
    md: { icon: 16, text: 'text-xs px-2.5 py-1 gap-1.5 font-bold' },
    lg: { icon: 20, text: 'text-sm px-3 py-1.5 gap-2 font-bold' },
  }

  const currentSize = sizeStyles[size] || sizeStyles.sm

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.pillColor} ${currentSize.text} ${className}`}>
      <IconComponent size={currentSize.icon} className={config.color} />
      {showLabel && <span>{config.name}</span>}
    </span>
  )
}
