import React, { useState, useEffect } from 'react'
import { Star, Save, CheckCircle2 } from 'lucide-react'
import { Card, Btn } from '../ui'

export default function PointsSettings() {
  const [cfg, setCfg] = useState({
    asistencia: 300,
    puntualidad: 75,
    reflexion: 25,
    reto: 100,
    postServicio: 50,
    registro: 50,
    dailyCap: 200,
    monthlyCap: 2500,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_points_settings') || '{}')
      if (stored.asistencia) {
        setCfg(prev => ({ ...prev, ...stored }))
      }
    } catch {}
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('intimos_points_settings', JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Ajustes de Puntos</h1>
          <p className="text-xs text-muted">Configura las recompensas de gamificación para los jóvenes</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
          <Star size={20} />
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Configuración de puntos guardada exitosamente</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Asistencia a culto</label>
              <input
                type="number"
                value={cfg.asistencia}
                onChange={e => setCfg(c => ({ ...c, asistencia: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Bono puntualidad</label>
              <input
                type="number"
                value={cfg.puntualidad}
                onChange={e => setCfg(c => ({ ...c, puntualidad: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Reflexión diaria</label>
              <input
                type="number"
                value={cfg.reflexion}
                onChange={e => setCfg(c => ({ ...c, reflexion: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Dinámica post-servicio</label>
              <input
                type="number"
                value={cfg.postServicio}
                onChange={e => setCfg(c => ({ ...c, postServicio: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Reto semanal base</label>
              <input
                type="number"
                value={cfg.reto}
                onChange={e => setCfg(c => ({ ...c, reto: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Bono por nuevo registro</label>
              <input
                type="number"
                value={cfg.registro}
                onChange={e => setCfg(c => ({ ...c, registro: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Tope diario en juegos</label>
              <input
                type="number"
                value={cfg.dailyCap}
                onChange={e => setCfg(c => ({ ...c, dailyCap: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Tope mensual en juegos</label>
              <input
                type="number"
                value={cfg.monthlyCap}
                onChange={e => setCfg(c => ({ ...c, monthlyCap: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth>
              <Save size={15} />
              <span>Guardar Valores</span>
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  )
}
