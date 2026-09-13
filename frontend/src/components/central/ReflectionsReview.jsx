import React, { useState, useEffect } from 'react'
import { BookOpen, Lock, Users, Search, AlertTriangle, Ban, Target, CheckCircle2 } from 'lucide-react'
import { reflectionsApi, centralApi } from '../../api'
import { Card, Btn, Avatar, Modal, Empty } from '../ui'

export default function ReflectionsReview() {
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('reflexiones')
  const [filtro, setFiltro] = useState('todas')
  const [search, setSearch] = useState('')
  const [targetReflection, setTargetReflection] = useState(null)
  const [msg, setMsg] = useState('')

  const loadReflections = async () => {
    try {
      const list = await reflectionsApi.getAll()
      setReflections(list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReflections()
  }, [])

  const handleAnular = async () => {
    if (!targetReflection) return
    try {
      await reflectionsApi.moderate(targetReflection.id, {
        is_approved: false,
        reason: 'Anulada por liderazgo por no cumplir criterios'
      })
      setMsg('Reflexión anulada exitosamente')
      setTimeout(() => setMsg(''), 3000)
      setTargetReflection(null)
      loadReflections()
    } catch (err) {
      alert(err.message || 'Error al anular reflexión')
    }
  }

  const filtradas = reflections
    .filter(r => filtro === 'todas' || (filtro === 'publicas' ? r.is_public : !r.is_public))
    .filter(r => {
      if (!search) return true
      const q = search.toLowerCase()
      return (r.user_name || '').toLowerCase().includes(q) || (r.content || '').toLowerCase().includes(q)
    })

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-24 sm:pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-primary">Moderación de Reflexiones</h1>
          <p className="text-xs text-muted">Lectura pastoral y revisión de devocionales de los jóvenes</p>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('reflexiones')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
            tab === 'reflexiones'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-card text-muted border border-border hover:text-text-primary'
          }`}
        >
          <BookOpen size={14} />
          <span>Reflexiones</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2">
        {[['todas', 'Todas'], ['publicas', 'Públicas'], ['privadas', 'Privadas']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltro(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${
              filtro === v
                ? 'bg-accent text-white border-accent'
                : 'bg-card text-muted border-border hover:text-text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o contenido..."
          style={{ paddingLeft: '38px' }}
        />
      </div>

      <div className="p-3 rounded-xl bg-card2 border border-border">
        <p className="text-[11px] text-muted leading-relaxed">
          Las reflexiones <strong className="text-text-primary">privadas</strong> solo las ve el equipo pastoral. Trátalas con el mismo cuidado que una conversación en confianza. Si una reflexión se escribió sin contenido sustancial para ganar puntos, puedes anularla.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando reflexiones...</div>
      ) : filtradas.length === 0 ? (
        <Empty 
          icon={BookOpen} 
          title="Sin reflexiones para revisar" 
          subtitle="Aún no hay reflexiones que coincidan con los filtros." 
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((r, i) => (
            <Card key={r.id || i} className={r.is_approved === false ? 'opacity-50' : ''}>
              <div className="flex items-start gap-3">
                <Avatar src={r.user_photo} name={r.user_name || 'Miembro'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs sm:text-sm text-text-primary">{r.user_name || 'Anónimo'}</p>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full border flex items-center gap-1 font-semibold ${
                        r.is_public ? 'bg-accent/15 text-accent-light border-accent/25' : 'bg-card2 text-muted border-border'
                      }`}>
                        {r.is_public ? <Users size={10} /> : <Lock size={10} />}
                        <span>{r.is_public ? 'Pública' : 'Privada'}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-muted">
                      {new Date(r.created_at || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-card2 p-3 rounded-xl border border-border mt-2">
                    "{r.content || r.text}"
                  </p>

                  {r.verse_ref && (
                    <p className="text-[10px] text-muted mt-1.5 italic">
                      Versículo: <span className="font-semibold text-text-primary">{r.verse_ref}</span>
                    </p>
                  )}

                  {r.is_approved !== false && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setTargetReflection(r)}
                        className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Ban size={12} />
                        <span>Anular reflexión</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Confirmar Anulación */}
      <Modal
        open={!!targetReflection}
        onClose={() => setTargetReflection(null)}
        title="Anular Reflexión"
      >
        <div className="p-4 space-y-3">
          <p className="text-xs text-text-secondary">
            ¿Confirmas la anulación de la reflexión de <strong>{targetReflection?.user_name}</strong>? Se marcará como no válida y se descontarán los puntos de devocional otorgados.
          </p>
          <div className="pt-2 flex gap-2">
            <Btn fullWidth onClick={handleAnular}>
              Confirmar Anulación
            </Btn>
            <Btn variant="secondary" onClick={() => setTargetReflection(null)}>
              Cancelar
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
