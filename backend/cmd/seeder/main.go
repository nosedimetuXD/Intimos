package main

import (
	"context"
	"log"

	"intimos/backend/internal/config"
	"intimos/backend/internal/database"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/internal/service"
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
	badgeRepo := postgres.NewBadgeRepository(pool)
	badgeService := service.NewBadgeService(badgeRepo)

	// 1. Seed Badges
	if err := badgeService.SeedBadges(ctx); err != nil {
		log.Printf("Error seeding badges: %v", err)
	} else {
		log.Println("✅ Seeded 44 badges catalog")
	}

	// 2. Seed initial admin if doesn't exist
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

	// 3. Complete Game Questions Catalog from gameQuestions.js
	allQuestions := []*domain.GameQuestion{
		// ─── VERSO FLASH ───
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Porque de tal manera ___ Dios al mundo, que ha dado a su Hijo unigénito...",
			Options:       []string{"respetó", "vio", "amó", "creó"},
			CorrectAnswer: "amó",
			BibleRef:      "Juan 3:16",
			Explanation:   "Jesús le habla a Nicodemo sobre la razón de su venida al mundo.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "El Señor es mi ___, nada me faltará.",
			Options:       []string{"rey", "pastor", "guía", "amparo"},
			CorrectAnswer: "pastor",
			BibleRef:      "Salmos 23:1",
			Explanation:   "David describe su relación de confianza total con Dios como su proveedor.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Todo lo puedo en Cristo que me ___.",
			Options:       []string{"llama", "guía", "fortalece", "salva"},
			CorrectAnswer: "fortalece",
			BibleRef:      "Filipenses 4:13",
			Explanation:   "Pablo escribe desde la cárcel, afirmando su contentamiento en cualquier situación.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Confía en el Señor con todo tu ___, y no te apoyes en tu propia prudencia.",
			Options:       []string{"alma", "espíritu", "corazón", "ser"},
			CorrectAnswer: "corazón",
			BibleRef:      "Proverbios 3:5",
			Explanation:   "Instrucción de sabiduría sobre dónde poner nuestra confianza.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Yo soy el camino, la ___ y la vida; nadie viene al Padre sino por mí.",
			Options:       []string{"luz", "gracia", "verdad", "puerta"},
			CorrectAnswer: "verdad",
			BibleRef:      "Juan 14:6",
			Explanation:   "Jesús responde a Tomás que preguntaba el camino al Padre.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "En el principio ___ Dios los cielos y la tierra.",
			Options:       []string{"ordenó", "formó", "creó", "separó"},
			CorrectAnswer: "creó",
			BibleRef:      "Génesis 1:1",
			Explanation:   "El primer versículo de la Biblia, que establece a Dios como Creador de todo.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Mira que te mando que te ___ y seas valiente; no temas ni desmayes.",
			Options:       []string{"prepares", "armes", "esfuerces", "fortalezcas"},
			CorrectAnswer: "esfuerces",
			BibleRef:      "Josué 1:9",
			Explanation:   "Dios anima a Josué antes de guiar a Israel hacia la tierra prometida.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de ___, y no de mal.",
			Options:       []string{"amor", "paz", "bien", "prosperidad"},
			CorrectAnswer: "paz",
			BibleRef:      "Jeremías 29:11",
			Explanation:   "Promesa de esperanza para el pueblo en tiempos difíciles.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "La ___ es la certeza de lo que se espera, la convicción de lo que no se ve.",
			Options:       []string{"oración", "esperanza", "fe", "gracia"},
			CorrectAnswer: "fe",
			BibleRef:      "Hebreos 11:1",
			Explanation:   "Definición bíblica de la fe en la carta a los Hebreos.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "___ es a mis pies tu palabra, y lumbrera a mi camino.",
			Options:       []string{"Verdad", "Guía", "Lámpara", "Fuerza"},
			CorrectAnswer: "Lámpara",
			BibleRef:      "Salmos 119:105",
			Explanation:   "El salmista celebra el valor de la Palabra como guía de cada paso.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "Vestíos de toda la ___ de Dios, para que podáis estar firmes contra las asechanzas del enemigo.",
			Options:       []string{"armadura", "autoridad", "fuerza", "gracia"},
			CorrectAnswer: "armadura",
			BibleRef:      "Efesios 6:11",
			Explanation:   "Pablo instruye sobre la preparación y defensa espiritual del creyente.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameVersoFlash,
			Question:      "El amor es ___, es benigno; el amor no tiene envidia...",
			Options:       []string{"alegre", "sufrido", "fuerte", "paciente"},
			CorrectAnswer: "paciente",
			BibleRef:      "1 Corintios 13:4",
			Explanation:   "El himno al amor de Pablo a los Corintios.",
			Difficulty:    1,
			Active:        true,
		},

		// ─── ¿QUÉ HARÍAS? ───
		{
			GameType:      domain.GameQueHarias,
			Question:      "Tu amigo te pide que lo cubras con sus padres diciendo que durmió en tu casa para ir a una fiesta que no le permitieron. Si te niegas, dice que no eres un verdadero amigo.",
			Options:       []string{"Lo cubres para no tener conflictos ni perder su amistad", "Le dices con calma que no puedes mentir, pero te ofreces a acompañarlo a hablar honestamente con sus padres", "Llamas a sus padres de inmediato a sus espaldas para delatarlo"},
			CorrectAnswer: "Le dices con calma que no puedes mentir, pero te ofreces a acompañarlo a hablar honestamente con sus padres",
			BibleRef:      "Proverbios 12:22",
			Explanation:   "Los labios mentirosos son abominación al Señor, pero los que actúan con verdad son su deleite.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameQueHarias,
			Question:      "En la universidad o colegio te asignan un proyecto en grupo. Un integrante no trabajó nada por problemas personales, pero te pide que pongas su nombre como si hubiera hecho todo.",
			Options:       []string{"Pones su nombre para evitar que pierda la materia sin preguntarle más", "Hablas con él con empatía, le explicas que no es justo falsificar el trabajo y le propones hablar con el docente para buscar una solución", "Lo ignoras por completo y lo expones públicamente frente a toda la clase"},
			CorrectAnswer: "Hablas con él con empatía, le explicas que no es justo falsificar el trabajo y le propones hablar con el docente para buscar una solución",
			BibleRef:      "Efesios 4:15",
			Explanation:   "Hablando la verdad en amor, crecemos en todo en aquel que es la cabeza, esto es, Cristo.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameQueHarias,
			Question:      "En un grupo de WhatsApp de amigos de la iglesia alguien empieza a compartir chismes y burlas sobre un líder o compañero del grupo.",
			Options:       []string{"Te ríes y sigues la corriente para encajar en el grupo", "Escribes con respeto pidiendo cambiar de tema y no hablar mal de quien no está presente", "Haces capturas de pantalla para enviárselas a todo el liderazgo sin intentar mediar primero"},
			CorrectAnswer: "Escribes con respeto pidiendo cambiar de tema y no hablar mal de quien no está presente",
			BibleRef:      "Proverbios 16:28",
			Explanation:   "El hombre perverso promueve contienda, y el chismoso aparta a los mejores amigos.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameQueHarias,
			Question:      "Fuiste a la tienda a comprar algo pequeño y la cajera te entregó por equivocación un billete grande de más en el cambio.",
			Options:       []string{"Guardas el dinero pensando 'Dios proveyó hoy'", "Esperas y le devuelves el dinero sobrante explicándole el error con una sonrisa", "Lo donas en la ofrenda para calmar tu conciencia"},
			CorrectAnswer: "Esperas y le devuelves el dinero sobrante explicándole el error con una sonrisa",
			BibleRef:      "Lucas 16:10",
			Explanation:   "El que es fiel en lo muy poco, también en lo más es fiel; y el que en lo muy poco es injusto, también en lo más es injusto.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameQueHarias,
			Question:      "Alguien que te lastimó mucho en el pasado llega nuevo al grupo de jóvenes y busca integrarse a tu círculo de amigos.",
			Options:       []string{"Adviertes a todos tus amigos para que nadie le hable", "Oras pidiendo a Dios fortaleza para perdonar y le das una bienvenida digna y respetuosa", "Te cambias de iglesia para no tener que verlo nunca más"},
			CorrectAnswer: "Oras pidiendo a Dios fortaleza para perdonar y le das una bienvenida digna y respetuosa",
			BibleRef:      "Colosenses 3:13",
			Explanation:   "Soportándoos con paciencia los unos a los otros, y perdonándoos si alguno tuviere queja contra otro.",
			Difficulty:    2,
			Active:        true,
		},

		// ─── RETO 60 SEGUNDOS ───
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién construyó el arca?",
			Options:       []string{"Moisés", "Noé", "Abraham", "David"},
			CorrectAnswer: "Noé",
			BibleRef:      "Génesis 6",
			Explanation:   "Dios le ordenó a Noé construir un arca para salvar a su familia y animales.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Cuántos libros tiene el Nuevo Testamento?",
			Options:       []string{"27", "39", "66", "12"},
			CorrectAnswer: "27",
			BibleRef:      "Canon Bíblico",
			Explanation:   "El NT consta de 27 libros inspirados.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién derrotó a Goliat con una honda?",
			Options:       []string{"Saúl", "David", "Salomón", "Sansón"},
			CorrectAnswer: "David",
			BibleRef:      "1 Samuel 17",
			Explanation:   "David venció a Goliat en el nombre de Jehová de los ejércitos.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿En qué ciudad nació Jesús?",
			Options:       []string{"Nazaret", "Jerusalén", "Belén", "Jericó"},
			CorrectAnswer: "Belén",
			BibleRef:      "Mateo 2",
			Explanation:   "Jesús nació en Belén de Judea en días del rey Herodes.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién fue tragado por un gran pez?",
			Options:       []string{"Jonás", "Elías", "Pedro", "Pablo"},
			CorrectAnswer: "Jonás",
			BibleRef:      "Jonás 1",
			Explanation:   "Jonás estuvo en el vientre del pez tres días y tres noches.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Cuántos días y noches llovió en el diluvio?",
			Options:       []string{"7", "40", "100", "120"},
			CorrectAnswer: "40",
			BibleRef:      "Génesis 7",
			Explanation:   "Llovió sobre la tierra cuarenta días y cuarenta noches.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién recibió los Diez Mandamientos en el Sinaí?",
			Options:       []string{"Aarón", "Josué", "Moisés", "Abraham"},
			CorrectAnswer: "Moisés",
			BibleRef:      "Éxodo 20",
			Explanation:   "Dios habló a Moisés en el monte Sinaí.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Cuál es el libro de sabiduría escrito principalmente por Salomón?",
			Options:       []string{"Salmos", "Proverbios", "Hechos", "Romanos"},
			CorrectAnswer: "Proverbios",
			BibleRef:      "Proverbios",
			Explanation:   "Los proverbios de Salomón, hijo de David, rey de Israel.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién negó a Jesús tres veces antes de que cantara el gallo?",
			Options:       []string{"Judas", "Pedro", "Juan", "Tomás"},
			CorrectAnswer: "Pedro",
			BibleRef:      "Lucas 22",
			Explanation:   "Pedro negó al Señor, pero luego fue restaurado en amor.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién fue el hombre más fuerte de la Biblia?",
			Options:       []string{"Gedeón", "Sansón", "David", "Benaía"},
			CorrectAnswer: "Sansón",
			BibleRef:      "Jueces 14",
			Explanation:   "Sansón fue un juez de Israel con fuerza sobrenatural dada por el Espíritu.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Cuál fue la primera plaga sobre Egipto?",
			Options:       []string{"Ranas", "Agua convertida en sangre", "Langostas", "Tinieblas"},
			CorrectAnswer: "Agua convertida en sangre",
			BibleRef:      "Éxodo 7",
			Explanation:   "Las aguas del río Nilo se convirtieron en sangre.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameReto60,
			Question:      "¿Quién escribió la mayoría de las epístolas del Nuevo Testamento?",
			Options:       []string{"Pedro", "Juan", "Pablo", "Lucas"},
			CorrectAnswer: "Pablo",
			BibleRef:      "Epístolas paulinas",
			Explanation:   "El apóstol Pablo escribió al menos 13 o 14 epístolas del canon.",
			Difficulty:    1,
			Active:        true,
		},

		// ─── VERDADERO O FALSO ───
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿Matusalén es la persona más longeva mencionada en la Biblia con 969 años?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Verdadero",
			BibleRef:      "Génesis 5:27",
			Explanation:   "Génesis 5:27 confirma que todos los días de Matusalén fueron novecientos sesenta y nueve años.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿El apóstol Pablo fue uno de los 12 discípulos originales que caminaron con Jesús en su ministerio terrenal?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Falso",
			BibleRef:      "Gálatas 1:1",
			Explanation:   "Pablo fue llamado por Jesucristo resucitado camino a Damasco.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿El libro de los Salmos es el libro con mayor cantidad de capítulos en toda la Biblia?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Verdadero",
			BibleRef:      "Salmos",
			Explanation:   "Salmos cuenta con 150 capítulos o salmos.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿El arca del pacto contenía las tablas de la ley, una vasija con maná y la vara de Aarón que floreció?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Verdadero",
			BibleRef:      "Hebreos 9:4",
			Explanation:   "Hebreos 9:4 detalla los tres elementos sagrados depositados dentro del Arca.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿Jesús fue bautizado por su primo Juan en el mar de Galilea?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Falso",
			BibleRef:      "Mateo 3:13",
			Explanation:   "Jesús fue bautizado por Juan en el río Jordán.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameVerdaderoFalso,
			Question:      "¿El fruto del Espíritu Santo mencionado en Gálatas 5 incluye amor, gozo, paz y paciencia?",
			Options:       []string{"Verdadero", "Falso"},
			CorrectAnswer: "Verdadero",
			BibleRef:      "Gálatas 5:22-23",
			Explanation:   "Gálatas 5:22 enumera el fruto del Espíritu Santo.",
			Difficulty:    1,
			Active:        true,
		},

		// ─── AHORCADO BÍBLICO ───
		{
			GameType:      domain.GameAhorcado,
			Question:      "Padre de la fe que salió de Ur sin saber adónde iba (Personaje AT)",
			Options:       []string{},
			CorrectAnswer: "ABRAHAM",
			BibleRef:      "Génesis 12",
			Explanation:   "Por la fe Abraham, siendo llamado, obedeció para salir al lugar que había de recibir como herencia.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Jardín donde oró Jesús antes de ser arrestado (Lugar)",
			Options:       []string{},
			CorrectAnswer: "GETSEMANI",
			BibleRef:      "Mateo 26:36",
			Explanation:   "Llegó Jesús con ellos a un lugar que se llama Getsemaní.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Día en que descendió el Espíritu Santo sobre los discípulos (Acontecimiento)",
			Options:       []string{},
			CorrectAnswer: "PENTECOSTES",
			BibleRef:      "Hechos 2",
			Explanation:   "Cuando llegó el día de Pentecostés, estaban todos unánimes juntos.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Ciudad de David y capital espiritual de Israel (Lugar)",
			Options:       []string{},
			CorrectAnswer: "JERUSALEN",
			BibleRef:      "2 Samuel 5",
			Explanation:   "Ciudad santa y centro de adoración del pueblo de Dios.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Rey conocido por pedir a Dios un corazón sabio y entendido (Personaje AT)",
			Options:       []string{},
			CorrectAnswer: "SALOMON",
			BibleRef:      "1 Reyes 3",
			Explanation:   "Dios dio a Salomón sabiduría y prudencia muy grandes.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Compañero de Pablo cuyo nombre significa 'hijo de consolación' (Personaje NT)",
			Options:       []string{},
			CorrectAnswer: "BERNABE",
			BibleRef:      "Hechos 4:36",
			Explanation:   "José, a quien los apóstoles pusieron por sobrenombre Bernabé.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Región donde Jesús realizó gran parte de sus primeros milagros (Lugar)",
			Options:       []string{},
			CorrectAnswer: "GALILEA",
			BibleRef:      "Mateo 4:23",
			Explanation:   "Y recorrió Jesús toda Galilea, enseñando en las sinagogas.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameAhorcado,
			Question:      "Favor inmerecido de Dios para la salvación por medio de la fe (Doctrina)",
			Options:       []string{},
			CorrectAnswer: "GRACIA",
			BibleRef:      "Efesios 2:8",
			Explanation:   "Porque por gracia sois salvos por medio de la fe.",
			Difficulty:    1,
			Active:        true,
		},

		// ─── ORDENA VERSÍCULO ───
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de Salmos 23:1",
			Options:       []string{"El", "Señor", "es", "mi", "pastor;", "nada", "me", "faltará."},
			CorrectAnswer: "El Señor es mi pastor; nada me faltará.",
			BibleRef:      "Salmos 23:1",
			Explanation:   "Salmos 23:1: El Señor es mi pastor; nada me faltará.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de Filipenses 4:13",
			Options:       []string{"Todo", "lo", "puedo", "en", "Cristo", "que", "me", "fortalece."},
			CorrectAnswer: "Todo lo puedo en Cristo que me fortalece.",
			BibleRef:      "Filipenses 4:13",
			Explanation:   "Filipenses 4:13: Todo lo puedo en Cristo que me fortalece.",
			Difficulty:    1,
			Active:        true,
		},
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de 1 Juan 4:8",
			Options:       []string{"El", "que", "no", "ama,", "no", "ha", "conocido", "a", "Dios;", "porque", "Dios", "es", "amor."},
			CorrectAnswer: "El que no ama, no ha conocido a Dios; porque Dios es amor.",
			BibleRef:      "1 Juan 4:8",
			Explanation:   "1 Juan 4:8: El que no ama, no ha conocido a Dios; porque Dios es amor.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de Proverbios 3:5",
			Options:       []string{"Confía", "en", "el", "Señor", "con", "todo", "tu", "corazón."},
			CorrectAnswer: "Confía en el Señor con todo tu corazón.",
			BibleRef:      "Proverbios 3:5",
			Explanation:   "Proverbios 3:5: Fíate de Jehová de todo tu corazón.",
			Difficulty:    2,
			Active:        true,
		},
		{
			GameType:      domain.GameOrdenaVerso,
			Question:      "Ordena el versículo de Mateo 6:33",
			Options:       []string{"Buscad", "primeramente", "el", "reino", "de", "Dios", "y", "su", "justicia."},
			CorrectAnswer: "Buscad primeramente el reino de Dios y su justicia.",
			BibleRef:      "Mateo 6:33",
			Explanation:   "Mateo 6:33: Mas buscad primeramente el reino de Dios y su justicia.",
			Difficulty:    2,
			Active:        true,
		},
	}

	for _, q := range allQuestions {
		_ = gameRepo.CreateQuestion(ctx, q)
	}
	log.Printf("✅ Complete game questions catalog populated (%d biblical questions)", len(allQuestions))

	log.Println("🎉 Database seeding finished successfully!")
}
