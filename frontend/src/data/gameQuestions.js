// ─── BANCO DE PREGUNTAS Y VERSÍCULOS PARA LOS 6 JUEGOS BÍBLICOS ─────────────

// 1. VERSO FLASH (Memorización y completar palabras clave)
export const VERSO_FLASH = [
  { id: 'vf1', incomplete: 'Porque de tal manera ___ Dios al mundo, que ha dado a su Hijo unigénito...', opts: ['respetó', 'vio', 'amó', 'creó'], ans: 2, ref: 'Juan 3:16', full: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.', context: 'Jesús le habla a Nicodemo sobre la razón de su venida al mundo.' },
  { id: 'vf2', incomplete: 'El Señor es mi ___, nada me faltará.', opts: ['rey', 'pastor', 'guía', 'amparo'], ans: 1, ref: 'Salmos 23:1', full: 'El Señor es mi pastor; nada me faltará.', context: 'David describe su relación de confianza total con Dios como su proveedor.' },
  { id: 'vf3', incomplete: 'Todo lo puedo en Cristo que me ___.', opts: ['llama', 'guía', 'fortalece', 'salva'], ans: 2, ref: 'Filipenses 4:13', full: 'Todo lo puedo en Cristo que me fortalece.', context: 'Pablo escribe desde la cárcel, afirmando su contentamiento en cualquier situación.' },
  { id: 'vf4', incomplete: 'Confía en el Señor con todo tu ___, y no te apoyes en tu propia prudencia.', opts: ['alma', 'espíritu', 'corazón', 'ser'], ans: 2, ref: 'Proverbios 3:5', full: 'Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.', context: 'Instrucción de sabiduría sobre dónde poner nuestra confianza.' },
  { id: 'vf5', incomplete: 'Yo soy el camino, la ___ y la vida; nadie viene al Padre sino por mí.', opts: ['luz', 'gracia', 'verdad', 'puerta'], ans: 2, ref: 'Juan 14:6', full: 'Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.', context: 'Jesús responde a Tomás que preguntaba el camino al Padre.' },
  { id: 'vf6', incomplete: 'En el principio ___ Dios los cielos y la tierra.', opts: ['ordenó', 'formó', 'creó', 'separó'], ans: 2, ref: 'Génesis 1:1', full: 'En el principio creó Dios los cielos y la tierra.', context: 'El primer versículo de la Biblia, que establece a Dios como Creador de todo.' },
  { id: 'vf7', incomplete: 'Mira que te mando que te ___ y seas valiente; no temas ni desmayes.', opts: ['prepares', 'armes', 'esfuerces', 'fortalezcas'], ans: 2, ref: 'Josué 1:9', full: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.', context: 'Dios anima a Josué antes de guiar a Israel hacia la tierra prometida.' },
  { id: 'vf8', incomplete: 'Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de ___, y no de mal.', opts: ['amor', 'paz', 'bien', 'prosperidad'], ans: 1, ref: 'Jeremías 29:11', full: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', context: 'Promesa de esperanza para el pueblo en tiempos difíciles.' },
  { id: 'vf9', incomplete: 'La ___ es la certeza de lo que se espera, la convicción de lo que no se ve.', opts: ['oración', 'esperanza', 'fe', 'gracia'], ans: 2, ref: 'Hebreos 11:1', full: 'Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.', context: 'Definición bíblica de la fe en la carta a los Hebreos.' },
  { id: 'vf10', incomplete: '___ es a mis pies tu palabra, y lumbrera a mi camino.', opts: ['Verdad', 'Guía', 'Lámpara', 'Fuerza'], ans: 2, ref: 'Salmos 119:105', full: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.', context: 'El salmista celebra el valor de la Palabra como guía de cada paso.' },
  { id: 'vf11', incomplete: 'Vestíos de toda la ___ de Dios, para que podáis estar firmes contra las asechanzas del enemigo.', opts: ['armadura', 'autoridad', 'fuerza', 'gracia'], ans: 0, ref: 'Efesios 6:11', full: 'Vestíos de toda la armadura de Dios, para que podáis estar firmes contra las asechanzas del diablo.', context: 'Pablo instruye sobre la preparación y defensa espiritual del creyente.' },
  { id: 'vf12', incomplete: 'El amor es ___, es benigno; el amor no tiene envidia...', opts: ['alegre', 'sufrido', 'fuerte', 'paciente'], ans: 3, ref: '1 Corintios 13:4', full: 'El amor es paciente, es bondadoso; el amor no tiene envidia, el amor no es jactancioso, no se envanece.', context: 'El himno al amor de Pablo a los Corintios.' },
]

// 2. ¿QUÉ HARÍAS? (Dilemas éticos y situaciones juveniles prácticas)
export const QUE_HARIAS = [
  {
    id: 'qh1',
    scenario: 'Tu amigo te pide que lo cubras con sus padres diciendo que durmió en tu casa para ir a una fiesta que no le permitieron. Si te niegas, dice que no eres un verdadero amigo.',
    opts: [
      { text: 'Lo cubres para no tener conflictos ni perder su amistad', tone: 'fácil' },
      { text: 'Le dices con calma que no puedes mentir, pero te ofreces a acompañarlo a hablar honestamente con sus padres', tone: 'correcta' },
      { text: 'Llamas a sus padres de inmediato a sus espaldas para delatarlo', tone: 'trampa' }
    ],
    best: 1,
    verse: 'Proverbios 12:22',
    revelation: 'Los labios mentirosos son abominación al Señor, pero los que actúan con verdad son su deleite. La lealtad genuina cuida al amigo sin comprometer la verdad.'
  },
  {
    id: 'qh2',
    scenario: 'En la universidad o colegio te asignan un proyecto en grupo. Un integrante no trabajó nada por problemas personales, pero te pide que pongas su nombre como si hubiera hecho todo.',
    opts: [
      { text: 'Pones su nombre para evitar que pierda la materia sin preguntarle más', tone: 'fácil' },
      { text: 'Hablas con él con empatía, le explicas que no es justo falsificar el trabajo y le propones hablar con el docente para buscar una solución', tone: 'correcta' },
      { text: 'Lo ignoras por completo y lo expones públicamente frente a toda la clase', tone: 'trampa' }
    ],
    best: 1,
    verse: 'Efesios 4:15',
    revelation: 'Hablando la verdad en amor, crecemos en todo en aquel que es la cabeza, esto es, Cristo. Verdad y compasión van siempre de la mano.'
  },
  {
    id: 'qh3',
    scenario: 'En un grupo de WhatsApp de amigos de la iglesia alguien empieza a compartir chismes y burlas sobre un líder o compañero del grupo.',
    opts: [
      { text: 'Te ríes y sigues la corriente para encajar en el grupo', tone: 'fácil' },
      { text: 'Escribes con respeto pidiendo cambiar de tema y no hablar mal de quien no está presente', tone: 'correcta' },
      { text: 'Haces capturas de pantalla para enviárselas a todo el liderazgo sin intentar mediar primero', tone: 'trampa' }
    ],
    best: 1,
    verse: 'Proverbios 16:28',
    revelation: 'El hombre perverso promueve contienda, y el chismoso aparta a los mejores amigos. Poner un alto con madurez sana el ambiente comunitario.'
  },
  {
    id: 'qh4',
    scenario: 'Fuiste a la tienda a comprar algo pequeño y la cajera te entregó por equivocación un billete grande de más en el cambio.',
    opts: [
      { text: 'Guardas el dinero pensando "Dios proveyó hoy"', tone: 'fácil' },
      { text: 'Esperas y le devuelves el dinero sobrante explicándole el error con una sonrisa', tone: 'correcta' },
      { text: 'Lo donas en la ofrenda para calmar tu conciencia', tone: 'trampa' }
    ],
    best: 1,
    verse: 'Lucas 16:10',
    revelation: 'El que es fiel en lo muy poco, también en lo más es fiel; y el que en lo muy poco es injusto, también en lo más es injusto.'
  },
  {
    id: 'qh5',
    scenario: 'Alguien que te lastimó mucho en el pasado llega nuevo al grupo de jóvenes y busca integrarse a tu círculo de amigos.',
    opts: [
      { text: 'Adviertes a todos tus amigos para que nadie le hable', tone: 'trampa' },
      { text: 'Oras pidiendo a Dios fortaleza para perdonar y le das una bienvenida digna y respetuosa', tone: 'correcta' },
      { text: 'Te cambias de iglesia para no tener que verlo nunca más', tone: 'fácil' }
    ],
    best: 1,
    verse: 'Colosenses 3:13',
    revelation: 'Soportándoos con paciencia los unos a los otros, y perdonándoos si alguno tuviere queja contra otro. De la manera que Cristo os perdonó, así también hacedlo vosotros.'
  }
]

// 3. RETO 60 SEGUNDOS (Trivia rápida contra reloj)
export const RETO_60 = [
  { q: '¿Quién construyó el arca?', opts: ['Moisés', 'Noé', 'Abraham', 'David'], ans: 1, ref: 'Génesis 6' },
  { q: '¿Cuántos libros tiene el Nuevo Testamento?', opts: ['27', '39', '66', '12'], ans: 0, ref: 'Canon Bíblico' },
  { q: '¿Quién derrotó a Goliat con una honda?', opts: ['Saúl', 'David', 'Salomón', 'Sansón'], ans: 1, ref: '1 Samuel 17' },
  { q: '¿En qué ciudad nació Jesús?', opts: ['Nazaret', 'Jerusalén', 'Belén', 'Jericó'], ans: 2, ref: 'Mateo 2' },
  { q: '¿Quién fue tragado por un gran pez?', opts: ['Jonás', 'Elías', 'Pedro', 'Pablo'], ans: 0, ref: 'Jonás 1' },
  { q: '¿Cuántos días y noches llovió en el diluvio?', opts: ['7', '40', '100', '120'], ans: 1, ref: 'Génesis 7' },
  { q: '¿Quién recibió los Diez Mandamientos en el Sinaí?', opts: ['Aarón', 'Josué', 'Moisés', 'Abraham'], ans: 2, ref: 'Éxodo 20' },
  { q: '¿Cuál es el libro de sabiduría escrito principalmente por Salomón?', opts: ['Salmos', 'Proverbios', 'Hechos', 'Romanos'], ans: 1, ref: 'Proverbios' },
  { q: '¿Quién negó a Jesús tres veces antes de que cantara el gallo?', opts: ['Judas', 'Pedro', 'Juan', 'Tomás'], ans: 1, ref: 'Lucas 22' },
  { q: '¿Quién fue el hombre más fuerte de la Biblia?', opts: ['Gedeón', 'Sansón', 'David', 'Benaía'], ans: 1, ref: 'Jueces 14' },
  { q: '¿Cuál fue la primera plaga sobre Egipto?', opts: ['Ranas', 'Agua convertida en sangre', 'Langostas', 'Tinieblas'], ans: 1, ref: 'Éxodo 7' },
  { q: '¿Quién escribió la mayoría de las epístolas del Nuevo Testamento?', opts: ['Pedro', 'Juan', 'Pablo', 'Lucas'], ans: 2, ref: 'Epístolas paulinas' },
]

// 4. VERDADERO O FALSO
export const VERDADERO_FALSO = [
  {
    q: 'Matusalén es la persona más longeva mencionada en la Biblia con 969 años.',
    ans: true,
    ref: 'Génesis 5:27',
    explanation: 'Génesis 5:27 confirma que todos los días de Matusalén fueron novecientos sesenta y nueve años, y murió.'
  },
  {
    q: 'El apóstol Pablo fue uno de los 12 discípulos originales que caminaron con Jesús en su ministerio terrenal.',
    ans: false,
    ref: 'Gálatas 1:1',
    explanation: 'Pablo no formó parte de los 12 originales; fue llamado como apóstol por Jesucristo resucitado camino a Damasco.'
  },
  {
    q: 'El libro de los Salmos es el libro con mayor cantidad de capítulos en toda la Biblia.',
    ans: true,
    ref: 'Salmos',
    explanation: 'Salmos cuenta con 150 capítulos o poemas/cánticos, siendo el libro más extenso de las Escrituras.'
  },
  {
    q: 'El arca del pacto contenía las tablas de la ley, una vasija con maná y la vara de Aarón que floreció.',
    ans: true,
    ref: 'Hebreos 9:4',
    explanation: 'Hebreos 9:4 detalla los tres elementos sagrados depositados dentro del Arca del Testimonio.'
  },
  {
    q: 'Jesús fue bautizado por su primo Juan en el mar de Galilea.',
    ans: false,
    ref: 'Mateo 3:13',
    explanation: 'Jesús vino desde Galilea a Juan al río Jordán para ser bautizado por él.'
  },
  {
    q: 'El fruto del Espíritu Santo mencionado en Gálatas 5 incluye amor, gozo, paz y paciencia.',
    ans: true,
    ref: 'Gálatas 5:22-23',
    explanation: 'Gálatas 5:22 enumera el fruto del Espíritu: amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza.'
  }
]

// 5. AHORCADO BÍBLICO (Palabras, personajes y conceptos con pistas)
export const AHORCADO_BIBLICO = [
  { word: 'ABRAHAM', hint: 'Padre de la fe que salió de Ur sin saber adónde iba', cat: 'Personaje AT' },
  { word: 'GETSEMANI', hint: 'Jardín donde oró Jesús antes de ser arrestado', cat: 'Lugar' },
  { word: 'PENTECOSTES', hint: 'Día en que descendió el Espíritu Santo sobre los discípulos', cat: 'Acontecimiento' },
  { word: 'JERUSALEN', hint: 'Ciudad de David y capital espiritual de Israel', cat: 'Lugar' },
  { word: 'SALOMON', hint: 'Rey conocido por pedir a Dios un corazón sabio y entendido', cat: 'Personaje AT' },
  { word: 'BERNABÉ', hint: 'Compañero de Pablo cuyo nombre significa "hijo de consolación"', cat: 'Personaje NT' },
  { word: 'GALILEA', hint: 'Región donde Jesús realizó gran parte de sus primeros milagros', cat: 'Lugar' },
  { word: 'GRACIA', hint: 'Favor inmerecido de Dios para la salvación por medio de la fe', cat: 'Doctrina' },
]

// 6. ORDENA EL VERSÍCULO (Palabras para reordenar)
export const ORDENA_VERSICULO = [
  {
    id: 'ov1',
    ref: 'Salmos 23:1',
    words: ['El', 'Señor', 'es', 'mi', 'pastor;', 'nada', 'me', 'faltará.'],
    full: 'El Señor es mi pastor; nada me faltará.'
  },
  {
    id: 'ov2',
    ref: 'Filipenses 4:13',
    words: ['Todo', 'lo', 'puedo', 'en', 'Cristo', 'que', 'me', 'fortalece.'],
    full: 'Todo lo puedo en Cristo que me fortalece.'
  },
  {
    id: 'ov3',
    ref: '1 Juan 4:8',
    words: ['El', 'que', 'no', 'ama,', 'no', 'ha', 'conocido', 'a', 'Dios;', 'porque', 'Dios', 'es', 'amor.'],
    full: 'El que no ama, no ha conocido a Dios; porque Dios es amor.'
  },
  {
    id: 'ov4',
    ref: 'Proverbios 3:5',
    words: ['Confía', 'en', 'el', 'Señor', 'con', 'todo', 'tu', 'corazón.'],
    full: 'Confía en el Señor con todo tu corazón.'
  },
  {
    id: 'ov5',
    ref: 'Mateo 6:33',
    words: ['Buscad', 'primeramente', 'el', 'reino', 'de', 'Dios', 'y', 'su', 'justicia.'],
    full: 'Buscad primeramente el reino de Dios y su justicia.'
  }
]
