import type { LocaleDictionary } from "@/data/i18n/types"
import { buildRecommendations, type RecommendationTranslationsById } from "@/data/recommendations"

const recommendationTranslations: RecommendationTranslationsById = {
  "valeriia-kruchinina": {
    context: "9 de julio de 2024, Valeriia gestionó directamente a Cleisson",
    quote: [
      "Fui product manager en un proyecto en el que Cleisson trabajó como desarrollador front-end, o incluso diría full-stack.",
      "Me impresionó lo rápido y eficientemente que trabajaba. También estuvo muy involucrado en el proyecto y propuso soluciones que mejoraron significativamente la experiencia de usuario. Fue un placer trabajar con un profesional tan increíble como él."
    ]
  },
  "cristian-karsten": {
    context: "17 de julio de 2023, Cristian gestionó directamente a Cleisson",
    quote: [
      "Fui líder de Cleisson durante un período de alrededor de nueve meses en el área de investigación y desarrollo y, en general, fue un privilegio conocerlo y trabajar con él. Desde el inicio asumió el desafío de desarrollar desde cero una aplicación mobile first, que ejecutó con pericia y una calidad muy superior a la de otros profesionales que ya he conocido. En general, es uno de los desarrolladores con mayor potencial de futuro con los que he trabajado."
    ]
  },
  "gabriel-lobo": {
    context:
      "20 de abril de 2023, Gabriel era senior de Cleisson, pero no lo gestionaba directamente",
    quote: [
      "Con satisfacción expreso mi admiración por la competencia y el compromiso de Cleisson. Muestra un interés y entusiasmo constantes por comprender los desafíos que se le presentan, siendo extremadamente proactivo y curioso en la búsqueda de conocimiento.",
      "Reafirmo mi recomendación de Cleisson como un profesional excepcional. Se dedica intensamente a cada actividad, siempre con el objetivo de entregar resultados de alta calidad."
    ]
  },
  "andrezza-de-melo-troian": {
    context: "14 de julio de 2023, Andrezza trabajó con Cleisson en el mismo equipo",
    quote: [
      "Recomiendo a Cleisson como un talentoso desarrollador con quien tuve el placer de trabajar. Al participar en la gestión del equipo, pude comprobar su impresionante habilidad técnica y su compromiso con la excelencia. Cleisson fue fundamental para el éxito de los proyectos, aportando su experiencia y colaboración."
    ]
  },
  "matheus-goulart": {
    context: "14 de julio de 2023, Matheus trabajó con Cleisson en el mismo equipo",
    quote: [
      "Con gran satisfacción recomiendo a Cleisson como desarrollador React Native. Tuve el placer de trabajar junto a él en varios proyectos y su experiencia en esta área es impresionante. Cleisson tiene un profundo conocimiento técnico, habilidades sólidas de desarrollo y una atención meticulosa a los detalles. Su capacidad para crear aplicaciones de alta calidad con React Native es notable. Además, Cleisson es un miembro de equipo extremadamente colaborativo, siempre dispuesto a compartir conocimientos y ayudar a sus colegas. Recomiendo a Cleisson sin dudas como un desarrollador React Native altamente competente."
    ]
  },
  "vinicius-dos-santos-bueno": {
    context: "14 de julio de 2023, Vinicius trabajó con Cleisson en el mismo equipo",
    quote: [
      "Trabajé junto con Cleisson en el mismo programa de prácticas y en el mismo sector. Siempre se destacó como ejemplo de dedicación, responsabilidad y calidad en el desarrollo. Fue un placer trabajar con Cleisson y lo recomiendo al 100%. Su ética de trabajo, habilidades y colaboración lo convierten en un profesional destacado."
    ]
  },
  "luisa-foppa": {
    context: "14 de julio de 2023, Luísa trabajó con Cleisson en el mismo equipo",
    quote: [
      "Cleisson es un excelente desarrollador y tenía una muy buena relación con todos los integrantes del equipo en el que trabajé. Su comunicación es excepcional y su organización y dedicación para llevar adelante los proyectos son admirables. Considerando estas cualidades, tiene mucho potencial para integrarse y aportar éxito a cualquier equipo y proyecto."
    ]
  }
}

