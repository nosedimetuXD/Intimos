import React, { useState, useEffect } from 'react'
import { QrCode, Save, ExternalLink, CheckCircle2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { centralApi } from '../../api'
import { Card, Btn } from '../ui'

export default function QRSettings() {
  const [url, setUrl] = useState(window.location.origin)
  const [windowMinutes, setWindowMinutes] = useState(120)
  const [earlyBonusMinutes, setEarlyBonusMinutes] = useState(15)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    centralApi.getQRSettings()
      .then(res => {
        if (res) {
          if (res.invite_url) setUrl(res.invite_url)
          if (res.window_minutes) setWindowMinutes(res.window_minutes)
          if (res.early_bonus_minutes) setEarlyBonusMinutes(res.early_bonus_minutes)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await centralApi.saveQRSettings({
        invite_url: url.trim() || window.location.origin,
        window_minutes: parseInt(windowMinutes) || 120,
        early_bonus_minutes: parseInt(earlyBonusMinutes) || 15,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert(err.message || 'Error al guardar configuración')
    }
  }

  const previewUrl = url.trim() || window.location.origin

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-24 sm:pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <QrCode size={20} className="text-accent-light" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-primary">Configurar QR de Invitación</h1>
          <p className="text-xs text-muted">Solo visible para el equipo pastoral</p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Configuración guardada exitosamente en el servidor</span>
        </div>
      )}

      <Card className="space-y-4">
        <p className="text-xs text-text-secondary leading-relaxed">
          El QR de invitación se proyecta o se comparte para invitar a nuevos jóvenes a registrarse en la plataforma.
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">URL de destino</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://intimos.app"
              className="w-full text-xs"
            />
            <p className="text-[10px] text-muted">
              Puede ser el link de registro de la app o el portal web.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Ventana validez QR (min)</label>
              <input
                type="number"
                value={windowMinutes}
                onChange={e => setWindowMinutes(e.target.value)}
                min={30}
                max={300}
                className="w-full text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Bono puntualidad (min)</label>
              <input
                type="number"
                value={earlyBonusMinutes}
                onChange={e => setEarlyBonusMinutes(e.target.value)}
                min={5}
                max={60}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Btn type="submit" fullWidth>
              <Save size={15} />
              <span>Guardar Configuración</span>
            </Btn>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Btn type="button" variant="secondary">
                <ExternalLink size={15} />
              </Btn>
            </a>
          </div>
        </form>
      </Card>

      {/* QR Preview Card */}
      <Card className="text-center space-y-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider">
          Vista Previa del Código QR
        </p>
        <div className="p-5 bg-white rounded-3xl shadow-xl w-fit mx-auto">
          <QRCodeSVG value={previewUrl} size={210} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Grupo Íntimos</p>
          <p className="text-xs text-muted mt-0.5 break-all max-w-sm mx-auto">{previewUrl}</p>
        </div>
      </Card>
    </div>
  )
}
