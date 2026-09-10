import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { servicesApi, pointsApi, centralApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Bell, 
  Send,
  Flame,
  Swords,
  ChevronRight,
  Gift,
  Clock,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, Btn, Avatar, Modal } from '../components/ui'

const DAILY_VERSES = [
  { verse: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "Jehová es mi pastor; nada me faltará.", reference: "Salmos 23:1" },
  { verse: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz y no de mal.", reference: "Jeremías 29:11" },
  { verse: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.", reference: "Romanos 8:28" },
  { verse: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.", reference: "Proverbios 3:5" },
  { verse: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.", reference: "Isaías 40:31" },
  { verse: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.", reference: "Josué 1:9" },
  { verse: "El Señor es mi luz y mi salvación; ¿de quién temeré?", reference: "Salmos 27:1" },
]

export default function HomeScreen() {
  const { currentUser, totalPoints, level, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [upcomingService, setUpcomingService] = useState(null)
  const [ranking, setRanking] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  // Reflection modal
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [reflectionPublic, setReflectionPublic] = useState(true)
  const [hasReflectedToday, setHasReflectedToday] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const todayVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length]

  // Calculate days left in month
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = Math.max(0, lastDayOfMonth - now.getDate())

  useEffect(() => {
    // Check if reflection was submitted today
    const storedRef = localStorage.getItem(`intimos_reflection_${todayStr}_${currentUser?.id}`)
    if (storedRef) setHasReflectedToday(true)

    async function loadData() {
      try {
        const [serviceData, rankingData, announcementsData] = await Promise.all([
          servicesApi.getUpcoming().catch(() => null),
          pointsApi.getRanking().catch(() => []),
          centralApi.getAnnouncements().catch(() => []),
        ])

        setUpcomingService(serviceData)
        setRanking(rankingData || [])
        setAnnouncements(announcementsData || [])
      } catch (err) {
        console.error('Error loading home data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [currentUser?.id, todayStr])

  const handleSendReflection = async () => {
    if (!reflectionText.trim()) return

    // Save reflection locally
    const refData = {
      text: reflectionText.trim(),
      isPublic: reflectionPublic,
      author: currentUser?.full_name || 'Miembro',
      date: todayStr,
      timestamp: Date.now()
    }
    localStorage.setItem(`intimos_reflection_${todayStr}_${currentUser?.id}`, JSON.stringify(refData))
    
    // Save to shared reflections feed in localStorage
    try {
      const allReflections = JSON.parse(localStorage.getItem('intimos_community_reflections') || '[]')
      allReflections.unshift(refData)
      localStorage.setItem('intimos_community_reflections', JSON.stringify(allReflections.slice(0, 50)))
    } catch {}

    setHasReflectedToday(true)
    setShowReflection(false)
    setReflectionText('')
    setToastMsg('¡Reflexión enviada! +25 pts de meditación 🎉')
    setTimeout(() => setToastMsg(null), 3500)
    refreshProfile()
  }

  // Ranking calculation
  const myRank = ranking.findIndex(u => u.user_id === currentUser?.id) + 1
  const aboveUser = myRank > 1 ? ranking[myRank - 2] : null
  const myPts = ranking.find(u => u.user_id === currentUser?.id)?.month_points ?? 0
  const ptsToNext = aboveUser ? Math.max(0, aboveUser.month_points - myPts) : 0
  const top3 = ranking.slice(0, 3)
  const medals = ['🥇', '🥈', '🥉']

  const firstName = currentUser?.full_name?.split(' ')[0] || 'Miembro'

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up bg-accent text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl shadow-accent/30 border border-blue-400/30 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Greeting & Profile Chip */}
      <div className="flex items-center gap-3 py-1">
        <div className="relative flex-shrink-0">
          <Avatar src={currentUser?.photo} name={currentUser?.full_name} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted capitalize">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="font-bold text-text-primary truncate text-sm">
            ¡Hola, {firstName}!
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-accent/30 bg-accent/15 text-accent-light">
            {level}
          </span>
          <span className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
            <Flame size={12} /> Activo
          </span>
        </div>
      </div>

      {/* Daily Verse Card */}
      <div className="rounded-2xl overflow-hidden border border-accent/30 shadow-xl bg-card">
        <div
          className="relative h-32 flex items-end p-3.5"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.45) 0%, rgba(15, 23, 42, 0.9) 100%)',
          }}
        >
          <div className="w-full">
            <div className="flex items-center gap-1.5 mb-1 text-blue-300">
              <BookOpen size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Versículo del día</span>
            </div>
            <p className="text-xs text-white/95 font-medium leading-snug line-clamp-2 italic">
              "{todayVerse.verse}"
            </p>
            <p className="text-[10px] text-white/60 font-semibold mt-0.5">{todayVerse.reference}</p>
          </div>
        </div>
        <div className="p-3 bg-card border-t border-border flex items-center justify-between">
          {hasReflectedToday ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full font-medium">
              ✓ Ya dejaste tu reflexión hoy
            </span>
          ) : (
            <Btn size="sm" onClick={() => setShowReflection(true)}>
              <Send size={13} />
              <span>Deja tu reflexión (+25 pts)</span>
            </Btn>
          )}

          <button
            onClick={() => navigate('/biblia')}
            className="text-xs font-semibold text-accent-light hover:underline flex items-center gap-1"
          >
            <span>Leer Biblia</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Link 
          to="/retos" 
          className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-accent/40 transition-all active:scale-[0.97] text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Swords size={20} className="text-accent-light" />
          </div>
          <span className="text-xs font-bold text-text-primary leading-tight">Retos Diarios</span>
        </Link>

        <Link 
          to="/biblia" 
          className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-accent/40 transition-all active:scale-[0.97] text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-purple-400" />
          </div>
          <span className="text-xs font-bold text-text-primary leading-tight">Biblia</span>
        </Link>

        <Link 
          to="/comunidad" 
          className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-accent/40 transition-all active:scale-[0.97] text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <span className="text-xs font-bold text-text-primary leading-tight">Ranking</span>
        </Link>
      </div>

      {/* Month Prize Reminder Banner */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Gift size={16} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-400">Premio del mes</p>
          <p className="text-[11px] text-muted truncate">Se entrega al primer lugar en el próximo servicio presencial</p>
        </div>
        <div className="text-center flex-shrink-0 pl-2">
          <p className="text-xl font-black text-amber-400 leading-none">{daysLeft}</p>
          <p className="text-[10px] text-muted">días</p>
        </div>
      </div>

      {/* Daily Missions Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-text-primary text-sm">Misiones de hoy</h2>
            <p className="text-[11px] text-muted">Gana puntos completando tus actividades</p>
          </div>
          <span className="text-xs font-bold text-accent-light bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
            Diario
          </span>
        </div>

        <div className="divide-y divide-border/60">
          <div 
            onClick={() => !hasReflectedToday && setShowReflection(true)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
              hasReflectedToday ? 'opacity-60 cursor-default' : 'hover:bg-accent/5 cursor-pointer active:scale-[0.99]'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              hasReflectedToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-card2 border border-border text-muted'
            }`}>
              {hasReflectedToday ? '✓' : '○'}
            </div>
            <span className={`flex-1 text-xs ${hasReflectedToday ? 'line-through text-muted' : 'text-text-primary font-medium'}`}>
              Reflexión del versículo del día
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              hasReflectedToday ? 'text-emerald-400 bg-emerald-400/10' : 'text-accent-light bg-accent/10'
            }`}>
              +25 pts
            </span>
          </div>

          <div 
            onClick={() => navigate('/retos')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/5 cursor-pointer active:scale-[0.99] transition-all text-left"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-card2 border border-border text-muted">
              ○
            </div>
            <span className="flex-1 text-xs text-text-primary font-medium">
              Completar reto bíblico (Verso Flash, Reto 60)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-accent-light bg-accent/10">
              hasta +100 pts
            </span>
          </div>

          {upcomingService && (
            <div 
              onClick={() => navigate('/checkin')}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/5 cursor-pointer active:scale-[0.99] transition-all text-left"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-card2 border border-border text-muted">
                ○
              </div>
              <span className="flex-1 text-xs text-text-primary font-medium">
                Asistencia al servicio "{upcomingService.title}"
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">
                +300 pts
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Upcoming Service Card */}
      {upcomingService && (
        <Card>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar size={14} className="text-accent-light" />
                <span className="text-[11px] font-bold text-accent-light uppercase tracking-wider">Próximo Encuentro</span>
              </div>
              <p className="font-bold text-text-primary text-sm sm:text-base">{upcomingService.title}</p>
              <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                <Clock size={13} />
                <span>
                  {format(new Date(upcomingService.scheduled_at), "EEEE d 'de' MMMM · h:mm a", { locale: es })}
                </span>
              </p>
              {upcomingService.location && (
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>{upcomingService.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => navigate('/checkin')}
              className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs transition-colors shadow-md shadow-accent/25 flex items-center justify-center gap-2"
            >
              <QrCode size={15} />
              <span>Registrar Asistencia QR</span>
            </button>
          </div>
        </Card>
      )}

      {/* Top 3 Month Ranking */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="font-bold text-text-primary text-sm">Top del mes</span>
          </div>
          <Link to="/comunidad" className="text-xs text-accent-light hover:underline font-semibold">
            Ver ranking completo →
          </Link>
        </div>

        {myRank > 0 && myRank > 3 && aboveUser && (
          <div className="mb-3 p-2.5 rounded-xl bg-accent/10 border border-accent/25 text-xs text-center">
            <span className="text-text-secondary">Estás en el </span>
            <span className="font-bold text-accent-light">puesto {myRank}</span>
            <span className="text-text-secondary"> — te faltan </span>
            <span className="font-bold text-amber-400">{ptsToNext} pts</span>
            <span className="text-text-secondary"> para alcanzar a {aboveUser.full_name.split(' ')[0]}</span>
          </div>
        )}

        {myRank > 0 && myRank <= 3 && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-center">
            <span className="text-emerald-400 font-bold">¡Estás en el top {myRank}! {medals[myRank - 1]} ¡Sigue así! 🔥</span>
          </div>
        )}

        {top3.length === 0 ? (
          <p className="text-xs text-muted text-center py-3">Sin puntuaciones registradas aún</p>
        ) : (
          <div className="space-y-2">
            {top3.map((u, i) => {
              const isMe = u.user_id === currentUser?.id
              return (
                <div 
                  key={u.user_id} 
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                    isMe ? 'bg-accent/15 border border-accent/30' : 'bg-card2/50'
                  }`}
                >
                  <span className="text-xl w-6 text-center">{medals[i]}</span>
                  <Avatar name={u.full_name} size="sm" />
                  <span className={`flex-1 text-xs truncate ${isMe ? 'font-bold text-accent-light' : 'font-medium text-text-primary'}`}>
                    {u.full_name} {isMe ? '← tú' : ''}
                  </span>
                  <span className="text-xs font-bold text-accent-light">{u.month_points} pts</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Latest Announcement */}
      {announcements.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-accent-light" />
            <span className="text-xs font-bold text-accent-light uppercase tracking-wider">Último aviso</span>
          </div>
          <p className="font-bold text-text-primary text-xs sm:text-sm mb-1">{announcements[0].title}</p>
          <p className="text-xs text-text-secondary leading-relaxed">{announcements[0].content}</p>
        </Card>
      )}

      {/* Reflection Modal */}
      <Modal open={showReflection} onClose={() => setShowReflection(false)} title="Deja tu reflexión de hoy">
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-xl bg-card2 border border-border">
            <p className="text-xs italic text-text-secondary">"{todayVerse.verse}"</p>
            <p className="text-[10px] text-muted font-bold mt-1">{todayVerse.reference}</p>
          </div>

          <textarea
            value={reflectionText}
            onChange={e => setReflectionText(e.target.value)}
            placeholder="¿Qué te habló este versículo hoy? Escribe aquí tu pensamiento o meditación..."
            rows={4}
            className="w-full resize-none text-xs"
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-secondary">¿Quién puede ver tu reflexión?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReflectionPublic(true)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  reflectionPublic
                    ? 'bg-accent/15 border-accent text-accent-light'
                    : 'bg-card2 border-border text-muted hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users size={14} />
                  <span className="text-xs font-bold">Comunidad</span>
                </div>
                <p className="text-[10px] opacity-75">Visible en el muro de reflexiones</p>
              </button>

              <button
                type="button"
                onClick={() => setReflectionPublic(false)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  !reflectionPublic
                    ? 'bg-accent/15 border-accent text-accent-light'
                    : 'bg-card2 border-border text-muted hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs">🔒</span>
                  <span className="text-xs font-bold">Privada</span>
                </div>
                <p className="text-[10px] opacity-75">Solo para tu devocional personal</p>
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Btn fullWidth onClick={handleSendReflection} disabled={!reflectionText.trim()}>
              <Send size={14} />
              <span>Publicar reflexión (+25 pts)</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
