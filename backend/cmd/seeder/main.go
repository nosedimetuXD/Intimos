package main

import (
	"context"
	"log"

	"intimos/backend/internal/config"
	"intimos/backend/internal/database"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/pkg/hasher"
)

func main() {
	log.Println("🌱 Running Íntimos database seeder...")

	cfg := config.Load()
	ctx := context.Background()

	pool, err := database.NewPostgresPool(ctx, cfg.DBURL)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("Migration error: %v", err)
	}

	userRepo := postgres.NewUserRepository(pool)
	gameRepo := postgres.NewGameRepository(pool)

	// 1. Seed initial admin if doesn't exist
	admin, err := userRepo.GetByEmail(ctx, "liderazgo@intimos.com")
	if err != nil {
		log.Printf("Error checking admin: %v", err)
	}
	if admin == nil {
		hash, _ := hasher.HashPassword("Intimos2026*")
		adminUser := &domain.User{
			Email:        "liderazgo@intimos.com",
			PasswordHash: hash,
			FullName:     "Liderazgo Pastoral Íntimos",
			Phone:        "+57 300 000 0000",
			Role:         domain.RoleSuperAdmin,
			Active:       true,
			Notes:        "Cuenta administrativa principal",
		}
		if err := userRepo.Create(ctx, adminUser); err != nil {
			log.Printf("Failed to seed admin user: %v", err)
		} else {
			log.Println("✅ Seeded superadmin: liderazgo@intimos.com / Intimos2026*")
		}
	}

	// 2. Seed initial game questions
	initialQuestions := []*domain.GameQuestion{
		// Verso Flash
		{
			GameType:      domain.GameVersoFlash,
			Question:      "¿Quién dijo: 'El Señor es mi pastor; nada me faltará'?",
			Options:       []string{"David", "Salomón", "Moisés", "Pablo"},
			CorrectAnswer: "David",
			BibleRef:      "Salmos 23:1",
			Explanation:   "El Salmo 23 es un cántico de confianza escrito por el rey David.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "¿En qué libro se encuentra: 'Todo lo puedo en Cristo que me fortalece'?",
			Options:       []string{"Filipenses", "Romanos", "Gálatas", "Efesios"},
			CorrectAnswer: "Filipenses",
			BibleRef:      "Filipenses 4:13",
			Explanation:   "Escrito por el apóstol Pablo mientras estaba en prisión.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "¿Qué dice Proverbios 3:5 sobre nuestro corazón?",
			Options:       []string{"Fíate de Jehová de todo tu corazón", "Guarda tu corazón", "Engañoso es el corazón", "Limpia tu corazón"},
			CorrectAnswer: "Fíate de Jehová de todo tu corazón",
			BibleRef:      "Proverbios 3:5",
			Explanation:   "Nos llama a confiar plenamente en Dios y no en nuestra propia prudencia.",
			Difficulty:    2,
			Active:        true,
		},
		// ¿Qué Harías?
		{
			GameType:      domain.GameQueHarias,
			Question:      "Un compañero en el colegio/universidad se burla de tu fe. ¿Cuál es la respuesta según Jesús?",
			Options:       []string{"Responder con amor y bendecirlo", "Burlarte de él también", "Dejarle de hablar para siempre", "Planear una venganza"},
			CorrectAnswer: "Responder con amor y bendecirlo",
			BibleRef:      "Mateo 5:44",
			Explanation:   "Jesús nos mandó: 'Amad a vuestros enemigos, bendecid a los que os maldicen'.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameQueHarias,
			Question:      "Ves que alguien olvidó dinero en la banca de la iglesia. ¿Qué acción refleja integridad?",
			Options:       []string{"Entregarlo al equipo pastoral", "Guardarlo como una bendición personal", "Dejarlo ahí sin decir nada", "Gastar la mitad"},
			CorrectAnswer: "Entregarlo al equipo pastoral",
			BibleRef:      "Lucas 16:10",
			Explanation:   "El que es fiel en lo muy poco, también en lo más es fiel.",
			Difficulty:    1,
			Active:        true,
		},
		// Reto 60
		{
			GameType:      domain.GameReto60,
			Question:      "¿Cuántos libros tiene el Nuevo Testamento?",
			Options:       []string{"27", "39", "66", "24"},
			CorrectAnswer: "27",
			BibleRef:      "Canon Bíblico",
			Explanation:   "El Nuevo Testamento consta de 27 libros (4 evangelios, 1 histórico, 21 cartas y 1 profecía).",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién fue arrojado al foso de los leones por orar a Dios?",
			Options:       []string{"Daniel", "José", "Elías", "Jonás"},
			CorrectAnswer: "Daniel",
			BibleRef:      "Daniel 6:16",
			Explanation:   "Daniel prefirió arriesgar su vida antes que dejar de orar al único Dios verdadero.",
			Difficulty:    1,
			Active:        true,
		},
		// Verdadero o Falso
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿La Biblia afirma que el amor al dinero es la raíz de todos los males?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Verdadero",
			BibleRef:      "1 Timoteo 6:10",
			Explanation:   "El texto dice que el 'amor al dinero' (la codicia), no el dinero en sí, es la raíz de todos los males.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿Moisés guió al pueblo de Israel y entró con ellos a la Tierra Prometida?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Falso",
			BibleRef:      "Deuteronomio 34:4-5",
			Explanation:   "Moisés vio la tierra desde el monte Nebo, pero quien introdujo al pueblo fue Josué.",
			Difficulty:    1,
			Active:        true,
		},
		// Ahorcado
		{
			GameType:      domain.GameAhorcado,
			Question:      "Fruto del Espíritu que implica paciencia y amabilidad constante",
			Options:       []string{},
			CorrectAnswer: "BENIGNIDAD",
			BibleRef:      "Gálatas 5:22",
			Explanation:   "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad...",
			Difficulty:    2,
			Active:        true,
		},
		// Ordena Versículo
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de 1 Juan 4:8",
			Options:       []string{"El que no ama", "no ha conocido a Dios", "porque", "Dios es amor"},
			CorrectAnswer: "El que no ama no ha conocido a Dios porque Dios es amor",
			BibleRef:      "1 Juan 4:8",
			Explanation:   "1 Juan 4:8: El que no ama, no ha conocido a Dios; porque Dios es amor.",
			Difficulty:    2,
			Active:        true,
		},
	}

	for _, q := range initialQuestions {
		_ = gameRepo.CreateQuestion(ctx, q)
	}
	log.Printf("✅ Initial game questions catalog populated (%d questions)", len(initialQuestions))

	log.Println("🎉 Database seeding finished!")
}
