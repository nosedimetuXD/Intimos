package service

import (
	"context"
	"time"

	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
)

type BadgeService struct {
	badgeRepo *postgres.BadgeRepository
}

func NewBadgeService(badgeRepo *postgres.BadgeRepository) *BadgeService {
	return &BadgeService{badgeRepo: badgeRepo}
}

var defaultBadges = []*domain.Badge{
	// Presencia
	{Slug: "first_step", Name: "Primer Paso", Description: "Primera asistencia a un servicio", Category: "Presencia", TargetValue: 1, Icon: "Footprints"},
	{Slug: "presente", Name: "Presente", Description: "5 servicios asistidos", Category: "Presencia", TargetValue: 5, Icon: "MapPin"},
	{Slug: "veteran", Name: "Veterano", Description: "10 servicios asistidos", Category: "Presencia", TargetValue: 10, Icon: "Sparkles"},
	{Slug: "pilar", Name: "Pilar", Description: "25 servicios asistidos", Category: "Presencia", TargetValue: 25, Icon: "Landmark"},
	{Slug: "streak_3", Name: "En Racha", Description: "3 servicios consecutivos", Category: "Presencia", TargetValue: 3, Icon: "Flame"},
	{Slug: "streak_5", Name: "Imparable", Description: "5 servicios consecutivos", Category: "Presencia", TargetValue: 5, Icon: "Zap"},
	{Slug: "streak_10", Name: "Constancia", Description: "10 servicios consecutivos", Category: "Presencia", TargetValue: 10, Icon: "Gem"},
	{Slug: "comprometido", Name: "Comprometido", Description: "Llegaste temprano a 5 servicios", Category: "Presencia", TargetValue: 5, Icon: "Sunrise"},
	{Slug: "el_primero", Name: "El Primero", Description: "Primer check-in registrado en un servicio", Category: "Presencia", TargetValue: 1, Icon: "DoorOpen"},
	{Slug: "mes_completo", Name: "Mes Completo", Description: "Asistencia perfecta a todos los servicios de un mes", Category: "Presencia", TargetValue: 4, Icon: "Calendar"},

	// Palabra
	{Slug: "reflective", Name: "Reflexivo", Description: "5 reflexiones del versículo enviadas", Category: "Palabra", TargetValue: 5, Icon: "Brain"},
	{Slug: "contemplativo", Name: "Contemplativo", Description: "25 reflexiones enviadas", Category: "Palabra", TargetValue: 25, Icon: "Flame"},
	{Slug: "perfect_flash", Name: "Memoria Viva", Description: "Verso Flash completado sin errores", Category: "Palabra", TargetValue: 1, Icon: "Target"},
	{Slug: "perfect_vof", Name: "Sin Dudas", Description: "Verdadero o Falso perfecto (5/5)", Category: "Palabra", TargetValue: 1, Icon: "CheckCircle2"},
	{Slug: "erudito", Name: "Erudito", Description: "90% de acierto sobre 50 preguntas bíblicas", Category: "Palabra", TargetValue: 50, Icon: "GraduationCap"},
	{Slug: "raices", Name: "Raíces", Description: "30 aciertos sobre el Antiguo Testamento", Category: "Palabra", TargetValue: 30, Icon: "Scroll"},
	{Slug: "buenas_nuevas", Name: "Buenas Nuevas", Description: "30 aciertos sobre el Nuevo Testamento", Category: "Palabra", TargetValue: 30, Icon: "Cross"},

	// Juegos
	{Slug: "first_game", Name: "Primera Batalla", Description: "Completaste tu primer juego bíblico", Category: "Juegos", TargetValue: 1, Icon: "Swords"},
	{Slug: "dia_completo", Name: "Día Completo", Description: "Todos los desafíos del día completados", Category: "Juegos", TargetValue: 1, Icon: "Gamepad2"},
	{Slug: "dc_streak_3", Name: "En Llamas", Description: "Racha de 3 días jugando retos", Category: "Juegos", TargetValue: 3, Icon: "Flame"},
	{Slug: "dc_streak_7", Name: "Fiel", Description: "Racha de 7 días jugando retos", Category: "Juegos", TargetValue: 7, Icon: "Sparkles"},
	{Slug: "dc_streak_14", Name: "Constante", Description: "Racha de 14 días jugando retos", Category: "Juegos", TargetValue: 14, Icon: "Calendar"},
	{Slug: "dc_streak_30", Name: "Inquebrantable", Description: "Racha de 30 días jugando retos", Category: "Juegos", TargetValue: 30, Icon: "Gem"},
	{Slug: "reto_velocista", Name: "Velocista", Description: "10+ aciertos en Reto 60 segundos", Category: "Juegos", TargetValue: 10, Icon: "Timer"},

	// Comunidad
	{Slug: "voice", Name: "Mi Voz", Description: "Enviaste tu primera sugerencia en Mi Voz", Category: "Comunidad", TargetValue: 1, Icon: "MessageSquare"},
	{Slug: "escuchado", Name: "Escuchado", Description: "Tu sugerencia fue implementada por el equipo", Category: "Comunidad", TargetValue: 1, Icon: "Megaphone"},
	{Slug: "uno_mas", Name: "#UnoMás", Description: "Invitaste a un amigo que asistió al servicio", Category: "Comunidad", TargetValue: 1, Icon: "UserPlus"},
	{Slug: "puente", Name: "Puente", Description: "Invitaste a 3 personas que asistieron", Category: "Comunidad", TargetValue: 3, Icon: "HeartHandshake"},
	{Slug: "pareja_7", Name: "Pareja Fiel", Description: "Racha de oración en dúo de 7 días", Category: "Comunidad", TargetValue: 7, Icon: "Heart"},
	{Slug: "familia", Name: "Familia", Description: "3 meses activo en el grupo", Category: "Comunidad", TargetValue: 1, Icon: "Home"},

	// Servicio
	{Slug: "manos_obra", Name: "Manos a la Obra", Description: "Participación en servicio o logística", Category: "Servicio", TargetValue: 1, Icon: "Wrench"},
	{Slug: "campista_2026", Name: "Campista 2026", Description: "Inscripción y abono completado al campamento", Category: "Servicio", TargetValue: 1, Icon: "Tent"},
	{Slug: "top3", Name: "Top del Mes", Description: "Entraste al Top 3 mensual del ranking", Category: "Servicio", TargetValue: 1, Icon: "Trophy"},
	{Slug: "campeon", Name: "Campeón", Description: "Conquistaste el 1er lugar del mes", Category: "Servicio", TargetValue: 1, Icon: "Crown"},

	// Exclusivos
	{Slug: "centinela", Name: "Centinela", Description: "Racha de 100 días activo en la plataforma", Category: "Exclusivo", TargetValue: 100, Icon: "Flame", IsExclusive: true},
	{Slug: "el_fiel", Name: "El Fiel", Description: "Asistencia a todos los servicios de un trimestre", Category: "Exclusivo", TargetValue: 12, Icon: "Gem", IsExclusive: true},
	{Slug: "corazon_david", Name: "Corazón de David", Description: "100 reflexiones bíblicas enviadas", Category: "Exclusivo", TargetValue: 100, Icon: "Heart", IsExclusive: true},
	{Slug: "salomon", Name: "Sabiduría de Salomón", Description: "95% de acierto sobre 200 preguntas bíblicas", Category: "Exclusivo", TargetValue: 200, Icon: "GraduationCap", IsExclusive: true},
	{Slug: "bicampeon", Name: "Bicampeón", Description: "Ganaste el 1er lugar del ranking dos meses", Category: "Exclusivo", TargetValue: 2, Icon: "Trophy", IsExclusive: true},
	{Slug: "inquebrantable", Name: "Defensor de la Fe", Description: "Un mes completo sin fallar ningún desafío", Category: "Exclusivo", TargetValue: 30, Icon: "Shield", IsExclusive: true},
}

