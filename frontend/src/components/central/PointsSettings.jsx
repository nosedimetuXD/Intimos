import React, { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Star,
  Gamepad2,
  Flame,
  Zap,
  TrendingUp,
  Info,
  Award,
  Sprout,
  Trees,
  BookOpen,
  Swords,
  Mail,
  Sun,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, Btn } from '../ui'
import { centralApi } from '../../api'

const LEVEL_ICONS = [
  Sprout,
  Trees,
  BookOpen,
  Swords,
  Mail,
  Sun,
]

export const DEFAULT_LEVELS = [
  { level: 1, name: 'Semilla', min: 0, color: '#10b981', desc: 'Estás empezando el camino. Aquí se siembra: asiste, juega y lee.' },
  { level: 2, name: 'Raíz', min: 500, color: '#059669', desc: 'Constancia y perseverancia: lo que nadie ve pero sostiene todo.' },
  { level: 3, name: 'Discípulo', min: 2000, color: '#3b82f6', desc: 'Aprendes con intención y comienzas a aplicar la Palabra viva.' },
  { level: 4, name: 'Guerrero', min: 5000, color: '#8b5cf6', desc: 'Peleas la buena batalla y sostienes tu fe con valentía.' },
  { level: 5, name: 'Mensajero', min: 10000, color: '#f59e0b', desc: 'Invitas, acompañas y compartes las buenas nuevas con los demás.' },
  { level: 6, name: 'Portador de Luz', min: 20000, color: '#f97316', desc: 'El nivel más alto. Tu testimonio constante ilumina el camino de otros.' },
]

export const DEFAULT_CONFIG = {
  // Comunidad
  invitado: 500,
  invitadoPadrino: 100,
  asistencia: 300,
  asistenciaTemprano: 75,
  asistenciaPadrino: 100,
  reto: 150,
  retoPadrino: 50,
  postServicio: 150,
  postServicioPadrino: 50,
  reflexion: 25,

  // Daily Challenge
  vfAcierto: 8,
  vfBonusRapido: 4,
  vfBonusMedio: 2,
  qhAcierto: 10,
  r60Acierto: 5,
  vofAcierto: 5,
  ahorcadoGanado: 15,
  ordenaAcierto: 12,

  // Rachas
  bonusRacha3: 10,
  bonusRacha7: 25,
  bonusRacha30: 100,

  // Topes
  dailyCapEnabled: true,
  dailyCap: 200,
  monthlyCapEnabled: true,
  monthlyGameCap: 2500,

  // Hora Sagrada
  hora3Enabled: true,
  hora3Multiplier: 2,

  levels: DEFAULT_LEVELS,
}

const GROUPS = [
  {
    title: 'Comunidad',
    icon: Star,
    hint: 'Acciones presenciales y pastorales. No cuentan para el tope diario de juegos.',
    fields: [
      ['asistencia', 'Asistir a un servicio dominical'],
      ['asistenciaTemprano', 'Bono por puntualidad (llegada temprana)'],
      ['asistenciaPadrino', 'Padrino: por asistencia de su apadrinado'],
      ['reto', 'Reto semanal completado'],
      ['retoPadrino', 'Padrino: por reto de su apadrinado'],
      ['reflexion', 'Reflexión del versículo del día'],
      ['postServicio', 'Dinámica post-servicio'],
      ['postServicioPadrino', 'Padrino: por dinámica de su apadrinado'],
      ['invitado', 'Nuevo invitado que asiste por primera vez'],
      ['invitadoPadrino', 'Padrino: por nuevo invitado'],
    ],
  },
  {
    title: 'Daily Challenge & Juegos',
    icon: Gamepad2,
    hint: 'Puntos por respuesta acertada en juegos bíblicos (sujetos a tope diario).',
    fields: [
      ['vfAcierto', 'Verso Flash — acierto base'],
      ['vfBonusRapido', 'Verso Flash — respuesta en < 3 s'],
      ['vfBonusMedio', 'Verso Flash — respuesta en < 6 s'],
      ['qhAcierto', '¿Qué Harías? — acierto bíblico'],
      ['r60Acierto', 'Reto 60 seg — por respuesta correcta'],
      ['vofAcierto', 'Verdadero o Falso — acierto'],
      ['ahorcadoGanado', 'Ahorcado Bíblico — palabra acertada'],
      ['ordenaAcierto', 'Ordena el Versículo — pasaje correcto'],
    ],
  },
  {
    title: 'Rachas de Devoción',
    icon: Flame,
    hint: 'Bonificación otorgada al completar el reto manteniendo días seguidos.',
    fields: [
      ['bonusRacha3', 'Bono al alcanzar 3 días consecutivos'],
      ['bonusRacha7', 'Bono al alcanzar 7 días consecutivos'],
      ['bonusRacha30', 'Bono al alcanzar 30 días consecutivos'],
    ],
  },
]

function NumberRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
      <span className="flex-1 text-xs sm:text-sm text-text-secondary">{label}</span>
      <input
        type="number"
        value={value ?? 0}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-24 text-right text-xs py-1 px-2 rounded-lg bg-card2 border border-border text-text-primary"
      />
    </div>
  )
}

export default function PointsSettings() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await centralApi.getPointsConfig()
      if (res && typeof res === 'object' && Object.keys(res).length > 0) {
        setCfg(prev => ({
          ...DEFAULT_CONFIG,
          ...res,
          levels: Array.isArray(res.levels) && res.levels.length > 0 ? res.levels : DEFAULT_LEVELS,
        }))
      }
    } catch (err) {
      console.warn('Usando configuración local de puntos:', err)
      const stored = localStorage.getItem('intimos_points_config_v2')
      if (stored) {
        try {
          setCfg(JSON.parse(stored))
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const setField = (key, value) => {
    setCfg(c => ({ ...c, [key]: value }))
    setDirty(true)
  }

  const setLevel = (idx, key, value) => {
    setCfg(c => ({
      ...c,
      levels: (c.levels || DEFAULT_LEVELS).map((l, i) => i === idx ? { ...l, [key]: value } : l),
    }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const sortedLevels = [...(cfg.levels || DEFAULT_LEVELS)]
        .sort((a, b) => a.min - b.min)
        .map((l, i) => ({ ...l, level: i + 1 }))

      const payload = { ...cfg, levels: sortedLevels }
      await centralApi.savePointsConfig(payload)
      localStorage.setItem('intimos_points_config_v2', JSON.stringify(payload))
      setCfg(payload)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      // Still persist locally
      localStorage.setItem('intimos_points_config_v2', JSON.stringify(cfg))
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm('¿Restaurar todos los valores por defecto del sistema?')) return
    setCfg(DEFAULT_CONFIG)
    setDirty(true)
  }

  // Monthly simulation stats
  const maxJuegosMes = (cfg.dailyCapEnabled ? (cfg.dailyCap || 200) : 200) * 30
  const maxComunidadMes = ((cfg.asistencia || 300) * 4) + ((cfg.reto || 150) * 4) + ((cfg.reflexion || 25) * 30) + ((cfg.postServicio || 150) * 4)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 pb-24 sm:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-text-primary">Ajustes de Puntos</h1>
          <p className="text-xs text-muted">Configura las recompensas por acción, topes y escala de niveles</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" size="sm" onClick={handleReset} title="Restaurar valores">
            <RotateCcw size={14} />
          </Btn>
          <Btn size="sm" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Guardar</span>
          </Btn>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Configuración guardada exitosamente en el servidor</span>
        </div>
      )}

      {dirty && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          Hay cambios pendientes por guardar en la configuración de puntos.
        </div>
      )}

      {/* Info explicativa */}
      <Card className="border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={16} />
          </div>
          <div className="text-xs text-text-secondary leading-relaxed space-y-1.5">
            <p>
              El sistema combina <strong className="text-text-primary">dos fuentes de puntos</strong>: Comunidad presencial (asistencia, retos de liderazgo, reflexiones) y Juegos formativos del Daily Challenge.
            </p>
            <p>
              Los juegos cuentan con un <strong className="text-text-primary">tope diario</strong> para premiar el compromiso real y la asistencia física sobre el tiempo dedicado frente a la pantalla.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin text-accent-light mb-2" />
          <p className="text-xs font-medium">Cargando configuración...</p>
        </div>
      ) : (
        <>
          {/* Tope Diario & Mensual */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-text-primary">Tope de Puntos en Juegos</h2>
                  <p className="text-[11px] text-muted">Límite para evitar abuso de puntos en juegos digitales</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setField('dailyCapEnabled', !cfg.dailyCapEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                  cfg.dailyCapEnabled ? 'bg-accent' : 'bg-card2 border border-border'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  cfg.dailyCapEnabled ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {cfg.dailyCapEnabled && (
              <NumberRow
                label="Máximo de puntos por día en juegos"
                value={cfg.dailyCap}
                onChange={v => setField('dailyCap', v)}
              />
            )}

            <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-card2/80">
                <p className="text-base sm:text-lg font-black text-accent-light">{maxJuegosMes.toLocaleString('es-CO')} pts</p>
                <p className="text-[10px] text-muted mt-0.5">Tope máx. juegos al mes</p>
              </div>
              <div className="p-2.5 rounded-xl bg-card2/80">
                <p className="text-base sm:text-lg font-black text-emerald-400">{maxComunidadMes.toLocaleString('es-CO')} pts</p>
                <p className="text-[10px] text-muted mt-0.5">Comunidad al mes (4 servicios)</p>
              </div>
            </div>
          </Card>

          {/* Hora Sagrada (3 AM) */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-text-primary">Hora Sagrada (Madrugada)</h2>
                  <p className="text-[11px] text-muted">Multiplicador especial para oraciones y devocionales nocturnos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setField('hora3Enabled', !cfg.hora3Enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                  cfg.hora3Enabled ? 'bg-purple-600' : 'bg-card2 border border-border'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  cfg.hora3Enabled ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {cfg.hora3Enabled && (
              <div className="pt-2 border-t border-border/40">
                <NumberRow
                  label="Multiplicador de puntos de madrugada (ej. 2x)"
                  value={cfg.hora3Multiplier}
                  onChange={v => setField('hora3Multiplier', v)}
                />
              </div>
            )}
          </Card>

          {/* Categorías de valores */}
          {GROUPS.map(({ title, icon: Icon, hint, fields }) => (
            <Card key={title} className="space-y-3">
              <div className="border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-text-primary">{title}</h2>
                    <p className="text-[11px] text-muted">{hint}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {fields.map(([key, label]) => (
                  <NumberRow
                    key={key}
                    label={label}
                    value={cfg[key]}
                    onChange={v => setField(key, v)}
                  />
                ))}
              </div>
            </Card>
          ))}

          {/* Escala de Niveles */}
          <Card className="space-y-3">
            <div className="border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Award size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-text-primary">Niveles de Crecimiento</h2>
                  <p className="text-[11px] text-muted">Puntos acumulados requeridos para desbloquear cada rango</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {(cfg.levels || DEFAULT_LEVELS).map((lvl, idx) => {
                const IconComponent = LEVEL_ICONS[idx] || Award
                return (
                  <div
                    key={lvl.name}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-card2/80 border border-border/40"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${lvl.color}20`, color: lvl.color }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold" style={{ color: lvl.color }}>
                        {lvl.name}
                      </p>
                      <p className="text-[10px] text-muted">Nivel {idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-muted font-medium">desde</span>
                      <input
                        type="number"
                        value={lvl.min}
                        disabled={idx === 0}
                        onChange={e => setLevel(idx, 'min', parseInt(e.target.value, 10) || 0)}
                        className="w-24 text-right text-xs py-1 px-2 rounded-lg bg-card border border-border text-text-primary disabled:opacity-50"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Btn fullWidth onClick={handleSave} disabled={!dirty || saving}>
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Save size={16} />}
            <span>Guardar Todos los Ajustes de Puntos</span>
          </Btn>
        </>
      )}
    </div>
  )
}
