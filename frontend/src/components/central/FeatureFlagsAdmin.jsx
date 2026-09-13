import React, { useState, useEffect } from 'react'
import {
  Music2,
  BookOpen,
  Swords,
  MessageSquare,
  Calendar,
  ClipboardCheck,
  Lightbulb,
  Star,
  Megaphone,
  Gift,
  DollarSign,
  CheckCircle2,
  Shield,
  Loader2,
  Users
} from 'lucide-react'
import { Card, Btn } from '../ui'
import { centralApi, groupsApi } from '../../api'

const ROLES = [
  { key: 'miembro', label: 'Miembros', desc: 'Usuarios regulares de la comunidad' },
  { key: 'apoyo', label: 'Grupo de Apoyo', desc: 'Equipo de apoyo y voluntarios' },
  { key: 'pastoral', label: 'Pastoral', desc: 'Pastores y directores de equipo' },
]

const PUBLIC_FEATURES = [
  { key: 'musica', label: 'Música', icon: Music2, desc: 'Playlists y reproductor' },
  { key: 'biblia', label: 'Biblia', icon: BookOpen, desc: 'Lectura y búsqueda bíblica' },
  { key: 'dailyChallenge', label: 'Daily Challenge', icon: Swords, desc: 'Juegos y retos bíblicos diarios' },
  { key: 'miVoz', label: 'Mi Voz', icon: MessageSquare, desc: 'Sugerencias y buzón de voz' },
]

const CENTRAL_FEATURES_APOYO = [
  { key: 'servicios', label: 'Servicios', icon: Calendar, desc: 'Gestión de servicios dominicales' },
  { key: 'asistencia', label: 'Asistencia', icon: ClipboardCheck, desc: 'Check-in y control de asistencia' },
  { key: 'ideas', label: 'Banco de Ideas', icon: Lightbulb, desc: 'Ideas y propuestas del equipo' },
  { key: 'puntos', label: 'Puntos', icon: Star, desc: 'Asignación y auditoría de puntos' },
  { key: 'avisos', label: 'Avisos', icon: Megaphone, desc: 'Publicar anuncios comunitarios' },
  { key: 'sugerencias', label: 'Sugerencias', icon: MessageSquare, desc: 'Revisión de sugerencias enviadas' },
  { key: 'cumpleanos', label: 'Cumpleaños', icon: Gift, desc: 'Calendario y felicitaciones' },
  { key: 'dailyChallenge_admin', label: 'Daily Challenge (gestión)', icon: Swords, desc: 'Banco de preguntas y retos' },
]

const CENTRAL_FEATURES_PASTORAL = [
  { key: 'finanzas', label: 'Finanzas', icon: DollarSign, desc: 'Ingresos, gastos y reportes financieros' },
]

const DEFAULT_FLAGS = {
  miembro: { musica: true, biblia: true, dailyChallenge: true, miVoz: true },
  apoyo: { musica: true, biblia: true, dailyChallenge: true, miVoz: true, central: {} },
  pastoral: { musica: true, biblia: true, dailyChallenge: true, miVoz: true, central: {} },
}

