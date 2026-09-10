import React, { useState, useEffect } from 'react'
import { Book, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search } from 'lucide-react'

const BOOKS = [
  { id: 1, name: "Génesis", chapters: 50 },
  { id: 2, name: "Éxodo", chapters: 40 },
  { id: 19, name: "Salmos", chapters: 150 },
  { id: 20, name: "Proverbios", chapters: 31 },
  { id: 40, name: "Mateo", chapters: 28 },
  { id: 41, name: "Marcos", chapters: 16 },
  { id: 42, name: "Lucas", chapters: 24 },
  { id: 43, name: "Juan", chapters: 21 },
  { id: 44, name: "Hechos", chapters: 28 },
  { id: 45, name: "Romanos", chapters: 16 },
  { id: 50, name: "Filipenses", chapters: 4 },
  { id: 66, name: "Apocalipsis", chapters: 22 }
]

export default function BibleScreen() {
  const [selectedBook, setSelectedBook] = useState(BOOKS[3]) // Proverbios default
  const [chapter, setChapter] = useState(3)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(15)

  useEffect(() => {
    async function fetchChapter() {
      const cacheKey = `bible_rvr1960_${selectedBook.id}_${chapter}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setVerses(JSON.parse(cached))
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`https://bolls.life/get-chapter/RVR1960/${selectedBook.id}/${chapter}/`)
        if (!res.ok) throw new Error('Error al consultar capítulo')
        const data = await res.json()
        setVerses(data || [])
        localStorage.setItem(cacheKey, JSON.stringify(data || []))
      } catch (err) {
        console.error('Error fetching Bible passage:', err)
        setVerses([
          { verse: 1, text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia." },
          { verse: 2, text: "Reconócelo en todos tus caminos, y él enderezará tus veredas." }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchChapter()
  }, [selectedBook, chapter])

  return (
    <div className="space-y-4">
      {/* Top Controller */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Book className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedBook.id}
            onChange={(e) => {
              const b = BOOKS.find(x => x.id === parseInt(e.target.value))
              if (b) {
                setSelectedBook(b)
                setChapter(1)
              }
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            {BOOKS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={chapter}
            onChange={(e) => setChapter(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>Cap. {c}</option>
            ))}
          </select>
        </div>

        {/* Font size zoom controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Reducir letra"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Aumentar letra"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bible Chapter Content */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl min-h-[450px]">
        <div className="text-center pb-4 mb-4 border-b border-slate-800">
          <h2 className="text-lg font-black text-white">{selectedBook.name} {chapter}</h2>
          <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Reina-Valera 1960</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Cargando pasaje bíblico...
          </div>
        ) : (
          <div className="space-y-3" style={{ fontSize: `${fontSize}px` }}>
            {verses.map((v) => (
              <p key={v.verse} className="text-slate-200 leading-relaxed">
                <span className="font-bold text-indigo-400 text-xs select-none mr-2">{v.verse}</span>
                <span dangerouslySetInnerHTML={{ __html: v.text }} />
              </p>
            ))}
          </div>
        )}

        {/* Navigation bottom */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            disabled={chapter <= 1}
            onClick={() => setChapter(prev => Math.max(1, prev - 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            disabled={chapter >= selectedBook.chapters}
            onClick={() => setChapter(prev => Math.min(selectedBook.chapters, prev + 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
