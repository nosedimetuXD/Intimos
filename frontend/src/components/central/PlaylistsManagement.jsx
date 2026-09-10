import React, { useState, useEffect } from 'react'
import { ListMusic, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Card, Btn, Modal } from '../ui'

export default function PlaylistsManagement() {
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  const loadPlaylists = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_playlists') || '[]')
      setPlaylists(stored)
    } catch {}
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return

    const newPl = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
    }

    const updated = [...playlists, newPl]
    setPlaylists(updated)
    localStorage.setItem('intimos_playlists', JSON.stringify(updated))
    setName('')
    setDescription('')
    setUrl('')
    setShowModal(false)
  }

  const handleDelete = (id) => {
    const updated = playlists.filter(p => p.id !== id)
    setPlaylists(updated)
    localStorage.setItem('intimos_playlists', JSON.stringify(updated))
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Playlists del Ministerio</h1>
          <p className="text-xs text-muted">Administra las listas de reproducción de Spotify visibles en la app</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nueva Playlist</span>
        </Btn>
      </div>

      {playlists.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs text-muted">No hay playlists personalizadas agregadas.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {playlists.map(pl => (
            <Card key={pl.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-text-primary truncate">{pl.name}</h3>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{pl.description}</p>
                <a
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-accent-light hover:underline flex items-center gap-1 mt-1 font-mono truncate"
                >
                  <ExternalLink size={10} />
                  <span>{pl.url}</span>
                </a>
              </div>

              <button
                onClick={() => handleDelete(pl.id)}
                className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
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
              placeholder="Ej. Alabanzas de Adoración 2026"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Descripción</label>
            <input
              placeholder="Ej. Canciones tocadas por la banda del grupo"
              value={description}
              onChange={e => setDescription(e.target.value)}
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
