import React, { useState, useEffect } from 'react'
import { QrCode, Shield, Save, CheckCircle2 } from 'lucide-react'
import { Card, Btn } from '../ui'

export default function QRSettings() {
  const [windowMinutes, setWindowMinutes] = useState(120)
  const [earlyBonusMinutes, setEarlyBonusMinutes] = useState(15)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('intimos_qr_config') || '{}')
      if (cfg.windowMinutes) setWindowMinutes(cfg.windowMinutes)
      if (cfg.earlyBonusMinutes) setEarlyBonusMinutes(cfg.earlyBonusMinutes)
    } catch {}
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('intimos_qr_config', JSON.stringify({
      windowMinutes: parseInt(windowMinutes),
      earlyBonusMinutes: parseInt(earlyBonusMinutes),
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Configuración de Códigos QR</h1>
          <p className="text-xs text-muted">Parámetros de caducidad y control anti-fraude de check-in</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
          <QrCode size={20} />
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Configuración guardada exitosamente</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              Ventana de validez del QR (en minutos tras inicio del culto)
            </label>
            <input
              type="number"
              value={windowMinutes}
              onChange={e => setWindowMinutes(e.target.value)}
              min={30}
              max={300}
            />
            <p className="text-[10px] text-muted">Tiempo durante el cual el QR aceptará asistencias en el servidor.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              Margen para Bono de Puntualidad (minutos de anticipación)
            </label>
            <input
              type="number"
              value={earlyBonusMinutes}
              onChange={e => setEarlyBonusMinutes(e.target.value)}
              min={5}
              max={60}
            />
            <p className="text-[10px] text-muted">Los asistentes que hagan check-in en este margen reciben +75 pts extra.</p>
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth>
              <Save size={15} />
              <span>Guardar Configuración</span>
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  )
}
