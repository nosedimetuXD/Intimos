import React, { useState, useEffect } from 'react'
import { Megaphone, Plus, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { centralApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadAnnouncements = async () => {
    try {
      const data = await centralApi.getAnnouncements()
      setAnnouncements(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await centralApi.createAnnouncement({ title: title.trim(), content: content.trim() })
      setTitle('')
      setContent('')
      setShowModal(false)
      loadAnnouncements()
    } catch (err) {
      alert(err.message || 'Error al publicar aviso')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este aviso?')) return
    try {
      await centralApi.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert(err.message || 'Error al eliminar aviso')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Avisos y Anuncios</h1>
          <p className="text-xs text-muted">Publica noticias y avisos oficiales para la comunidad</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Publicar Aviso</span>
        </Btn>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando avisos...</div>
      ) : announcements.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs text-muted">No hay avisos publicados en este momento.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <Card key={ann.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-purple-400" />
                  <h3 className="font-bold text-sm text-text-primary">{ann.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted">
                    {format(new Date(ann.created_at || Date.now()), "d 'de' MMMM", { locale: es })}
                  </span>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded-lg text-muted hover:text-rose-400 transition-colors"
                    title="Eliminar aviso"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{ann.content}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo Aviso */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Publicar Nuevo Aviso">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Título del aviso</label>
            <input
              required
              placeholder="Ej. Este sábado: Encuentro en el parque"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Contenido del aviso</label>
            <textarea
              rows={4}
              required
              placeholder="Escribe los detalles del anuncio..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full resize-none text-xs"
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? 'Publicando...' : 'Publicar Aviso'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
