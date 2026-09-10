import React, { useState, useEffect } from 'react'
import { Music2, ExternalLink, Play } from 'lucide-react'
import { Card, Empty } from '../components/ui'

const DEFAULT_PLAYLISTS = [
  {
    id: '1',
    name: 'Alabanza & Adoración Íntimos',
    description: 'Canciones que cantamos en nuestros encuentros juveniles',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXdgnKGsv29h8',
  },
  {
    id: '2',
    name: 'Conexión Profunda',
    description: 'Música para tu devocional y tiempo a solas con Dios',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWVzPjqh7R4Fq',
  },
  {
    id: '3',
    name: 'Gospel & Acoustic',
    description: 'Acústicos y momentos de comunión',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
  },
]

function PlaylistCard({ playlist }) {
  const openSpotify = () => {
    window.open(playlist.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div onClick={openSpotify} className="w-full cursor-pointer">
      <Card className="hover:border-emerald-500/40 transition-all active:scale-[0.99] text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-950 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-900/30">
            <Music2 size={24} className="text-emerald-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary text-xs sm:text-sm truncate">{playlist.name}</p>
            <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{playlist.description}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ♫ Spotify
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105">
              <Play size={14} className="text-white ml-0.5 fill-white" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function MusicScreen() {
  const [playlists, setPlaylists] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('intimos_playlists') || '[]')
      if (stored.length > 0) {
        setPlaylists(stored)
      } else {
        setPlaylists(DEFAULT_PLAYLISTS)
      }
    } catch {
      setPlaylists(DEFAULT_PLAYLISTS)
    }
  }, [])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-6">
      {/* Header Banner */}
      <div 
        className="relative overflow-hidden rounded-3xl p-5 border border-emerald-500/25"
        style={{ background: 'linear-gradient(135deg, #092615 0%, #0c140e 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <Music2 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Música del Grupo</h1>
            <p className="text-xs text-emerald-300/80">Playlists oficiales de alabanza en Spotify</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {playlists.map(pl => (
          <PlaylistCard key={pl.id} playlist={pl} />
        ))}
      </div>

      <p className="text-[11px] text-muted text-center pt-2">
        Toca cualquier playlist para abrirla en tu reproductor de Spotify
      </p>
    </div>
  )
}
