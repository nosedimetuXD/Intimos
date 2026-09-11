import { BADGES } from '../data/badges'

function pctCalc(current, target) {
  const cur = Math.min(current, target)
  const done = cur >= target
  const pct = Math.min(100, Math.round((cur / (target || 1)) * 100))
  return { current: cur, target, done, pct }
}

export function evaluateBadges(user, ctx = {}) {
  if (!user) return {}

  const {
    attendance = [],
    services = [],
    reflections = [],
    gameAttempts = [],
    ranking = [],
    suggestions = []
  } = ctx

  const uid = user.id

  // 1. Asistencia
  const myAttendances = attendance.filter(a => a.user_id === uid || a.userId === uid)
  const myEarlyAttendances = myAttendances.filter(a => a.is_early || a.early)

  // Asistencias consecutivas
  let currentStreak = 0
  const sortedAtt = [...myAttendances].sort((a, b) => new Date(b.check_in_time || b.date) - new Date(a.check_in_time || a.date))
  // Simple streak: length of recent attendances
  currentStreak = Math.min(myAttendances.length, 10)

  // 2. Reflexiones
  const myReflections = reflections.filter(r => r.user_id === uid || r.userId === uid)

  // 3. Juegos
  const myGames = gameAttempts.filter(g => g.user_id === uid || g.userId === uid)
  const perfectGames = myGames.filter(g => g.score >= g.max_score && g.max_score > 0).length

  // 4. Ranking
  const myRankEntry = ranking.find(r => r.user_id === uid)
  const myRank = myRankEntry?.rank || 999
  const isTop3 = myRank <= 3 && myRank > 0
  const isWinner = myRank === 1

  // 5. Sugerencias
  const mySuggestions = suggestions.filter(s => s.userId === uid || s.user_id === uid)
  const implementedSug = mySuggestions.filter(s => s.status === 'implementada').length

  const results = {}

  BADGES.forEach(badge => {
    let progress = { current: 0, target: badge.target, done: false, pct: 0 }

    switch (badge.id) {
      // Presencia
      case 'first_step':
        progress = pctCalc(myAttendances.length, badge.target)
        break
      case 'presente':
        progress = pctCalc(myAttendances.length, badge.target)
        break
      case 'veteran':
        progress = pctCalc(myAttendances.length, badge.target)
        break
      case 'pilar':
        progress = pctCalc(myAttendances.length, badge.target)
        break
      case 'streak_3':
        progress = pctCalc(currentStreak, badge.target)
        break
      case 'streak_5':
        progress = pctCalc(currentStreak, badge.target)
        break
      case 'streak_10':
        progress = pctCalc(currentStreak, badge.target)
        break
      case 'comprometido':
        progress = pctCalc(myEarlyAttendances.length, badge.target)
        break
      case 'el_primero':
        progress = pctCalc(myAttendances.length > 0 ? 1 : 0, badge.target)
        break
      case 'mes_completo':
        progress = pctCalc(myAttendances.length >= 4 ? 1 : 0, badge.target)
        break

      // Palabra
      case 'reflective':
        progress = pctCalc(myReflections.length, badge.target)
        break
      case 'contemplativo':
        progress = pctCalc(myReflections.length, badge.target)
        break
      case 'perfect_flash':
        progress = pctCalc(perfectGames > 0 ? 1 : 0, badge.target)
        break
      case 'perfect_vof':
        progress = pctCalc(perfectGames > 0 ? 1 : 0, badge.target)
        break
      case 'erudito':
        progress = pctCalc(Math.min(myGames.length * 5, 50), badge.target)
        break
      case 'raices':
        progress = pctCalc(Math.min(myGames.length * 3, 30), badge.target)
        break
      case 'buenas_nuevas':
        progress = pctCalc(Math.min(myGames.length * 3, 30), badge.target)
        break

      // Juegos
      case 'first_game':
        progress = pctCalc(myGames.length > 0 ? 1 : 0, badge.target)
        break
      case 'dia_completo':
        progress = pctCalc(myGames.length >= 4 ? 1 : 0, badge.target)
        break
      case 'dc_streak_3':
        progress = pctCalc(Math.min(myGames.length, 3), badge.target)
        break
      case 'dc_streak_7':
        progress = pctCalc(Math.min(myGames.length, 7), badge.target)
        break
      case 'dc_streak_14':
        progress = pctCalc(Math.min(myGames.length, 14), badge.target)
        break
      case 'dc_streak_30':
        progress = pctCalc(Math.min(myGames.length, 30), badge.target)
        break
      case 'reto_velocista':
        progress = pctCalc(myGames.some(g => g.score >= 10) ? 10 : 0, badge.target)
        break

      // Comunidad
      case 'voice':
        progress = pctCalc(mySuggestions.length, badge.target)
        break
      case 'escuchado':
        progress = pctCalc(implementedSug, badge.target)
        break
      case 'uno_mas':
        progress = pctCalc(user.invited_count || 0, badge.target)
        break
      case 'puente':
        progress = pctCalc(user.invited_count || 0, badge.target)
        break
      case 'pareja_7':
        progress = pctCalc(0, badge.target)
        break
      case 'familia':
        progress = pctCalc(1, badge.target)
        break

      // Servicio
      case 'manos_obra':
        progress = pctCalc(user.role !== 'miembro' ? 1 : 0, badge.target)
        break
      case 'campista_2026':
        progress = pctCalc(user.camp_paid ? 1 : 0, badge.target)
        break
      case 'top3':
        progress = pctCalc(isTop3 ? 1 : 0, badge.target)
        break
      case 'campeon':
        progress = pctCalc(isWinner ? 1 : 0, badge.target)
        break

      // Exclusivos
      case 'centinela':
        progress = pctCalc(Math.min(myGames.length, 100), badge.target)
        break
      case 'el_fiel':
        progress = pctCalc(Math.min(myAttendances.length, 12), badge.target)
        break
      case 'corazon_david':
        progress = pctCalc(Math.min(myReflections.length, 100), badge.target)
        break
      case 'salomon':
        progress = pctCalc(Math.min(myGames.length * 5, 200), badge.target)
        break
      case 'bicampeon':
        progress = pctCalc(0, badge.target)
        break
      case 'inquebrantable':
        progress = pctCalc(0, badge.target)
        break

      default:
        progress = pctCalc(0, badge.target)
    }

    results[badge.id] = {
      ...progress,
      badge
    }
  })

  return results
}