export const esESDictionary: LocaleDictionary = {
  site: {
    shortTitle: "Ingeniero de Software Senior",
    headline:
      "Ingeniero de Software Senior | Especialista en Node.js, Python y AWS | Sistemas escalables | Kubernetes | Diseño de sistemas | Construyendo productos con IA"
  },
  ui: {
    nav: {
      home: "Sobre mí",
      experience: "Experiencia",
      projects: "Proyectos",
      blog: "Blog",
      resume: "Currículum"
    },
    cta: {
      contact: "Contacto",
      linkedin: "Ver LinkedIn",
      downloadResume: "Descargar currículum en PDF"
    },
    sections: {
      about: "Sobre mí",
      focusAreas: "Áreas de enfoque",
      experience: "Experiencia",
      projects: "Proyectos",
      blog: "Blog"
    },
    labels: {
      locale: "Idioma",
      light: "Claro",
      dark: "Oscuro",
      readMore: "Leer más",
      published: "Publicado",
      updated: "Actualizado",
      period: "Período",
      role: "Rol",
      status: "Estado",
      stack: "Stack",
      topics: "Temas",
      highlights: "Aspectos clave",
      experienceTimelineAria: "Línea de tiempo de experiencia",
      mainNavigationAria: "Navegación principal",
      backToProjects: "Volver a proyectos",
      backToBlog: "Volver al blog",
      notFoundTitle: "Página no encontrada",
      notFoundDescription: "La página solicitada no existe para este idioma.",
      goHome: "Ir al inicio",
      opensInNewTab: "se abre en una nueva pestaña"
    }
  },
  content: {
    about: [
      "Ingeniero de Software Senior especializado en desarrollo backend, infraestructura en la nube y sistemas escalables.",
      "Trabajo en el diseño y la construcción de software en producción con Node.js, Python, AWS, Kubernetes y tecnologías cloud-native modernas.",
      "Mi experiencia incluye diseñar sistemas backend escalables, construir infraestructura cloud, desarrollar APIs y sistemas distribuidos, y contribuir a decisiones de arquitectura en startups y entornos internacionales.",
      "Me apasionan el diseño de sistemas, el rendimiento y el software confiable. Fuera del trabajo, exploro nuevas tecnologías y desarrollo proyectos personales."
    ],
    focusAreas: [
      "Ingeniería backend",
      "Infraestructura en la nube",
      "Sistemas distribuidos",
      "Diseño de sistemas",
      "Escalabilidad y rendimiento",
      "AWS",
      "Kubernetes",
      "Node.js",
      "Python",
      "Productos impulsados por IA"
    ],
    experienceTimeline: [
      {
        company: "Productera LLC",
        employment: "Tiempo completo",
        location: "Estados Unidos - Remoto",
        roles: [
          {
            title: "Ingeniero de Software Senior - Proyecto Encore",
            period: "jul. 2024 - actual",
            bullets: [
              "Migré un monolito en Django a microservicios usando Kubernetes (EKS) y Python, mejorando la escalabilidad y la confiabilidad del despliegue.",
              "Diseñé servicios cloud-native aprovechando AWS (RDS, Bedrock, SSM, SQS, EventBridge, EKS).",
              "Migré la infraestructura de Terraform y Helm a AWS CDK, estandarizando la infraestructura como código.",
              "Construí y mantuve pipelines de CI/CD con Octopus Deploy, manifiestos de Kubernetes y automatización en shell.",
              "Arquitecté sistemas orientados a eventos usando SQS y SNS, workers en segundo plano y Redis para caché y procesamiento distribuido.",
              "Desarrollé funcionalidades impulsadas por IA, incluyendo transcripción de audio, resaltado de contenido y transformación de datos.",
              "Integré proveedores de LLM como OpenAI, Perplexity y Anthropic (vía Bedrock) para análisis, resumen y automatización.",
              "Diseñé arquitecturas escalables, definí límites de servicios y lideré la planificación de la implementación.",
              "Colaboré en funcionalidades centradas en el usuario, asegurando rendimiento, cumplimiento y confiabilidad en entornos de producción."
            ]
          },
          {
            title: "Ingeniero de Software - Proyecto ThirdEdition",
            period: "may. 2024 - jul. 2024 (2 meses)",
            bullets: [
              "Este proyecto me dio una experiencia valiosa en toma de decisiones tecnológicas, planificación integral de infraestructura del sistema y desarrollo frontend.",
              "Planifiqué y estructuré la infraestructura del sistema con servicios de AWS.",
              "Utilicé Terraform para gestionar y controlar la evolución de la infraestructura en AWS.",
              "Desarrollé toda la estructura de frontend y tomé todas las decisiones tecnológicas.",
              "También contribuí al desarrollo backend."
            ]
          }
        ]
      },
      {
        company: "MeMima.com.br",
        employment: "Tiempo completo",
        location: "Brasil - Remoto",
        roles: [
          {
            title: "Ingeniero de Software",
            period: "jul. 2023 - feb. 2025 (1 año y 8 meses)",
            bullets: [
              "La experiencia en una startup en etapa temprana me enseñó a lanzar un producto e impulsar su adopción.",
              "Alcancé más de 2.000 usuarios activos en pocos meses.",
              "Introduje funcionalidades innovadoras para asegurar el desarrollo continuo del producto.",
              "Lideré la planificación estratégica y la ideación colaborativa de proyectos.",
              "Integré pasarelas de pago y funcionalidades de chat.",
              "Mejoré el flujo de usuario y las recomendaciones mediante bases de datos de grafos.",
              "Entregué una infraestructura en la nube robusta y escalable en AWS.",
              "Aproveché servicios de IA de AWS para flujos de procesamiento de fotos, incluyendo verificación de edad y reconocimiento facial."
            ]
          }
        ]
      },
      {
        company: "Avanti E-commerce & Digital Marketing",
        employment: "Tiempo completo",
        location: "Florianópolis, Santa Catarina, Brasil",
        roles: [
          {
            title: "Ingeniero de Software (Remoto)",
            period: "feb. 2024 - may. 2024 (3 meses)",
            bullets: [
              "Planifiqué y desarrollé una aplicación móvil de comercio electrónico construida con React Native y Expo."
            ]
          },
          {
            title: "Ingeniero de Software (Remoto)",
            period: "ene. 2023 - jul. 2023 (6 meses)",
            bullets: [
              "Desarrollé y publiqué aplicaciones móviles para grandes marcas.",
              "Desarrollé y mantuve software para más de 150 usuarios, incluyendo aplicaciones para GOL, Kopenhagen e Intelbras en App Store y Play Store.",
              "Construí y mantuve APIs con Django y Django REST Framework usando PostgreSQL y Heroku.",
              "Integré Firebase Analytics, VTEX Orders, WordPress y RD Station.",
              "Creé un sistema de notificaciones con AWS SNS y SES, Celery y Firebase Cloud Messaging."
            ]
          },
          {
            title: "Ingeniero de Software en Prácticas (Presencial)",
            period: "ago. 2022 - ene. 2023 (6 meses)",
            bullets: [
              "Me incorporé al equipo de investigación, desarrollo e innovación.",
              "Trabajé con el framework VTEX para desarrollo de comercio electrónico.",
              "Desarrollé una aplicación móvil desde cero."
            ]
          }
        ]
      }
    ],
    recommendations: buildRecommendations(recommendationTranslations)
  },
  pages: {
    home: {
      breadcrumbLabel: "Inicio",
      keywords: [
        "Ingeniería backend",
        "Infraestructura en la nube",
        "Sistemas distribuidos",
        "Diseño de sistemas",
        "Escalabilidad y rendimiento",
        "AWS",
        "Kubernetes",
        "Node.js",
        "Python",
        "Productos impulsados por IA"
      ]
    },
    about: {
      metadataTitle: "Sobre Cleisson de Oliveira Moura",
      metadataDescription:
        "Perfil profesional de Cleisson de Oliveira Moura, ingeniero de software senior enfocado en sistemas backend, infraestructura cloud y productos escalables.",
      lead: "Trayectoria, enfoque técnico y enlaces profesionales verificados de Cleisson de Oliveira Moura.",
      profileHeading: "Perfil profesional",
      focusHeading: "Áreas de especialidad",
      linksHeading: "Perfiles y trabajos verificados"
    },
    contact: {
      metadataTitle: "Contacto con Cleisson de Oliveira Moura",
      metadataDescription:
        "Cómo contactar a Cleisson de Oliveira Moura sobre oportunidades de ingeniería de software senior, colaboración técnica y consultas profesionales.",
      lead: "Utiliza esta página para una consulta profesional directa sobre ingeniería de software senior, colaboración o el contenido publicado en este sitio.",
      sections: [
        {
          heading: "Cuándo contactar",
          paragraphs: [
            "Las conversaciones más adecuadas son sobre puestos de ingeniería backend o full-stack senior, infraestructura cloud, sistemas distribuidos, diseño de sistemas, herramientas para desarrolladores y productos con IA. Reclutadores, líderes de ingeniería, fundadores y otros profesionales de software pueden escribir cuando exista un puesto, proyecto, pregunta técnica o colaboración concreta para tratar.",
            "Antes de contactar, consulta la página de experiencia para conocer el historial laboral, la página de proyectos para ver trabajos públicos de ingeniería, el blog para leer contenido técnico y el currículum localizado para obtener un registro profesional conciso. Esas páginas son la fuente de referencia para las afirmaciones de este portafolio."
          ]
        },
        {
          heading: "Qué incluir",
          paragraphs: [
            "Un primer mensaje útil te identifica a ti o a tu organización, explica el motivo del contacto e incluye el puesto o proyecto relevante, el plazo, la ubicación o expectativas de trabajo remoto y un enlace cuando corresponda. No envíes contraseñas, tokens de acceso, datos confidenciales de clientes, información médica, identificadores oficiales ni otros datos personales sensibles.",
            "El correo electrónico es el canal de contacto directo. LinkedIn también está disponible para aportar contexto profesional, y GitHub es el mejor lugar para revisar código público. Este sitio no tiene formulario de contacto, sistema automático de reservas, teléfono público ni un plazo de respuesta garantizado."
          ]
        }
      ]
    },
    privacy: {
      metadataTitle: "Privacidad",
      metadataDescription:
        "Información de privacidad de cleisson.com, incluidos cookies, analítica, registros de alojamiento, enlaces externos y contacto directo por correo.",
      lead: "Este aviso explica la información limitada que se procesa cuando navegas por cleisson.com o contactas directamente con Cleisson de Oliveira Moura.",
      sections: [
        {
          heading: "Información que procesa el sitio",
          paragraphs: [
            "Este portafolio no ofrece cuentas de usuario, comentarios, pagos, perfiles publicitarios ni un formulario web de contacto. El sitio puede procesar información común de las solicitudes necesaria para entregar una página, como la dirección IP, detalles del navegador o dispositivo, URL solicitada, referencia, marcas de tiempo y eventos de diagnóstico o seguridad mediante su infraestructura de alojamiento. Las solicitudes a la API REST pública o al endpoint de Model Context Protocol (MCP) también pueden contener metadatos del cliente, nombres de operaciones, herramientas o prompts, idioma, temas de búsqueda o el slug de un proyecto. Estos endpoints usan la información únicamente para operar y proteger estas interfaces de solo lectura y devolver evidencia pública del portafolio; no tienen una base de datos de cuentas ni un modelo de lenguaje en el servidor.",
            "Si decides enviar un correo, el mensaje, los datos del remitente, los archivos adjuntos y cualquier información incluida serán procesados por los servicios de correo utilizados por ti y por Cleisson. Envía únicamente lo necesario para la consulta profesional y evita credenciales confidenciales o datos personales sensibles."
          ]
        },
        {
          heading: "Cookies, analítica y rendimiento",
          paragraphs: [
            "El sitio utiliza una cookie de idioma para apoyar la detección y el enrutamiento del idioma, y una cookie de tema cuando seleccionas el modo claro u oscuro. Cada una puede permanecer hasta un año. Sirven al comportamiento solicitado del sitio y no a la publicidad. Vercel Analytics y Speed Insights están habilitados para comprender el uso agregado, la entrega de páginas y el rendimiento; Vercel puede procesar información técnica de solicitudes y dispositivos bajo sus propios términos.",
            "Los proveedores de alojamiento y seguridad pueden conservar registros operativos de acuerdo con sus propias políticas. Este sitio no vende información personal ni incorpora rastreadores publicitarios de terceros. Los enlaces a LinkedIn, GitHub y otros recursos externos salen de este sitio y se rigen por las prácticas de privacidad de esos servicios."
          ]
        },
        {
          heading: "Preguntas y opciones",
          paragraphs: [
            "Puedes borrar las cookies de idioma y tema en tu navegador, bloquear funciones opcionales del cliente o consultar el contenido renderizado por el servidor sin JavaScript. Las solicitudes a la API REST y a MCP, con sus argumentos limitados, pueden aparecer en registros ordinarios de alojamiento, límites de uso, diagnóstico o seguridad; no envíes una descripción confidencial de un puesto, credenciales ni datos personales sensibles. Para una pregunta de privacidad sobre este sitio o sobre un correo que enviaste anteriormente, utiliza la página de contacto y describe la solicitud sin añadir más información sensible. Este aviso se actualizó el 23 de agosto de 2026."
          ]
        }
      ]
    },
    mcp: {
      metadataTitle: "MCP de evidencia profesional",
      metadataDescription:
        "Conecta un agente de IA con la evidencia profesional pública, de solo lectura y vinculada a fuentes de Cleisson de Oliveira Moura mediante Model Context Protocol.",
      eyebrow: "Model Context Protocol",
      lead: "Una interfaz pública y de solo lectura para que los agentes consulten evidencia profesional, distingan coincidencias textuales de la evidencia pública ausente y citen la fuente.",
      documentationLabel: "Documentación de la API pública y MCP",
      apiHeading: "API REST pública",
      apiDescription:
        "La API versionada ofrece el perfil localizado de Cleisson, evidencia por tema y detalles de proyectos publicados como JSON estructurado.",
      openApiLabel: "Abrir la especificación OpenAPI",
      authenticationDescription:
        "No se requiere autenticación. La API es pública y de solo lectura; no envíes credenciales, descripciones confidenciales de puestos ni datos personales sensibles.",
      endpointsHeading: "Endpoints REST",
      apiExamplesHeading: "Ejemplos de solicitudes a la API",
      errorsHeading: "Errores estructurados de la API",
      errorsDescription:
        "Los errores usan application/problem+json e incluyen un código estable, una explicación comprensible y una sugerencia para resolver el problema.",
      discoveryLabel: "Verificar el descubrimiento MCP en tiempo de ejecución",
      endpointHeading: "Conecta tu agente",
      endpointDescription:
        "Usa el endpoint siguiente con un cliente MCP compatible con Streamable HTTP remoto. No se requiere cuenta ni autenticación, y el endpoint solo expone información ya publicada en este sitio.",
      configurationLabel: "Ejemplo de configuración MCP remota (el formato varía según el cliente)",
      toolsHeading: "Herramientas disponibles",
      tools: [
        {
          name: "get_profile",
          description:
            "Devuelve un resumen profesional localizado, áreas de enfoque, el rol actual publicado en este sitio y enlaces verificados."
        },
        {
          name: "find_evidence",
          description:
            "Encuentra evidencia pública vinculada a fuentes para temas concisos sin generar una puntuación de candidato."
        },
        {
          name: "get_project",
          description:
            "Devuelve los hechos publicados y artefactos públicos de un caso de estudio disponible."
        }
      ],
      capabilitiesNote:
        "Los clientes también pueden leer recursos Markdown localizados y usar los prompts assess_role_fit y prepare_interview.",
      examplesHeading: "Preguntas para probar",
      examples: [
        "Encuentra evidencia de Kubernetes, sistemas basados en eventos y responsabilidad de arquitectura.",
        "Mapea los requisitos de este puesto con evidencia directa, adyacente o pública ausente.",
        "Prepara preguntas de entrevista que validen alcance, decisiones e impacto en producción."
      ],
      boundariesHeading: "Límites de confianza",
      boundaries: [
        "El MCP es una fuente de información del portafolio; no es Cleisson ni habla en su nombre.",
        "Los resultados diferencian declaraciones del candidato, artefactos inspeccionables, textos publicados y testimonios republicados.",
        "Directa y adyacente describen relevancia textual, no verificación independiente; usa evidenceType y los enlaces de origen para evaluar la procedencia.",
        "Sin evidencia pública solo significa que este sitio no encontró una coincidencia; no demuestra ausencia de experiencia.",
        "No envíes descripciones confidenciales de puestos, credenciales ni datos personales sensibles; detalles limitados de la solicitud pueden aparecer en registros de alojamiento o seguridad.",
        "El servidor no envía correos, reserva reuniones, consulta URLs arbitrarias, acepta archivos ni conserva un perfil privado del reclutador."
      ],
      contactLabel: "Contactar directamente con Cleisson"
    },
    experience: {
      metadataTitle: "Experiencia",
      metadataDescription:
        "Experiencia en ingeniería de software con Node.js, Python, AWS, Kubernetes, microservicios, productos con IA e infraestructura cloud.",
      lead: "Una vista detallada de los equipos, sistemas y resultados detrás de mi trabajo en ingeniería de software.",
      overviewHeading: "Perfil profesional",
      currentRoleLabel: "Rol actual",
      focusLabel: "Enfoque principal",
      statsLabels: {
        recommendations: "Recomendaciones"
      },
      latestRoleLabel: "Rol más reciente",
      opensInNewTabLabel: "se abre en una nueva pestaña",
      timelineHeading: "Experiencia Profesional",
      recommendationsHeading: "Recomendaciones",
      recommendationsLead: "Recomendaciones recibidas de colegas y lideres.",
      viewProfileLabel: "Ver perfil de LinkedIn"
    },
    projects: {
      metadataTitle: "Proyectos personales",
      metadataDescription:
        "Proyectos personales de software entre infraestructura del portafolio, herramientas open source para desarrolladores y futuros laboratorios de aprendizaje.",
      lead: "Proyectos personales reales que construyo, mantengo o uso para profundizar habilidades de ingeniería. Esta página se enfoca en trabajo público o demostrable, no en ideas provisionales.",
      filterHeading: "Filtrar por etiqueta",
      allLabels: "Todas las etiquetas",
      clearLabels: "Borrar etiquetas",
      noResultsDescription: "No se encontraron proyectos para las etiquetas seleccionadas.",
      detailsComingSoonLabel: "Detalles próximamente",
      notFoundTitle: "Proyecto no encontrado",
      notFoundDescription: "No se encontró el proyecto para este idioma.",
      linksHeading: "Enlaces",
      typeHeading: "Tipo",
      stageHeading: "Etapa",
      statusLabels: {
        active: "Activo",
        archived: "Archivado"
      },
      typeLabels: {
        product: "Producto",
        "developer-tool": "Herramienta dev",
        website: "Sitio web",
        "systems-lab": "Lab de sistemas",
        game: "Juego",
        experiment: "Experimento"
      },
      stageLabels: {
        live: "En vivo",
        "in-progress": "En progreso",
        maintained: "Mantenido",
        lab: "Laboratorio",
        archived: "Archivado"
      },
      linkLabels: {
        repo: "Repositorio",
        live: "Aplicación",
        caseStudy: "Caso de estudio",
        demo: "Demostración",
        package: "Paquete"
      }
    },
    blog: {
      metadataTitle: "Blog",
      metadataDescription:
        "Publicaciones sobre ingeniería backend, infraestructura cloud y arquitectura escalable.",
      lead: "Notas de trabajo en ingeniería de producción: fiabilidad, infraestructura, sistemas distribuidos y estrategia de entrega.",
      downloadPdfLabel: "Descargar artículo en PDF",
      notFoundTitle: "Publicación no encontrada",
      notFoundDescription: "No se encontró la publicación para este idioma."
    },
    resume: {
      metadataTitle: "Currículum",
      metadataDescription:
        "Resumen del currículum con descarga directa en PDF y enlaces de contacto.",
      summary:
        "Ingeniero de Software Senior enfocado en sistemas backend, infraestructura en la nube y entrega de productos escalables."
    },
    notFound: {
      metadataTitle: "404",
      metadataDescription: "Ruta localizada de página no encontrada."
    }
  },
  snippets: {
    readMoreAboutPrefix: "sobre",
    readingMinutesShort: "min"
  }
}
