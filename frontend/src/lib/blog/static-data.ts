export interface BlogCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  gradient: string;
  cover_image: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published_at: string;
  category_slug: string;
  keywords: string[];
  author: {
    name: string;
    avatar?: string;
  };
}

export const categories: BlogCategory[] = [
  {
    id: 1,
    slug: "entrenamiento-y-energia-fisica",
    name: "Entrenamiento y Energía Física",
    description: "Rutinas, ejercicios y consejos para mantenerte en forma",
    gradient: "from-red-600 to-orange-500",
    cover_image:
      "https://res.cloudinary.com/lv3hwy1f/image/upload/v1793670778/articulos/triarvon/cat-entrenamiento-y-energia-fisica.jpg",
  },
  {
    id: 2,
    slug: "estilo-y-presencia",
    name: "Estilo y Presencia",
    description: "Moda masculina, grooming y presencia personal",
    gradient: "from-purple-600 to-pink-500",
    cover_image:
      "https://res.cloudinary.com/lv3hwy1f/image/upload/v1793670779/articulos/triarvon/cat-estilo-y-presencia.jpg",
  },
  {
    id: 3,
    slug: "mentalidad-y-disciplina",
    name: "Mentalidad y Disciplina",
    description: "Desarrollo personal, estoicismo y fortaleza mental",
    gradient: "from-blue-600 to-cyan-500",
    cover_image:
      "https://res.cloudinary.com/lv3hwy1f/image/upload/v1793670781/articulos/triarvon/cat-mentalidad-y-disciplina.jpg",
  },
  {
    id: 4,
    slug: "productividad-y-gestion-del-tiempo",
    name: "Productividad y Gestión del Tiempo",
    description: "Técnicas, herramientas y hábitos para ser más productivo",
    gradient: "from-green-600 to-teal-500",
    cover_image:
      "https://res.cloudinary.com/lv3hwy1f/image/upload/v1793670783/articulos/triarvon/cat-productividad-y-gestion-del-tiempo.jpg",
  },
];