func (s *BadgeService) SeedBadges(ctx context.Context) error {
	for _, b := range defaultBadges {
		_ = s.badgeRepo.UpsertBadge(ctx, b)
	}
	return nil
}

func (s *BadgeService) GetMyBadgesProgress(ctx context.Context, userID string) ([]*domain.UserBadgeProgress, error) {
	// 1. Ensure badges are in DB
	allBadges, err := s.badgeRepo.ListAll(ctx)
	if err != nil || len(allBadges) == 0 {
		_ = s.SeedBadges(ctx)
		allBadges, _ = s.badgeRepo.ListAll(ctx)
	}

	// 2. Fetch unlocked badges map
	unlockedMap, _ := s.badgeRepo.GetUserUnlockedBadges(ctx, userID)

	// 3. Fetch user authoritative stats
	stats, _ := s.badgeRepo.GetUserStats(ctx, userID)
	if stats == nil {
		stats = &postgres.UserStatsForBadges{}
	}

	var result []*domain.UserBadgeProgress

	for _, b := range allBadges {
		current := 0

		switch b.Slug {
		// Presencia
		case "first_step", "presente", "veteran", "pilar", "streak_3", "streak_5", "streak_10", "el_primero", "mes_completo":
			current = stats.AttendanceCount
		case "comprometido":
			current = stats.EarlyAttendanceCount

		// Palabra
		case "reflective", "contemplativo":
			current = stats.ReflectionsCount
		case "perfect_flash", "perfect_vof":
			current = stats.PerfectGamesCount
		case "erudito":
			current = stats.GameAttemptsCount * 5
		case "raices", "buenas_nuevas":
			current = stats.GameAttemptsCount * 3

		// Juegos
		case "first_game", "dia_completo", "dc_streak_3", "dc_streak_7", "dc_streak_14", "dc_streak_30":
			current = stats.GameAttemptsCount
		case "reto_velocista":
			if stats.PerfectGamesCount > 0 {
				current = 10
			}

		// Comunidad
		case "uno_mas", "puente":
			current = stats.InviteCount
		case "familia":
			current = 1
		case "voice", "escuchado", "pareja_7":
			current = 0

		// Servicio
		case "manos_obra":
			if stats.Role != "miembro" && stats.Role != "" {
				current = 1
			}
		case "campista_2026":
			if stats.CampPaid {
				current = 1
			}
		case "top3":
			if stats.CurrentRank <= 3 && stats.CurrentRank > 0 {
				current = 1
			}
		case "campeon":
			if stats.CurrentRank == 1 {
				current = 1
			}

		// Exclusivos
		case "centinela":
			current = stats.GameAttemptsCount
		case "el_fiel":
			current = stats.AttendanceCount
		case "corazon_david":
			current = stats.ReflectionsCount
		case "salomon":
			current = stats.GameAttemptsCount * 5
		}

		if current > b.TargetValue {
			current = b.TargetValue
		}

		unlockedAt, isAlreadyUnlocked := unlockedMap[b.Slug]
		shouldUnlock := current >= b.TargetValue && b.TargetValue > 0

		var unlockedAtPtr *time.Time
		if isAlreadyUnlocked {
			unlockedAtPtr = &unlockedAt
		} else if shouldUnlock {
			now := time.Now()
			unlockedAtPtr = &now
			_ = s.badgeRepo.UnlockBadge(ctx, userID, b.Slug)
		}

		result = append(result, &domain.UserBadgeProgress{
			BadgeID:     b.ID,
			Slug:        b.Slug,
			Name:        b.Name,
			Description: b.Description,
			Category:    b.Category,
			Icon:        b.Icon,
			Current:     current,
			Target:      b.TargetValue,
			Unlocked:    isAlreadyUnlocked || shouldUnlock,
			UnlockedAt:  unlockedAtPtr,
		})
	}

	return result, nil
}
