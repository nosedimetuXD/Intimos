import React, { useState, useEffect } from 'react'
import { ListMusic, Plus, Trash2, ExternalLink, Music2, CheckCircle2 } from 'lucide-react'
import { playlistsApi } from '../../api'
import { Card, Btn, Modal } from '../ui'

export default function PlaylistsManagement() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const loadPlaylists = async () => {
    try {
      const list = await playlistsApi.list()
      setPlaylists(list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return

    setSubmitting(true)
    try {
      await playlistsApi.create({
        title: name.trim(),
        description: description.trim(),
        url: url.trim(),
        platform: url.includes('apple') ? 'apple' : 'spotify',
      })
      setMsg('Playlist agregada con éxito')
      setTimeout(() => setMsg(''), 3000)
      setName('')
      setDescription('')
      setUrl('')
      setShowModal(false)
      loadPlaylists()
    } catch (err) {
      alert(err.message || 'Error al guardar playlist')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta playlist?')) return
    try {
      await playlistsApi.delete(id)
      setPlaylists(prev => prev.filter(p => p.id !== id))
      setMsg('Playlist eliminada')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message || 'Error al eliminar playlist')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ListMusic size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary">Playlists del Ministerio</h1>
            <p className="text-xs text-muted">Listas de alabanza de Spotify y Apple Music para la comunidad</p>
          </div>
        </div>
        <Btn onClick={() => setShowModal(true)} size="sm">
          <Plus size={15} />
          <span>Agregar</span>
        </Btn>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-muted">Cargando playlists...</div>
      ) : playlists.length === 0 ? (
        <Card className="text-center py-12">
          <Music2 size={32} className="mx-auto mb-2 opacity-30 text-muted" />
          <p className="text-xs text-muted">No hay playlists personalizadas agregadas.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {playlists.map(pl => (
            <Card key={pl.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-text-primary truncate">{pl.title || pl.name}</h3>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{pl.description}</p>
                <a
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-1 font-mono truncate"
                >
                  <ExternalLink size={10} />
                  <span>{pl.url}</span>
                </a>
              </div>

              <button
                onClick={() => handleDelete(pl.id)}
                className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                title="Eliminar playlist"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nueva Playlist */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Agregar Playlist de Alabanza">
        <form onSubmit={handleAdd} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Nombre de la lista</label>
            <input
              required
              placeholder="Ej. Alabanza Íntimos Jóvenes"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Enlace de Spotify o YouTube</label>
            <input
              type="url"
              required
              placeholder="https://open.spotify.com/playlist/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Btn type="submit" fullWidth disabled={!name.trim() || !url.trim()}>
              Guardar Playlist
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