export const posts: BlogPost[] = [
  {
    id: 1,
    slug: "rutina-corta-ejercicios-hombres-sin-tiempo",
    title: "Rutina corta de ejercicios para hombres sin tiempo (20 minutos)",
    excerpt:
      "¿Sin tiempo para el gym? Prueba esta rutina de 20 minutos de alta intensidad (HIIT) avalada por la ciencia.",
    content:
      '# Rutina de 20 minutos para días caóticos\n\nSi trabajas, estudias, tienes familia y aun así quieres entrenar, necesitas una rutina corta de ejercicios para hombres sin tiempo que funcione de verdad.\n\n## 1. Regla Triarvon: 20 minutos o menos, pero al máximo\n\n- **Intensidad > Duración**: Entrenos cortos tipo HIIT mejoran el VO₂ máx\n- **Frecuencia gana a Perfección**: 3 sesiones de 20 minutos > 1 sesión de 2 horas\n- **Movimientos Compuestos**: Sentadillas, flexiones, ejercicios multiarticulares\n\n## 2. Calentamiento de 3 minutos\n\n1. Marcha militar\n2. Rotaciones de tronco\n3. Círculos de hombros\n4. Sentadillas de aire\n5. Jumping Jacks\n\n## 3. El Circuito "Cuerpo Triarvon Express"\n\n**Estructura**: 30 segundos trabajo / 30 segundos descanso / 3-4 rondas\n\n1. **Sentadilla**: Baja profundo, sube explosivo\n2. **Flexiones**: Pecho al suelo, cuerpo en línea recta\n3. **Zancadas Alternas**: Paso largo, rodilla casi toca suelo\n4. **Mountain Climbers**: Plancha alta, rodillas al pecho alternando',
    cover_image: "/images/blog/blog_rutina_ejercicios_1767539449757.png",
    published_at: "2025-12-28",
    category_slug: "entrenamiento-y-energia-fisica",
    keywords: ["rutina corta", "HIIT", "ejercicios en casa"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 2,
    slug: "mejores-suplementos-gimnasio-hombres-principiantes",
    title:
      "Mejores suplementos gimnasio hombres principiantes: Creatina y Proteína",
    excerpt:
      "Guía honesta sobre creatina y proteína para hombres. Descubre qué suplementos funcionan realmente.",
    content:
      "# Creatina y Proteína: Guía honesta\n\nEl 95% de tu progreso viene del entrenamiento, la comida real y el descanso. Los suplementos son solo la cereza del pastel.\n\n## Los 2 Únicos Suplementos que Necesitas\n\n### 1. Creatina Monohidrato\n- El suplemento más estudiado del mundo\n- Aumenta fuerza y potencia muscular\n- **Dosis**: 3-5 gramos diarios\n\n### 2. Proteína en Polvo (Whey)\n- Forma cómoda de llegar a tus requerimientos\n- **Necesitas**: 1.6-2.2g por kg de peso corporal al día\n\n## Lo Que NO Necesitas\n\n- ❌ Pre-entrenos complicados (un café funciona igual)\n- ❌ BCAAs (ya vienen en la proteína)\n- ❌ Quemadores de grasa (no funcionan sin déficit calórico)",
    cover_image: "/images/blog/blog_suplementos_gym_1767539463949.png",
    published_at: "2025-12-26",
    category_slug: "entrenamiento-y-energia-fisica",
    keywords: ["creatina", "proteína", "suplementos"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 3,
    slug: "entrenamiento-fuerza-hombres-40-anos",
    title:
      "Entrenamiento de fuerza hombres 40 años: Guía para ganar músculo sin lesionarte",
    excerpt:
      "Entrenar después de los 40 requiere inteligencia, no solo esfuerzo. Descubre cómo adaptar tu rutina.",
    content:
      "# Entrenar Después de los 40: La Guía Inteligente\n\nTu cuerpo ya no perdona los errores de juventud, pero con la estrategia correcta, puedes estar en mejor forma que a los 30.\n\n## El Enemigo Silencioso: Sarcopenia\n\nA partir de los 30, perdemos 3-8% de masa muscular por década. El entrenamiento de fuerza es la ÚNICA intervención probada para revertirlo.\n\n## Principios del Entrenamiento +40\n\n1. **Calentamiento extenso**: 10-15 minutos mínimo\n2. **Movimientos compuestos**: Sentadillas, peso muerto, press\n3. **Volumen moderado**: 2-3 series, RPE 7-8\n4. **Recuperación sagrada**: Mínimo 48h entre grupos musculares\n\n## Rutina Ejemplo: Full Body 3x/Semana\n\n- Sentadilla Goblet: 3x10\n- Press de Banca con Mancuernas: 3x10\n- Remo con Mancuerna: 3x10\n- Plancha: 3x30 segundos",
    cover_image: "/images/blog/blog_fuerza_40_1767539477961.png",
    published_at: "2025-12-24",
    category_slug: "entrenamiento-y-energia-fisica",
    keywords: ["entrenamiento 40 años", "sarcopenia", "fuerza"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 4,
    slug: "ropa-oficina-hombre-casual-elegante",
    title:
      "Cómo vestir bien para la oficina con solo 7 prendas básicas (Armario Cápsula Hombre)",
    excerpt:
      "Descubre cómo crear un armario cápsula masculino con solo 7 prendas para vestir elegante sin gastar una fortuna.",
    content:
      "# El Armario Cápsula Masculino: 7 Prendas Esenciales\n\n## Las 7 Prendas Esenciales\n\n1. **Camisa Oxford Blanca**: La más versátil\n2. **Camisa Azul Claro**: Combina con todo\n3. **Pantalón Chino Azul Marino**: Elegante pero relajado\n4. **Pantalón Chino Beige**: Contraste perfecto\n5. **Blazer Azul Marino**: Smart casual instantáneo\n6. **Jersey de Punto Gris**: Para capas\n7. **Zapatos Oxford Marrones**: Una inversión de calidad\n\n## Reglas de Combinación\n\n- Nunca más de 3 colores en un outfit\n- El cinturón debe coincidir con los zapatos\n- El reloj es el único accesorio que necesitas",
    cover_image: "/images/blog/blog_armario_capsula_1767539507892.png",
    published_at: "2025-12-22",
    category_slug: "estilo-y-presencia",
    keywords: ["armario cápsula", "ropa oficina", "smart casual"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 5,
    slug: "estilos-de-barba-para-cara-redonda-cuadrada",
    title:
      "Barba de 3 días vs. Barba completa: Cuál te favorece según tu tipo de cara",
    excerpt:
      "Descubre qué estilo de barba favorece a tu rostro (redondo, cuadrado u ovalado).",
    content:
      "# La Guía Definitiva de Barba Según Tu Tipo de Cara\n\n## Identifica Tu Tipo de Cara\n\n- **Ovalada**: Casi cualquier estilo te queda bien\n- **Redonda**: Objetivo: alargar visualmente\n- **Cuadrada**: Objetivo: suavizar los ángulos\n- **Rectangular**: Objetivo: añadir anchura\n\n## Estilos Recomendados\n\n### Para Cara Redonda\n- Mantén los lados cortos\n- Deja crecer el mentón para alargar\n\n### Para Cara Cuadrada\n- Barba de 3 días o corta\n- Un poco de desorden controlado suaviza\n\n### Para Cara Ovalada\n- Tienes suerte, experimenta con todo\n\n## Mantenimiento Básico\n\n1. Lava 2-3 veces por semana\n2. Hidrata diariamente con aceite\n3. Recorta cada 1-2 semanas",
    cover_image: "/images/blog/blog_estilos_barba_1767539522849.png",
    published_at: "2025-12-20",
    category_slug: "estilo-y-presencia",
    keywords: ["barba", "tipo de cara", "grooming"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 6,
    slug: "como-combinar-zapatillas-con-ropa-formal-hombre",
    title:
      "Zapatillas blancas y traje: ¿Se puede? 3 reglas para no verte ridículo",
    excerpt:
      "Guía definitiva para usar zapatillas con traje sin perder elegancia. Aprende las 3 reglas de oro.",
    content:
      "# Zapatillas con Traje: La Guía Definitiva\n\nSí, se puede usar zapatillas con traje. Pero hay una línea muy fina entre verse moderno y verse ridículo.\n\n## Las 3 Reglas de Oro\n\n### Regla 1: La Zapatilla Debe Ser Minimalista\n- ✅ Zapatillas blancas lisas\n- ✅ Cuero o materiales premium\n- ❌ Zapatillas de running\n- ❌ Chunky sneakers\n\n### Regla 2: El Traje Debe Ser Casual\n- ✅ Trajes sin corbata\n- ✅ Blazer + pantalón chino\n- ❌ Trajes de 3 piezas\n\n### Regla 3: El Pantalón Debe Mostrar el Tobillo\n- Pantalón slim o recto\n- Dobladillo justo sobre el tobillo",
    cover_image: "/images/blog/blog_zapatillas_traje_1767539540475.png",
    published_at: "2025-12-18",
    category_slug: "estilo-y-presencia",
    keywords: ["zapatillas traje", "smart casual", "moda masculina"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 7,
    slug: "como-ser-mas-disciplinado-en-la-vida",
    title:
      "El Sistema Triarvon de Disciplina: Cómo ser constante cuando se acaba la motivación",
    excerpt:
      "¿Te falla la fuerza de voluntad? Aprende el Sistema Triarvon basado en la identidad y la neurociencia.",
    content:
      '# El Sistema Triarvon de Disciplina\n\nLa motivación es una emoción, y las emociones suben y bajan. Los hombres que sostienen resultados durante años no dependen de sentirse inspirados cada mañana: dependen de sistemas que funcionan incluso en los días en que no tienen ganas. Si hoy te cuesta ser constante, no tienes un problema de carácter. Tienes un problema de diseño.\n\nEsta guía te muestra cómo construir disciplina que no se acabe cuando la motivación se va, con tres pilares, un protocolo para los días difíciles y un plan de siete días para empezar.\n\n## Por qué la fuerza de voluntad no alcanza\n\nLa fuerza de voluntad funciona como un recurso limitado: se gasta tomando decisiones, resistiendo tentaciones y soportando el estrés del trabajo. Al final de un día largo quedan pocas reservas, y es justo cuando decides saltarte el entrenamiento o pedir comida rápida.\n\nLa salida no es "apretar más los dientes". Es reducir la cantidad de decisiones que dependen de tu fuerza de voluntad. Cuanto más automático sea un hábito, menos energía mental cuesta cumplirlo. Eso es disciplina real: no pelear cada día la misma batalla, sino haberla ganado de antemano con buen diseño.\n\n## El Sistema Triarvon: 3 pilares\n\n### Pilar 1: Diseño de identidad\n\nNo digas "quiero ir al gym". Di "soy una persona que entrena". La diferencia parece pequeña, pero cambia cómo decides. Un hombre que quiere ir al gym negocia consigo mismo cada día. Un hombre que es de los que entrenan solo ejecuta lo que corresponde a su identidad.\n\nCómo construirla en la práctica:\n\n- **Elige una identidad concreta**, no un resultado. "Soy un hombre que cuida su cuerpo" es más útil que "quiero bajar 8 kilos".\n- **Reúne pruebas pequeñas.** Cada vez que cumples una acción, es un voto a favor de esa identidad. Tres entrenamientos en una semana ya son evidencia.\n- **Cambia el lenguaje.** Pasa de "tengo que" a "soy alguien que". Sin dramatismo, solo precisión.\n\n### Pilar 2: Arquitectura de entorno\n\nHaz que lo correcto sea fácil y lo incorrecto sea difícil. Tu entorno decide más de tu conducta que tu intención.\n\n- Deja el libro sobre la almohada y el móvil cargando en otra habitación.\n- No tengas comida ultraprocesada en casa: si hay que salir a comprarla, la mayoría de las noches no lo harás.\n- Deja la ropa de entrenar lista la noche anterior y a la vista.\n- Si trabajas desde casa, ten un solo lugar para trabajar y evita hacerlo desde la cama.\n- Silencia las notificaciones que no vengan de personas reales.\n\nLa regla es sencilla: cuenta cada fricción que quitas a un buen hábito y cada fricción que añades a uno malo. Cuesta cinco minutos de preparación y ahorra cientos de decisiones.\n\n### Pilar 3: Rituales inquebrantables\n\nUn ritual no se negocia. Mismo horario, mismo lugar, misma secuencia. Cuando algo siempre ocurre igual, el cerebro deja de preguntarse si lo hace o no, y simplemente lo hace.\n\nPara diseñar un ritual:\n\n1. **Ancla** la acción a algo que ya haces: "después de mi primer café, escribo mis tres prioridades".\n2. **Define el mínimo** que cuenta como cumplido, tan pequeño que sea imposible fallar.\n3. **Protege el horario** como protegerías una reunión con un cliente importante.\n4. **Regístralo.** Marcar un calendario es suficiente y genera tracción.\n\n## El protocolo de los 2 minutos\n\nCuando no tengas ganas, comprométete solo a dos minutos. Ponte las zapatillas y sal a la puerta, abre el documento y escribe una línea, haz una flexión. Lo más difícil de cualquier hábito es empezar; una vez en movimiento, lo habitual es continuar.\n\nY si de verdad paras a los dos minutos, no pasa nada: ese día cumpliste la versión mínima y conservaste la racha. La constancia se construye con días mínimos cumplidos, no con días heroicos aislados.\n\n## Qué hacer cuando fallas un día\n\nFallarás. Lo que separa a quien logra resultados de quien abandona es la regla del "nunca dos seguidos":\n\n- Fallar un día es un accidente.\n- Fallar dos días es el comienzo de un nuevo hábito.\n\nSi te saltaste hoy, mañana vuelves a la versión mínima sin discursos ni castigos. Evita el "ya arruiné la semana", que convierte un tropiezo en un abandono.\n\n## Plan de 7 días para empezar\n\n1. **Día 1:** elige un solo hábito y escribe la identidad que lo respalda.\n2. **Día 2:** reorganiza tu entorno: quita una fricción mala y añade una buena.\n3. **Día 3:** define el ritual (ancla, horario y mínimo).\n4. **Día 4:** cumple solo la versión de 2 minutos.\n5. **Día 5:** sube un poco la exigencia si te sentiste bien.\n6. **Día 6:** revisa qué te frenó y ajusta el entorno, no tu autoestima.\n7. **Día 7:** repasa la semana y decide si añades un segundo hábito o consolidas el primero.\n\nNo añadas más de un hábito nuevo por vez. Un hábito sólido vale más que cinco a medias.\n\n## Errores comunes\n\n- **Cambiar todo a la vez.** Reduce a uno o dos hábitos clave.\n- **Depender del ánimo.** Si solo lo haces cuando te sientes bien, no es disciplina.\n- **Medir solo resultados.** Mide cumplimiento: los resultados llegan después.\n- **Castigarte al fallar.** La culpa desgasta; el ajuste del sistema funciona.\n\n## Preguntas frecuentes\n\n**¿Cuánto tarda en formarse un hábito?**\nDepende de la persona y de la complejidad del hábito. Lo importante no es contar días, sino repetir la acción en condiciones parecidas hasta que se vuelva automática.\n\n**¿Sirve la disciplina si tengo mucho estrés o poco sueño?**\nSí, pero ajusta el mínimo. Dormir mal reduce la capacidad de autocontrol, así que en esas semanas protege lo esencial y baja la exigencia sin romper la racha.\n\n**¿Qué hago si pierdo el interés?**\nEs normal. Vuelve al porqué que te llevó a empezar y reduce la tarea al mínimo. Si tras varias semanas no te dice nada, quizás ese hábito no encaja con tu identidad y conviene cambiarlo.\n\n## Siguiente paso\n\nElige un hábito, un ancla y un mínimo, y cúmplelos durante siete días. Si quieres un plan a la medida de tu agenda, el Coach de Triarvon puede ayudarte a diseñarlo y a ajustarlo cada semana.',
    cover_image: "/images/blog/blog_disciplina_triarvon_1767539574372.png",
    published_at: "2025-12-16",
    category_slug: "mentalidad-y-disciplina",
    keywords: ["disciplina", "hábitos", "productividad"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 8,
    slug: "rutina-de-manana-para-hombres-exitosos",
    title:
      "Cómo construir una rutina de mañana masculina en 5 pasos (que sí puedas cumplir)",
    excerpt:
      "Olvida el 'club de las 5 AM'. Diseña una rutina de mañana realista que dispare tu energía y enfoque.",
    content:
      "# La Rutina de Mañana Realista\n\nLo que importa no es la hora, sino QUÉ haces en los primeros 60-90 minutos.\n\n## Los 5 Componentes Científicos\n\n### 1. Luz Solar en los Ojos (Primeros 30 min)\nResetea tu ritmo circadiano, mejora el sueño de esa noche.\n\n### 2. Retrasa la Cafeína\nEspera 90 minutos después de despertar para el primer café.\n\n### 3. Movimiento Antes que Pantallas\n10-20 minutos de movimiento. Caminar, estirar, yoga básico.\n\n### 4. Bloque de Trabajo Profundo\n90 minutos de trabajo enfocado. Teléfono en modo avión.\n\n### 5. Desayuno con Proteína\n30-40g de proteína estabiliza la glucosa y te mantiene enfocado.",
    cover_image: "/images/blog/blog_rutina_manana_1767539588985.png",
    published_at: "2025-12-14",
    category_slug: "mentalidad-y-disciplina",
    keywords: ["rutina mañana", "productividad", "hábitos matutinos"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 9,
    slug: "ejercicios-estoicismo-control-emociones",
    title:
      "La regla de los 5 segundos para controlar la ira y el estrés en el trabajo",
    excerpt:
      "¿Pierdes los papeles bajo presión? Aprende a usar la 'Regla de los 5 Segundos' para liderar con estoicismo.",
    content:
      '# Control Emocional Estoico: La Regla de los 5 Segundos\n\nTienes exactamente 5 segundos antes de que tu cerebro emocional secuestre tu cerebro racional.\n\n## La Regla de los 5 Segundos\n\n### Segundo 1-2: PARA\nDetén cualquier respuesta verbal o física.\n\n### Segundo 3: RESPIRA\nUna respiración profunda activa el sistema parasimpático.\n\n### Segundo 4-5: NOMBRA\nDi internamente: "Esto es ira". Nombrar reduce la intensidad un 50%.\n\n## Técnicas Estoicas Complementarias\n\n### El Marco de Control\n¿Esto está bajo mi control? Sí → Actúa. No → Suéltalo.\n\n### La Vista desde Arriba\nImagina la situación desde 10,000 metros. ¿Lo recordarás en 5 años?',
    cover_image: "/images/blog/blog_control_ira_1767539603270.png",
    published_at: "2025-12-12",
    category_slug: "mentalidad-y-disciplina",
    keywords: ["estoicismo", "control emocional", "ira"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 10,
    slug: "hacer-amigos-hombres-adultos-valores",
    title:
      'La soledad masculina: Por qué necesitas un "Círculo de Hierro" y cómo crearlo',
    excerpt:
      "La soledad masculina es una epidemia silenciosa. Descubre cómo crear tu grupo de hombres con valores.",
    content:
      '# El Círculo de Hierro: combatiendo la soledad masculina\n\nMuchos hombres adultos llegan a los treinta o cuarenta con una vida llena de obligaciones y casi sin amistades cercanas. Trabajo, pareja, hijos, deudas: los amigos de la universidad se mudaron, los compañeros de oficina son conocidos y las conversaciones se reducen a deporte, política y bromas. Se puede estar rodeado de gente y sentirse solo.\n\nLa soledad masculina rara vez se nota, porque casi nadie la dice en voz alta. Pero afecta el ánimo, el sueño, la motivación y la manera de enfrentar los problemas. La buena noticia es que se puede corregir de forma deliberada. Aquí tienes cómo construir lo que llamamos un Círculo de Hierro.\n\n## ¿Qué es un Círculo de Hierro?\n\nEs un grupo pequeño, de tres a cinco hombres, con quienes puedes ser completamente honesto. Tiene tres características:\n\n- **Honestidad:** puedes contar lo que de verdad te pasa, incluidos los miedos y los errores, sin que te juzguen ni lo conviertan en chiste.\n- **Exigencia:** te desafían a mejorar y no te dejan esconderte en excusas.\n- **Apoyo:** están cuando algo sale mal, sin necesidad de que lo pidas tres veces.\n\nNo es un grupo de amigos de fiesta ni un club de networking. Es un grupo donde lo importante se habla.\n\n## Por qué los hombres pierden a sus amigos\n\nEntender la causa ayuda a no culparte:\n\n- **Falta de tiempo.** Las amistades adultas no se forman solas, como en el colegio; hay que organizarlas.\n- **Conversaciones superficiales.** Si todo queda en bromas, no se construye confianza.\n- **Miedo a parecer vulnerable.** Pedir ayuda o admitir que estás mal se siente como debilidad, aunque es lo que fortalece los vínculos.\n- **Cambios de etapa.** Mudanzas, parejas e hijos reducen los encuentros hasta que se apagan.\n\n## Cómo construirlo\n\n### Paso 1: define qué buscas\n\nAntes de buscar gente, sé claro. ¿Hombres que te empujen a crecer en lo físico? ¿Que compartan tu ambición profesional? ¿Con valores de familia parecidos a los tuyos? Escribe tres cualidades que quieres en el grupo y tres que ofrecerás tú. Un círculo se sostiene cuando todos aportan.\n\n### Paso 2: busca en los lugares correctos\n\nLas amistades se forman donde hay repetición y un interés compartido:\n\n- Gimnasios con clases fijas (CrossFit, artes marciales, running).\n- Grupos de interés regulares: ajedrez, ciclismo, senderismo, mercados de emprendedores.\n- Comunidades de desarrollo personal, clubes de lectura o grupos de estudio.\n- Voluntariados y proyectos de tu barrio o de tu iglesia, si eres creyente.\n\nLo clave es la frecuencia: ver a las mismas personas cada semana durante meses.\n\n### Paso 3: inicia conversaciones reales\n\nDeja de hablar solo de deportes. Prueba con preguntas que abren la puerta:\n\n- "¿En qué estás trabajando ahora que te tiene ilusionado?"\n- "¿Qué es lo más difícil que estás manejando este año?"\n- "¿Cómo equilibras el trabajo con tu familia?"\n\nResponde tú primero con algo honesto, aunque sea pequeño. La vulnerabilidad se contagia: alguien tiene que empezar.\n\n### Paso 4: propón encuentros regulares\n\nLa consistencia crea confianza. Propón algo concreto y repetible: un café cada dos semanas, un entrenamiento el sábado, una cena mensual. Fija el día en el calendario de todos. "Un día de estos nos vemos" casi nunca ocurre.\n\n### Paso 5: sube la profundidad poco a poco\n\nNo empieces contando tus traumas el primer día. Avanza por capas: primero tiempo compartido, luego opiniones, luego decisiones difíciles y por último miedos. Cada capa se gana cuando la anterior fue recibida con respeto.\n\n## Reglas del grupo\n\nUn Círculo de Hierro funciona cuando todos aceptan unas pocas normas:\n\n1. **Confidencialidad:** lo que se dice dentro, se queda dentro.\n2. **Cero burla a lo vulnerable.** El humor está bien, pero no a costa de lo que alguien confió.\n3. **Compromiso:** se avisa si no se puede asistir; la ausencia constante debilita al grupo.\n4. **Consejos pedidos, no impuestos.** A veces solo hay que escuchar.\n5. **Retos mutuos:** cada uno comparte una meta y los demás le preguntan por ella.\n\n## Errores frecuentes\n\n- **Esperar a que otros den el primer paso.** Si lo quieres, organiza tú.\n- **Reunir mucha gente.** Más de cinco personas diluyen la confianza.\n- **Convertirlo en queja.** Compartir problemas es bueno; quedarse en ellos no.\n- **Abandonar tras dos intentos fallidos.** Las amistades se construyen con meses de constancia.\n\n## Si estás muy solo ahora mismo\n\nEmpieza con una sola persona. Escribe a un antiguo amigo y propón un café sin agenda. Apúntate a una actividad semanal. Y si la soledad viene acompañada de tristeza persistente, desesperanza o pensamientos de hacerte daño, habla con un profesional de salud mental o con una línea de ayuda de tu país: pedir ayuda es una decisión fuerte, no un fracaso.\n\n## Preguntas frecuentes\n\n**¿Es normal no tener amigos cercanos a los 35 o 40 años?**\nEs más común de lo que parece. No es un defecto personal: es una consecuencia de etapas de vida muy ocupadas, y se puede revertir con acciones concretas.\n\n**¿Cuánto tarda en formarse un círculo así?**\nDepende de la frecuencia con la que se vean y de la apertura de cada uno. Cuenta con varios meses de encuentros regulares antes de que aparezca confianza real.\n\n**¿Y si soy introvertido?**\nMejor: un círculo pequeño te conviene más que muchas relaciones superficiales. Elige actividades con estructura, como entrenar o jugar, donde la conversación fluye sin tanto esfuerzo.\n\n## Siguiente paso\n\nEsta semana haz una sola cosa: escribe a un hombre que respetes y propón un encuentro con fecha. Si quieres trabajar la constancia para mantenerlo, lee el Sistema Triarvon de Disciplina o pide ayuda al Coach de Triarvon para planificarlo.',
    cover_image: "/images/blog/blog_circulo_hierro_1767539617845.png",
    published_at: "2025-12-10",
    category_slug: "mentalidad-y-disciplina",
    keywords: ["soledad masculina", "amistad", "círculo de hombres"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 11,
    slug: "rutina-de-noche-para-dormir-mejor-hombres",
    title:
      "Rutina de noche para dormir mejor: El protocolo para apagar tu cerebro",
    excerpt:
      "¿Te cuesta dormir? El sueño es tu mayor potenciador de testosterona. Aplica este protocolo de 4 pasos.",
    content:
      "# El Protocolo Nocturno para Dormir Como un Rey\n\nEl sueño es el potenciador de rendimiento más subestimado.\n\n## El Protocolo de 4 Pasos\n\n### Paso 1: Corte de Pantallas (2 horas antes)\nSin televisión, teléfono, ni laptop. Alternativas: libros, conversación, estiramientos.\n\n### Paso 2: Baja la Temperatura\nHabitación a 18-20°C. Ducha tibia 1 hora antes.\n\n### Paso 3: Descarga Mental\nEscribe TODO lo que tengas en la cabeza. Cierra el cuaderno. Problema transferido al papel.\n\n### Paso 4: Ambiente Perfecto\n- Oscuridad total\n- Silencio o ruido blanco\n- Sin teléfono en la habitación",
    cover_image: "/images/blog/blog_rutina_noche_1767539647735.png",
    published_at: "2025-12-08",
    category_slug: "productividad-y-gestion-del-tiempo",
    keywords: ["dormir mejor", "insomnio", "rutina nocturna"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 12,
    slug: "tecnicas-de-concentracion-para-estudiar-y-trabajar",
    title:
      "Trabajo Profundo (Deep Work): Cómo lograr en 2 horas lo que antes hacías en 8",
    excerpt:
      "Aprende la técnica del 'Deep Work'. Elimina la multitarea y duplica tu productividad.",
    content:
      '# Deep Work: El Superpoder de la Era de la Distracción\n\nLa capacidad de concentrarse sin distracciones es tu ventaja competitiva más valiosa.\n\n## La Fórmula\n\n**Trabajo de Alta Calidad = Tiempo x Intensidad de Enfoque**\n\n2 horas de trabajo profundo > 8 horas de trabajo fragmentado\n\n## El Protocolo Deep Work\n\n### 1. Bloquea el Tiempo\nMínimo 90 minutos. Ideal 2-4 horas. Mañanas para pico cognitivo.\n\n### 2. Prepara el Ambiente\n- Teléfono en modo avión (en otra habitación)\n- Un solo documento abierto\n- Agua y café listos\n\n### 3. Define el Entregable\nNo "voy a trabajar". Sí "voy a terminar el borrador del capítulo 3".\n\n### 4. Ritual de Cierre\nRevisa lo logrado, define la primera acción para mañana.',
    cover_image: "/images/blog/blog_deep_work_1767539662356.png",
    published_at: "2025-12-06",
    category_slug: "productividad-y-gestion-del-tiempo",
    keywords: ["deep work", "concentración", "productividad"],
    author: { name: "Andrés Guerrero" },
  },
  {
    id: 13,
    slug: "herramientas-inteligencia-artificial-productividad-trabajo",
    title:
      "Cómo usar ChatGPT (o IA) para hacer tu trabajo aburrido en la mitad de tiempo",
    excerpt:
      "La IA no te va a reemplazar, pero un hombre que use IA sí lo hará. Aprende a automatizar tareas.",
    content:
      '# IA para Hombres Productivos: Guía Práctica\n\nLa IA no es magia. Es una herramienta.\n\n## Lo que SÍ hace bien\n\n- Tareas repetitivas\n- Primeros borradores\n- Resumir información\n- Brainstorming\n\n## 10 Usos Prácticos de ChatGPT\n\n1. **Emails Profesionales**: "Escribe un email rechazando una propuesta..."\n2. **Resumir Documentos**: "Resume los 5 puntos clave..."\n3. **Preparar Reuniones**: "Dame 5 preguntas inteligentes para..."\n4. **Explicar Conceptos**: "Explícame X como si tuviera 10 años"\n5. **Crear Plantillas**: "Crea una plantilla de informe semanal"\n\n## La Fórmula del Prompt Perfecto\n\n1. **Rol**: "Eres un experto en X"\n2. **Contexto**: "Situación específica"\n3. **Tarea**: "Qué necesitas exactamente"\n4. **Formato**: "Cómo lo quieres"\n5. **Restricciones**: "Qué evitar, longitud, tono"',
    cover_image: "/images/blog/blog_chatgpt_ia_1767539676624.png",
    published_at: "2025-12-04",
    category_slug: "productividad-y-gestion-del-tiempo",
    keywords: ["ChatGPT", "IA", "productividad"],
    author: { name: "Andrés Guerrero" },
  },
];

// Helper functions
export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return posts.filter((post) => post.category_slug === categorySlug);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export function getRecentPosts(limit: number = 5): BlogPost[] {
  return getAllPosts().slice(0, limit);
}