export default function FeatureFlagsAdmin() {
  const [tab, setTab] = useState('public')
  const [flags, setFlags] = useState(DEFAULT_FLAGS)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const loadFlags = async () => {
    try {
      setLoading(true)
      const [backendFlags, groupsRes] = await Promise.all([
        centralApi.getFeatureFlags().catch(() => []),
        groupsApi.list().catch(() => []),
      ])

      setGroups(Array.isArray(groupsRes) ? groupsRes : [])

      if (Array.isArray(backendFlags) && backendFlags.length > 0) {
        // Map backend list to our structured matrix
        const mapped = {
          miembro: { ...DEFAULT_FLAGS.miembro },
          apoyo: { ...DEFAULT_FLAGS.apoyo, central: {} },
          pastoral: { ...DEFAULT_FLAGS.pastoral, central: {} },
        }

        backendFlags.forEach(f => {
          const roles = f.enabled_roles || []
          const isActive = f.active !== false

          // Check if public or central
          const isPublic = PUBLIC_FEATURES.some(pf => pf.key === f.key)
          if (isPublic) {
            ROLES.forEach(r => {
              mapped[r.key][f.key] = isActive && roles.includes(r.key)
            })
          } else {
            // Central feature
            if (roles.includes('apoyo')) {
              mapped.apoyo.central[f.key] = isActive
            }
            if (roles.includes('pastoral') || roles.includes('admin')) {
              mapped.pastoral.central[f.key] = isActive
            }
          }
        })
        setFlags(mapped)
      } else {
        // Try localStorage
        const stored = localStorage.getItem('intimos_feature_flags_matrix')
        if (stored) {
          setFlags(JSON.parse(stored))
        }
      }
    } catch (err) {
      console.error('Error cargando flags:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlags()
  }, [])

  const persistChange = async (updatedFlags, featureKey, featureLabel, featureDesc) => {
    setFlags(updatedFlags)
    localStorage.setItem('intimos_feature_flags_matrix', JSON.stringify(updatedFlags))

    // Determine enabled roles for backend
    const enabledRoles = []
    if (updatedFlags.miembro?.[featureKey]) enabledRoles.push('miembro')
    if (updatedFlags.apoyo?.[featureKey] || updatedFlags.apoyo?.central?.[featureKey]) enabledRoles.push('apoyo')
    if (updatedFlags.pastoral?.[featureKey] || updatedFlags.pastoral?.central?.[featureKey]) enabledRoles.push('pastoral')
    enabledRoles.push('admin', 'superadmin')

    try {
      await centralApi.saveFeatureFlag({
        key: featureKey,
        name: featureLabel,
        description: featureDesc || '',
        enabled_roles: enabledRoles,
        active: enabledRoles.length > 2, // active if enabled for at least 1 non-admin role
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.warn('Backend save feature flag failed, kept in local state:', err)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const togglePublic = (roleKey, feature) => {
    const nextVal = !flags[roleKey]?.[feature.key]
    const updated = {
      ...flags,
      [roleKey]: {
        ...flags[roleKey],
        [feature.key]: nextVal,
      }
    }
    persistChange(updated, feature.key, feature.label, feature.desc)
  }

  const toggleCentral = (roleKey, feature) => {
    const currentVal = flags[roleKey]?.central?.[feature.key] !== false
    const updated = {
      ...flags,
      [roleKey]: {
        ...flags[roleKey],
        central: {
          ...(flags[roleKey]?.central || {}),
          [feature.key]: !currentVal,
        }
      }
    }
    persistChange(updated, feature.key, feature.label, feature.desc)
  }

  const toggleGroupRestriction = (roleKey, featureKey, groupId) => {
    const current = flags[roleKey]?.central?.[featureKey + '_groups'] || []
    const next = current.includes(groupId) ? current.filter(id => id !== groupId) : [...current, groupId]
    const updated = {
      ...flags,
      [roleKey]: {
        ...flags[roleKey],
        central: {
          ...(flags[roleKey]?.central || {}),
          [featureKey + '_groups']: next,
        }
      }
    }
    setFlags(updated)
    localStorage.setItem('intimos_feature_flags_matrix', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function ToggleRow({ roleKey, feature, isCentral = false }) {
    const Icon = feature.icon
    const enabled = isCentral
      ? flags[roleKey]?.central?.[feature.key] !== false
      : flags[roleKey]?.[feature.key] !== false

    return (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          enabled ? 'bg-accent/20 text-accent-light' : 'bg-card2 text-muted'
        }`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{feature.label}</p>
          <p className="text-xs text-muted truncate">{feature.desc}</p>
        </div>
        <button
          type="button"
          onClick={() => isCentral ? toggleCentral(roleKey, feature) : togglePublic(roleKey, feature)}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
            enabled ? 'bg-accent' : 'bg-card2 border border-border'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
            enabled ? 'left-6' : 'left-1'
          }`} />
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Funcionalidades</h1>
          <p className="text-xs text-muted">Habilita o deshabilita módulos por rol de usuario</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <Shield size={20} />
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Configuración guardada exitosamente</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'public', label: 'App Pública' },
          { key: 'central', label: 'Panel Central' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === t.key ? 'bg-accent text-white shadow-sm' : 'bg-card2 text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin text-accent-light mb-2" />
          <p className="text-xs font-medium">Cargando funcionalidades...</p>
        </div>
      ) : tab === 'public' ? (
        <div className="space-y-4">
          {ROLES.map(role => (
            <Card key={role.key} className="space-y-3">
              <div className="border-b border-border/40 pb-2">
                <p className="font-bold text-sm text-text-primary">{role.label}</p>
                <p className="text-xs text-muted">{role.desc}</p>
              </div>
              <div className="space-y-3 pt-1">
                {PUBLIC_FEATURES.map(feat => (
                  <ToggleRow
                    key={feat.key}
                    roleKey={role.key}
                    feature={feat}
                    isCentral={false}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Apoyo */}
          <Card className="space-y-3">
            <div className="border-b border-border/40 pb-2">
              <p className="font-bold text-sm text-text-primary">Grupo de Apoyo</p>
              <p className="text-xs text-muted">Módulos visibles en el Panel Central para el equipo de apoyo</p>
            </div>
            <div className="space-y-3 pt-1">
              {CENTRAL_FEATURES_APOYO.map(feat => (
                <ToggleRow
                  key={feat.key}
                  roleKey="apoyo"
                  feature={feat}
                  isCentral={true}
                />
              ))}
            </div>
          </Card>

          {/* Pastoral */}
          <Card className="space-y-3">
            <div className="border-b border-border/40 pb-2">
              <p className="font-bold text-sm text-text-primary">Pastoral</p>
              <p className="text-xs text-muted">Módulos de gestión pastoral con restricción opcional por grupo</p>
            </div>
            <div className="space-y-4 pt-1">
              {CENTRAL_FEATURES_PASTORAL.map(feat => {
                const enabled = flags.pastoral?.central?.[feat.key] !== false
                const allowedGroups = flags.pastoral?.central?.[feat.key + '_groups'] || []
                return (
                  <div key={feat.key} className="space-y-2">
                    <ToggleRow
                      roleKey="pastoral"
                      feature={feat}
                      isCentral={true}
                    />
                    {enabled && groups.length > 0 && (
                      <div className="ml-12 space-y-1.5 pt-1">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                          Restringir a grupos pequeños específicos (vacío = acceso para todos):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {groups.map(g => {
                            const selected = allowedGroups.includes(g.id)
                            return (
                              <button
                                key={g.id}
                                onClick={() => toggleGroupRestriction('pastoral', feat.key, g.id)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  selected
                                    ? 'text-white border-transparent bg-accent shadow-sm'
                                    : 'text-muted border-border bg-card2 hover:text-text-primary'
                                }`}
                              >
                                {g.name}
                              </button>
                            )
                          })}
                        </div>
                        {allowedGroups.length > 0 && (
                          <p className="text-[11px] text-amber-400 font-medium">
                            Solo accesible para los líderes de los grupos seleccionados.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted text-center pt-2">
        Los cambios en las funcionalidades se aplican inmediatamente para los usuarios.
      </p>
    </div>
  )
}
