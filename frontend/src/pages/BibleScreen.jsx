import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Card } from '../components/ui'

const TRANSLATIONS = [
  { id: 'rvr1960', label: 'RVR 1960', lang: 'ES', apiCode: 'RV1960' },
  { id: 'nvi', label: 'NVI', lang: 'ES', apiCode: 'NVI' },
]

const BOOKS = [
  { name: 'Génesis', id: 1, chapters: 50 },
  { name: 'Éxodo', id: 2, chapters: 40 },
  { name: 'Levítico', id: 3, chapters: 27 },
  { name: 'Números', id: 4, chapters: 36 },
  { name: 'Deuteronomio', id: 5, chapters: 34 },
  { name: 'Josué', id: 6, chapters: 24 },
  { name: 'Jueces', id: 7, chapters: 21 },
  { name: 'Rut', id: 8, chapters: 4 },
  { name: '1 Samuel', id: 9, chapters: 31 },
  { name: '2 Samuel', id: 10, chapters: 24 },
  { name: '1 Reyes', id: 11, chapters: 22 },
  { name: '2 Reyes', id: 12, chapters: 25 },
  { name: '1 Crónicas', id: 13, chapters: 29 },
  { name: '2 Crónicas', id: 14, chapters: 36 },
  { name: 'Esdras', id: 15, chapters: 10 },
  { name: 'Nehemías', id: 16, chapters: 13 },
  { name: 'Ester', id: 17, chapters: 10 },
  { name: 'Job', id: 18, chapters: 42 },
  { name: 'Salmos', id: 19, chapters: 150 },
  { name: 'Proverbios', id: 20, chapters: 31 },
  { name: 'Eclesiastés', id: 21, chapters: 12 },
  { name: 'Cantares', id: 22, chapters: 8 },
  { name: 'Isaías', id: 23, chapters: 66 },
  { name: 'Jeremías', id: 24, chapters: 52 },
  { name: 'Lamentaciones', id: 25, chapters: 5 },
  { name: 'Ezequiel', id: 26, chapters: 48 },
  { name: 'Daniel', id: 27, chapters: 12 },
  { name: 'Oseas', id: 28, chapters: 14 },
  { name: 'Joel', id: 29, chapters: 3 },
  { name: 'Amós', id: 30, chapters: 9 },
  { name: 'Abdías', id: 31, chapters: 1 },
  { name: 'Jonás', id: 32, chapters: 4 },
  { name: 'Miqueas', id: 33, chapters: 7 },
  { name: 'Nahúm', id: 34, chapters: 3 },
  { name: 'Habacuc', id: 35, chapters: 3 },
  { name: 'Sofonías', id: 36, chapters: 3 },
  { name: 'Hageo', id: 37, chapters: 2 },
  { name: 'Zacarías', id: 38, chapters: 14 },
  { name: 'Malaquías', id: 39, chapters: 4 },
  { name: 'Mateo', id: 40, chapters: 28 },
  { name: 'Marcos', id: 41, chapters: 16 },
  { name: 'Lucas', id: 42, chapters: 24 },
  { name: 'Juan', id: 43, chapters: 21 },
  { name: 'Hechos', id: 44, chapters: 28 },
  { name: 'Romanos', id: 45, chapters: 16 },
  { name: '1 Corintios', id: 46, chapters: 16 },
  { name: '2 Corintios', id: 47, chapters: 13 },
  { name: 'Gálatas', id: 48, chapters: 6 },
  { name: 'Efesios', id: 49, chapters: 6 },
  { name: 'Filipenses', id: 50, chapters: 4 },
  { name: 'Colosenses', id: 51, chapters: 4 },
  { name: '1 Tesalonicenses', id: 52, chapters: 5 },
  { name: '2 Tesalonicenses', id: 53, chapters: 3 },
  { name: '1 Timoteo', id: 54, chapters: 6 },
  { name: '2 Timoteo', id: 55, chapters: 4 },
  { name: 'Tito', id: 56, chapters: 3 },
  { name: 'Filemón', id: 57, chapters: 1 },
  { name: 'Hebreos', id: 58, chapters: 13 },
  { name: 'Santiago', id: 59, chapters: 5 },
  { name: '1 Pedro', id: 60, chapters: 5 },
  { name: '2 Pedro', id: 61, chapters: 3 },
  { name: '1 Juan', id: 62, chapters: 5 },
  { name: '2 Juan', id: 63, chapters: 1 },
  { name: '3 Juan', id: 64, chapters: 1 },
  { name: 'Judas', id: 65, chapters: 1 },
  { name: 'Apocalipsis', id: 66, chapters: 22 },
]

