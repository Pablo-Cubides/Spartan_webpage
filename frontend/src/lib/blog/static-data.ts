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
        cover_image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        slug: "estilo-y-presencia",
        name: "Estilo y Presencia",
        description: "Moda masculina, grooming y presencia personal",
        gradient: "from-purple-600 to-pink-500",
        cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        slug: "mentalidad-y-disciplina",
        name: "Mentalidad y Disciplina",
        description: "Desarrollo personal, estoicismo y fortaleza mental",
        gradient: "from-blue-600 to-cyan-500",
        cover_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        slug: "productividad-y-gestion-del-tiempo",
        name: "Productividad y Gestión del Tiempo",
        description: "Técnicas, herramientas y hábitos para ser más productivo",
        gradient: "from-green-600 to-teal-500",
        cover_image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80"
    }
];

export const posts: BlogPost[] = [
    {
        id: 1,
        slug: "rutina-corta-ejercicios-hombres-sin-tiempo",
        title: "Rutina corta de ejercicios para hombres sin tiempo (20 minutos)",
        excerpt: "¿Sin tiempo para el gym? Prueba esta rutina de 20 minutos de alta intensidad (HIIT) avalada por la ciencia.",
        content: "# Rutina de 20 minutos para días caóticos\n\nSi trabajas, estudias, tienes familia y aun así quieres entrenar, necesitas una rutina corta de ejercicios para hombres sin tiempo que funcione de verdad.\n\n## 1. Regla Espartana: 20 minutos o menos, pero al máximo\n\n- **Intensidad > Duración**: Entrenos cortos tipo HIIT mejoran el VO₂ máx\n- **Frecuencia gana a Perfección**: 3 sesiones de 20 minutos > 1 sesión de 2 horas\n- **Movimientos Compuestos**: Sentadillas, flexiones, ejercicios multiarticulares\n\n## 2. Calentamiento de 3 minutos\n\n1. Marcha militar\n2. Rotaciones de tronco\n3. Círculos de hombros\n4. Sentadillas de aire\n5. Jumping Jacks\n\n## 3. El Circuito \"Cuerpo Espartano Express\"\n\n**Estructura**: 30 segundos trabajo / 30 segundos descanso / 3-4 rondas\n\n1. **Sentadilla**: Baja profundo, sube explosivo\n2. **Flexiones**: Pecho al suelo, cuerpo en línea recta\n3. **Zancadas Alternas**: Paso largo, rodilla casi toca suelo\n4. **Mountain Climbers**: Plancha alta, rodillas al pecho alternando",
        cover_image: "/images/blog/blog_rutina_ejercicios_1767539449757.png",
        published_at: "2025-12-28",
        category_slug: "entrenamiento-y-energia-fisica",
        keywords: ["rutina corta", "HIIT", "ejercicios en casa"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 2,
        slug: "mejores-suplementos-gimnasio-hombres-principiantes",
        title: "Mejores suplementos gimnasio hombres principiantes: Creatina y Proteína",
        excerpt: "Guía honesta sobre creatina y proteína para hombres. Descubre qué suplementos funcionan realmente.",
        content: "# Creatina y Proteína: Guía honesta\n\nEl 95% de tu progreso viene del entrenamiento, la comida real y el descanso. Los suplementos son solo la cereza del pastel.\n\n## Los 2 Únicos Suplementos que Necesitas\n\n### 1. Creatina Monohidrato\n- El suplemento más estudiado del mundo\n- Aumenta fuerza y potencia muscular\n- **Dosis**: 3-5 gramos diarios\n\n### 2. Proteína en Polvo (Whey)\n- Forma cómoda de llegar a tus requerimientos\n- **Necesitas**: 1.6-2.2g por kg de peso corporal al día\n\n## Lo Que NO Necesitas\n\n- ❌ Pre-entrenos complicados (un café funciona igual)\n- ❌ BCAAs (ya vienen en la proteína)\n- ❌ Quemadores de grasa (no funcionan sin déficit calórico)",
        cover_image: "/images/blog/blog_suplementos_gym_1767539463949.png",
        published_at: "2025-12-26",
        category_slug: "entrenamiento-y-energia-fisica",
        keywords: ["creatina", "proteína", "suplementos"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 3,
        slug: "entrenamiento-fuerza-hombres-40-anos",
        title: "Entrenamiento de fuerza hombres 40 años: Guía para ganar músculo sin lesionarte",
        excerpt: "Entrenar después de los 40 requiere inteligencia, no solo esfuerzo. Descubre cómo adaptar tu rutina.",
        content: "# Entrenar Después de los 40: La Guía Inteligente\n\nTu cuerpo ya no perdona los errores de juventud, pero con la estrategia correcta, puedes estar en mejor forma que a los 30.\n\n## El Enemigo Silencioso: Sarcopenia\n\nA partir de los 30, perdemos 3-8% de masa muscular por década. El entrenamiento de fuerza es la ÚNICA intervención probada para revertirlo.\n\n## Principios del Entrenamiento +40\n\n1. **Calentamiento extenso**: 10-15 minutos mínimo\n2. **Movimientos compuestos**: Sentadillas, peso muerto, press\n3. **Volumen moderado**: 2-3 series, RPE 7-8\n4. **Recuperación sagrada**: Mínimo 48h entre grupos musculares\n\n## Rutina Ejemplo: Full Body 3x/Semana\n\n- Sentadilla Goblet: 3x10\n- Press de Banca con Mancuernas: 3x10\n- Remo con Mancuerna: 3x10\n- Plancha: 3x30 segundos",
        cover_image: "/images/blog/blog_fuerza_40_1767539477961.png",
        published_at: "2025-12-24",
        category_slug: "entrenamiento-y-energia-fisica",
        keywords: ["entrenamiento 40 años", "sarcopenia", "fuerza"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 4,
        slug: "ropa-oficina-hombre-casual-elegante",
        title: "Cómo vestir bien para la oficina con solo 7 prendas básicas (Armario Cápsula Hombre)",
        excerpt: "Descubre cómo crear un armario cápsula masculino con solo 7 prendas para vestir elegante sin gastar una fortuna.",
        content: "# El Armario Cápsula Masculino: 7 Prendas Esenciales\n\n## Las 7 Prendas Esenciales\n\n1. **Camisa Oxford Blanca**: La más versátil\n2. **Camisa Azul Claro**: Combina con todo\n3. **Pantalón Chino Azul Marino**: Elegante pero relajado\n4. **Pantalón Chino Beige**: Contraste perfecto\n5. **Blazer Azul Marino**: Smart casual instantáneo\n6. **Jersey de Punto Gris**: Para capas\n7. **Zapatos Oxford Marrones**: Una inversión de calidad\n\n## Reglas de Combinación\n\n- Nunca más de 3 colores en un outfit\n- El cinturón debe coincidir con los zapatos\n- El reloj es el único accesorio que necesitas",
        cover_image: "/images/blog/blog_armario_capsula_1767539507892.png",
        published_at: "2025-12-22",
        category_slug: "estilo-y-presencia",
        keywords: ["armario cápsula", "ropa oficina", "smart casual"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 5,
        slug: "estilos-de-barba-para-cara-redonda-cuadrada",
        title: "Barba de 3 días vs. Barba completa: Cuál te favorece según tu tipo de cara",
        excerpt: "Descubre qué estilo de barba favorece a tu rostro (redondo, cuadrado u ovalado).",
        content: "# La Guía Definitiva de Barba Según Tu Tipo de Cara\n\n## Identifica Tu Tipo de Cara\n\n- **Ovalada**: Casi cualquier estilo te queda bien\n- **Redonda**: Objetivo: alargar visualmente\n- **Cuadrada**: Objetivo: suavizar los ángulos\n- **Rectangular**: Objetivo: añadir anchura\n\n## Estilos Recomendados\n\n### Para Cara Redonda\n- Mantén los lados cortos\n- Deja crecer el mentón para alargar\n\n### Para Cara Cuadrada\n- Barba de 3 días o corta\n- Un poco de desorden controlado suaviza\n\n### Para Cara Ovalada\n- Tienes suerte, experimenta con todo\n\n## Mantenimiento Básico\n\n1. Lava 2-3 veces por semana\n2. Hidrata diariamente con aceite\n3. Recorta cada 1-2 semanas",
        cover_image: "/images/blog/blog_estilos_barba_1767539522849.png",
        published_at: "2025-12-20",
        category_slug: "estilo-y-presencia",
        keywords: ["barba", "tipo de cara", "grooming"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 6,
        slug: "como-combinar-zapatillas-con-ropa-formal-hombre",
        title: "Zapatillas blancas y traje: ¿Se puede? 3 reglas para no verte ridículo",
        excerpt: "Guía definitiva para usar zapatillas con traje sin perder elegancia. Aprende las 3 reglas de oro.",
        content: "# Zapatillas con Traje: La Guía Definitiva\n\nSí, se puede usar zapatillas con traje. Pero hay una línea muy fina entre verse moderno y verse ridículo.\n\n## Las 3 Reglas de Oro\n\n### Regla 1: La Zapatilla Debe Ser Minimalista\n- ✅ Zapatillas blancas lisas\n- ✅ Cuero o materiales premium\n- ❌ Zapatillas de running\n- ❌ Chunky sneakers\n\n### Regla 2: El Traje Debe Ser Casual\n- ✅ Trajes sin corbata\n- ✅ Blazer + pantalón chino\n- ❌ Trajes de 3 piezas\n\n### Regla 3: El Pantalón Debe Mostrar el Tobillo\n- Pantalón slim o recto\n- Dobladillo justo sobre el tobillo",
        cover_image: "/images/blog/blog_zapatillas_traje_1767539540475.png",
        published_at: "2025-12-18",
        category_slug: "estilo-y-presencia",
        keywords: ["zapatillas traje", "smart casual", "moda masculina"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 7,
        slug: "como-ser-mas-disciplinado-en-la-vida",
        title: "El Sistema Spartan de Disciplina: Cómo ser constante cuando se acaba la motivación",
        excerpt: "¿Te falla la fuerza de voluntad? Aprende el Sistema Spartan basado en la identidad y la neurociencia.",
        content: "# El Sistema Spartan de Disciplina\n\nLa motivación es una mentira. Es una emoción fugaz. Los hombres que logran resultados extraordinarios dependen de sistemas.\n\n## El Sistema Spartan: 3 Pilares\n\n### Pilar 1: Diseño de Identidad\nNo digas \"quiero ir al gym\". Di \"soy una persona que entrena\".\n\n### Pilar 2: Arquitectura de Entorno\nHaz que lo correcto sea fácil y lo incorrecto sea difícil.\n- Deja el libro en la almohada, el móvil en otra habitación\n- No tengas comida basura en casa\n\n### Pilar 3: Rituales Inquebrantables\nUn ritual no se negocia. Mismo horario, mismo lugar, misma secuencia.\n\n## El Protocolo de los 2 Minutos\n\nCuando no tengas ganas, comprométete solo a 2 minutos. El 90% de las veces, una vez que empiezas, continúas.",
        cover_image: "/images/blog/blog_disciplina_spartan_1767539574372.png",
        published_at: "2025-12-16",
        category_slug: "mentalidad-y-disciplina",
        keywords: ["disciplina", "hábitos", "productividad"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 8,
        slug: "rutina-de-manana-para-hombres-exitosos",
        title: "Cómo construir una rutina de mañana masculina en 5 pasos (que sí puedas cumplir)",
        excerpt: "Olvida el 'club de las 5 AM'. Diseña una rutina de mañana realista que dispare tu energía y enfoque.",
        content: "# La Rutina de Mañana Realista\n\nLo que importa no es la hora, sino QUÉ haces en los primeros 60-90 minutos.\n\n## Los 5 Componentes Científicos\n\n### 1. Luz Solar en los Ojos (Primeros 30 min)\nResetea tu ritmo circadiano, mejora el sueño de esa noche.\n\n### 2. Retrasa la Cafeína\nEspera 90 minutos después de despertar para el primer café.\n\n### 3. Movimiento Antes que Pantallas\n10-20 minutos de movimiento. Caminar, estirar, yoga básico.\n\n### 4. Bloque de Trabajo Profundo\n90 minutos de trabajo enfocado. Teléfono en modo avión.\n\n### 5. Desayuno con Proteína\n30-40g de proteína estabiliza la glucosa y te mantiene enfocado.",
        cover_image: "/images/blog/blog_rutina_manana_1767539588985.png",
        published_at: "2025-12-14",
        category_slug: "mentalidad-y-disciplina",
        keywords: ["rutina mañana", "productividad", "hábitos matutinos"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 9,
        slug: "ejercicios-estoicismo-control-emociones",
        title: "La regla de los 5 segundos para controlar la ira y el estrés en el trabajo",
        excerpt: "¿Pierdes los papeles bajo presión? Aprende a usar la 'Regla de los 5 Segundos' para liderar con estoicismo.",
        content: "# Control Emocional Estoico: La Regla de los 5 Segundos\n\nTienes exactamente 5 segundos antes de que tu cerebro emocional secuestre tu cerebro racional.\n\n## La Regla de los 5 Segundos\n\n### Segundo 1-2: PARA\nDetén cualquier respuesta verbal o física.\n\n### Segundo 3: RESPIRA\nUna respiración profunda activa el sistema parasimpático.\n\n### Segundo 4-5: NOMBRA\nDi internamente: \"Esto es ira\". Nombrar reduce la intensidad un 50%.\n\n## Técnicas Estoicas Complementarias\n\n### El Marco de Control\n¿Esto está bajo mi control? Sí → Actúa. No → Suéltalo.\n\n### La Vista desde Arriba\nImagina la situación desde 10,000 metros. ¿Lo recordarás en 5 años?",
        cover_image: "/images/blog/blog_control_ira_1767539603270.png",
        published_at: "2025-12-12",
        category_slug: "mentalidad-y-disciplina",
        keywords: ["estoicismo", "control emocional", "ira"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 10,
        slug: "hacer-amigos-hombres-adultos-valores",
        title: "La soledad masculina: Por qué necesitas un \"Círculo de Hierro\" y cómo crearlo",
        excerpt: "La soledad masculina es una epidemia silenciosa. Descubre cómo crear tu grupo de hombres con valores.",
        content: "# El Círculo de Hierro: Combatiendo la Soledad Masculina\n\n1 de cada 5 hombres no tiene un solo amigo cercano.\n\n## ¿Qué es un Círculo de Hierro?\n\nUn grupo pequeño (3-5 hombres) con quienes puedes ser completamente honesto, te desafían a mejorar, y te apoyan sin juzgar.\n\n## Cómo Construirlo\n\n### Paso 1: Define Qué Buscas\n¿Hombres que te empujen a crecer? ¿Que compartan tu pasión?\n\n### Paso 2: Busca en los Lugares Correctos\n- Gimnasios (CrossFit, artes marciales)\n- Grupos de interés\n- Comunidades de desarrollo personal\n\n### Paso 3: Inicia Conversaciones Reales\nDeja de hablar solo de deportes. Pregunta desafíos reales.\n\n### Paso 4: Propón Encuentros Regulares\nLa consistencia crea confianza.",
        cover_image: "/images/blog/blog_circulo_hierro_1767539617845.png",
        published_at: "2025-12-10",
        category_slug: "mentalidad-y-disciplina",
        keywords: ["soledad masculina", "amistad", "círculo de hombres"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 11,
        slug: "rutina-de-noche-para-dormir-mejor-hombres",
        title: "Rutina de noche para dormir mejor: El protocolo para apagar tu cerebro",
        excerpt: "¿Te cuesta dormir? El sueño es tu mayor potenciador de testosterona. Aplica este protocolo de 4 pasos.",
        content: "# El Protocolo Nocturno para Dormir Como un Rey\n\nEl sueño es el potenciador de rendimiento más subestimado.\n\n## El Protocolo de 4 Pasos\n\n### Paso 1: Corte de Pantallas (2 horas antes)\nSin televisión, teléfono, ni laptop. Alternativas: libros, conversación, estiramientos.\n\n### Paso 2: Baja la Temperatura\nHabitación a 18-20°C. Ducha tibia 1 hora antes.\n\n### Paso 3: Descarga Mental\nEscribe TODO lo que tengas en la cabeza. Cierra el cuaderno. Problema transferido al papel.\n\n### Paso 4: Ambiente Perfecto\n- Oscuridad total\n- Silencio o ruido blanco\n- Sin teléfono en la habitación",
        cover_image: "/images/blog/blog_rutina_noche_1767539647735.png",
        published_at: "2025-12-08",
        category_slug: "productividad-y-gestion-del-tiempo",
        keywords: ["dormir mejor", "insomnio", "rutina nocturna"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 12,
        slug: "tecnicas-de-concentracion-para-estudiar-y-trabajar",
        title: "Trabajo Profundo (Deep Work): Cómo lograr en 2 horas lo que antes hacías en 8",
        excerpt: "Aprende la técnica del 'Deep Work'. Elimina la multitarea y duplica tu productividad.",
        content: "# Deep Work: El Superpoder de la Era de la Distracción\n\nLa capacidad de concentrarse sin distracciones es tu ventaja competitiva más valiosa.\n\n## La Fórmula\n\n**Trabajo de Alta Calidad = Tiempo x Intensidad de Enfoque**\n\n2 horas de trabajo profundo > 8 horas de trabajo fragmentado\n\n## El Protocolo Deep Work\n\n### 1. Bloquea el Tiempo\nMínimo 90 minutos. Ideal 2-4 horas. Mañanas para pico cognitivo.\n\n### 2. Prepara el Ambiente\n- Teléfono en modo avión (en otra habitación)\n- Un solo documento abierto\n- Agua y café listos\n\n### 3. Define el Entregable\nNo \"voy a trabajar\". Sí \"voy a terminar el borrador del capítulo 3\".\n\n### 4. Ritual de Cierre\nRevisa lo logrado, define la primera acción para mañana.",
        cover_image: "/images/blog/blog_deep_work_1767539662356.png",
        published_at: "2025-12-06",
        category_slug: "productividad-y-gestion-del-tiempo",
        keywords: ["deep work", "concentración", "productividad"],
        author: { name: "Spartan Admin" }
    },
    {
        id: 13,
        slug: "herramientas-inteligencia-artificial-productividad-trabajo",
        title: "Cómo usar ChatGPT (o IA) para hacer tu trabajo aburrido en la mitad de tiempo",
        excerpt: "La IA no te va a reemplazar, pero un hombre que use IA sí lo hará. Aprende a automatizar tareas.",
        content: "# IA para Hombres Productivos: Guía Práctica\n\nLa IA no es magia. Es una herramienta.\n\n## Lo que SÍ hace bien\n\n- Tareas repetitivas\n- Primeros borradores\n- Resumir información\n- Brainstorming\n\n## 10 Usos Prácticos de ChatGPT\n\n1. **Emails Profesionales**: \"Escribe un email rechazando una propuesta...\"\n2. **Resumir Documentos**: \"Resume los 5 puntos clave...\"\n3. **Preparar Reuniones**: \"Dame 5 preguntas inteligentes para...\"\n4. **Explicar Conceptos**: \"Explícame X como si tuviera 10 años\"\n5. **Crear Plantillas**: \"Crea una plantilla de informe semanal\"\n\n## La Fórmula del Prompt Perfecto\n\n1. **Rol**: \"Eres un experto en X\"\n2. **Contexto**: \"Situación específica\"\n3. **Tarea**: \"Qué necesitas exactamente\"\n4. **Formato**: \"Cómo lo quieres\"\n5. **Restricciones**: \"Qué evitar, longitud, tono\"",
        cover_image: "/images/blog/blog_chatgpt_ia_1767539676624.png",
        published_at: "2025-12-04",
        category_slug: "productividad-y-gestion-del-tiempo",
        keywords: ["ChatGPT", "IA", "productividad"],
        author: { name: "Spartan Admin" }
    }
];

// Helper functions
export function getPostsByCategory(categorySlug: string): BlogPost[] {
    return posts.filter(post => post.category_slug === categorySlug);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return posts.find(post => post.slug === slug);
}

export function getCategoryBySlug(slug: string): BlogCategory | undefined {
    return categories.find(cat => cat.slug === slug);
}

export function getAllPosts(): BlogPost[] {
    return [...posts].sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
}

export function getRecentPosts(limit: number = 5): BlogPost[] {
    return getAllPosts().slice(0, limit);
}