export default function BibleScreen() {
  const [translation, setTranslation] = useState('rvr1960')
  const [bookIdx, setBookIdx] = useState(42) // Juan
  const [chapter, setChapter] = useState(3)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [highlightVerse, setHighlightVerse] = useState(null)
  const [showBooks, setShowBooks] = useState(false)
  const [bookSearch, setBookSearch] = useState('')
  const [fontSize, setFontSize] = useState(15)

  const currentBook = BOOKS[bookIdx] || BOOKS[0]

  const fetchChapter = useCallback(async (bookId, ch, transId) => {
    setLoading(true)
    setError('')
    const apiCode = TRANSLATIONS.find(t => t.id === transId)?.apiCode || 'RV1960'
    const cacheKey = `dc_bible_v2_${apiCode}_${bookId}_${ch}`
    
    // Check local cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsedCached = JSON.parse(cached)
        if (Array.isArray(parsedCached) && parsedCached.length > 0) {
          setVerses(parsedCached)
          setLoading(false)
          return
        }
      }
    } catch {}

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 12000)
      const res = await fetch(`https://bolls.life/get-text/${apiCode}/${bookId}/${ch}/`, {
        signal: controller.signal
      })
      clearTimeout(timer)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        const parsed = data.map(v => ({
          verse: v.verse,
          text: (v.text || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .trim()
        }))
        setVerses(parsed)
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed))
        } catch {}
      } else {
        throw new Error('No se encontró contenido para este capítulo.')
      }
    } catch (e) {
      console.error('Error cargando pasaje:', e)
      setError(e.name === 'AbortError' 
        ? 'Tiempo de espera agotado. Verifica tu conexión a internet.' 
        : 'No se pudo cargar el capítulo completo. Verifica tu conexión a internet.')
      setVerses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChapter(currentBook.id, chapter, translation)
  }, [currentBook.id, chapter, translation, fetchChapter])

  const prevChapter = () => {
    setHighlightVerse(null)
    if (chapter > 1) {
      setChapter(c => c - 1)
    } else if (bookIdx > 0) {
      setBookIdx(b => b - 1)
      setChapter(BOOKS[bookIdx - 1].chapters)
    }
  }

  const nextChapter = () => {
    setHighlightVerse(null)
    if (chapter < currentBook.chapters) {
      setChapter(c => c + 1)
    } else if (bookIdx < BOOKS.length - 1) {
      setBookIdx(b => b + 1)
      setChapter(1)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    const ref = search.trim()
    const parts = ref.split(/\s+/)
    const lastPart = parts[parts.length - 1]
    const chVerse = lastPart.includes(':') ? lastPart.split(':') : [lastPart, '']
    const chNum = parseInt(chVerse[0])
    const vNum = chVerse[1] ? parseInt(chVerse[1]) : null
    const bookName = parts.slice(0, -1).join(' ').toLowerCase()
    
    const found = BOOKS.findIndex(b => b.name.toLowerCase().startsWith(bookName))
    if (found >= 0 && chNum > 0) {
      setBookIdx(found)
      setChapter(Math.min(chNum, BOOKS[found].chapters))
      setHighlightVerse(vNum)
      setSearch('')
    }
  }

  const filteredBooks = bookSearch
    ? BOOKS.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()))
    : BOOKS

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24 sm:pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-accent-light" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Biblia</h1>
            <p className="text-xs text-muted">RVR 1960 · NVI</p>
          </div>
        </div>

        {/* Font size zoom controls */}
        <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl">
          <button 
            onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
            title="Reducir letra"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[10px] font-bold text-text-secondary px-1">{fontSize}px</span>
          <button 
            onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
            title="Aumentar letra"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Translation selector pills */}
      <div className="flex gap-2">
        {TRANSLATIONS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setHighlightVerse(null)
              setTranslation(t.id)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              translation === t.id 
                ? 'bg-accent text-white border-accent shadow-md shadow-accent/25' 
                : 'bg-card text-muted border-border hover:text-text-primary'
            }`}
          >
            {t.label}
            <span className="ml-1 text-[9px] opacity-60 font-normal">({t.lang})</span>
          </button>
        ))}
      </div>

      {/* Quick Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ir a pasaje... Ej: Juan 3:16 o Salmos 23"
          style={{ paddingLeft: '38px', paddingRight: '60px' }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-accent/20 text-accent-light text-xs font-bold hover:bg-accent/30 transition-colors"
        >
          Ir
        </button>
      </form>

      {/* Book + Chapter Select Bar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowBooks(!showBooks)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-left text-xs font-bold text-text-primary hover:border-accent/40 transition-colors flex items-center justify-between"
        >
          <span>{currentBook.name}</span>
          <span className="text-[10px] text-accent-light">Cambiar libro ▾</span>
        </button>

        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button 
            onClick={prevChapter}
            disabled={bookIdx === 0 && chapter === 1}
            className="p-1.5 rounded-lg text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2.5 py-1 text-xs font-black text-text-primary min-w-[3.5rem] text-center">
            Cap. {chapter}
          </span>
          <button 
            onClick={nextChapter}
            disabled={bookIdx === BOOKS.length - 1 && chapter === currentBook.chapters}
            className="p-1.5 rounded-lg text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Book Picker Popover / Modal */}
      {showBooks && (
        <Card className="animate-slide-up border-accent/40">
          <input
            value={bookSearch}
            onChange={e => setBookSearch(e.target.value)}
            placeholder="Buscar libro bíblico..."
            className="mb-3 text-xs"
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredBooks.map((b) => {
              const idx = BOOKS.findIndex(x => x.id === b.id)
              const isSelected = idx === bookIdx
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setBookIdx(idx)
                    setChapter(1)
                    setHighlightVerse(null)
                    setShowBooks(false)
                    setBookSearch('')
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected 
                      ? 'bg-accent text-white font-bold' 
                      : 'text-text-secondary hover:bg-card2'
                  }`}
                >
                  {b.name}
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Chapter Reader Card */}
      <Card className="min-h-[400px]">
        <div className="text-center pb-4 mb-4 border-b border-border">
          <h2 className="text-base font-black text-text-primary">
            {currentBook.name} {chapter}
          </h2>
          <span className="text-[10px] text-accent-light font-bold uppercase tracking-wider">
            {TRANSLATIONS.find(t => t.id === translation)?.label}
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-accent-light" />
            <span>Cargando pasaje bíblico...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle size={20} />
            </div>
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => fetchChapter(currentBook.id, chapter, translation)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-hover transition-colors"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-3.5" style={{ fontSize: `${fontSize}px` }}>
            {verses.map((v) => {
              const isHighlighted = highlightVerse === v.verse
              return (
                <p 
                  key={v.verse} 
                  id={`v-${v.verse}`}
                  className={`leading-relaxed transition-colors rounded-lg px-2 py-1 -mx-2 ${
                    isHighlighted 
                      ? 'bg-accent/20 text-accent-light font-semibold' 
                      : 'text-text-primary'
                  }`}
                >
                  <span className="font-bold text-accent-light text-xs select-none mr-2">
                    {v.verse}
                  </span>
                  <span>{v.text}</span>
                </p>
              )
            })}
          </div>
        )}

        {/* Bottom chapter navigation stepper */}
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs">
          <button
            onClick={prevChapter}
            disabled={bookIdx === 0 && chapter === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card2 border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 font-semibold"
          >
            <ChevronLeft size={15} />
            <span>Anterior</span>
          </button>

          <span className="text-[11px] text-muted">
            {currentBook.name} {chapter} de {currentBook.chapters}
          </span>

          <button
            onClick={nextChapter}
            disabled={bookIdx === BOOKS.length - 1 && chapter === currentBook.chapters}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card2 border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 font-semibold"
          >
            <span>Siguiente</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </Card>
    </div>
  )
}
