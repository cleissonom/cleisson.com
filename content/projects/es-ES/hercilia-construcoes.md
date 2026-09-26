---
title: Hercília Construções
slug: hercilia-construcoes
summary: Sitio web y catálogo de productos de la tienda de materiales de construcción de mi familia en Picos, mi ciudad natal, con búsqueda, fotos reales de la tienda y solicitudes de presupuesto por WhatsApp.
dateStart: "2026-09-16T12:00:00.000Z"
role: Ingeniero de Software
status: active
type: website
stage: live
tags:
  - Empresa Familiar
  - Comercio Local
  - Catálogo de Productos
  - Mejora Progresiva
  - SEO
stack:
  - HTML
  - CSS
  - JavaScript
  - Node.js
  - JSON-LD
  - Vercel
coverImage: /projects/hercilia-construcoes.png
links:
  live: https://www.herciliaconstrucoes.com
highlights:
  - Construí un catálogo público con 553 registros en 12 categorías y páginas individuales para 550 productos con identificación suficiente.
  - Añadí una lista de materiales que el cliente puede revisar, ajustar y convertir en una solicitud de presupuesto por WhatsApp.
  - Mantuve la navegación, la información de los productos y los contactos disponibles sin JavaScript, con Markdown y JSON para agentes.
---

Hercília Construções es la tienda de materiales de construcción de mi familia en Picos, Piauí, la ciudad donde nací. La tienda lleva más de 30 años atendiendo al barrio Junco. Construí su sitio web para ayudar a las personas a encontrar materiales, conocer la tienda y ponerse en contacto para sus obras y reformas.

## De la consulta a la solicitud de presupuesto

El [catálogo](https://www.herciliaconstrucoes.com/produtos/) organiza los materiales en 12 categorías, como fontanería, electricidad, pinturas y herramientas. Los clientes pueden navegar por las categorías o buscar por nombre, marca o medida. De los 553 registros públicos, 550 tienen páginas individuales; tres siguen disponibles en sus categorías porque su identificación está incompleta.

El cliente puede añadir productos a una lista de materiales, ajustar cantidades y revisar el mensaje antes de abrir WhatsApp. La lista permanece en el navegador cuando el almacenamiento está disponible. Si está bloqueado, un enlace lleva la selección temporal a la página de revisión. Los mensajes largos siguen disponibles para copiarlos completos.

![Catálogo de Hercília Construções con búsqueda, filtros por categoría, tarjetas de productos y botones para añadir materiales a una lista de presupuesto](/images/generated/projects/hercilia-catalog.project-banner.1200.779432a27360.jpeg)

Las capturas muestran el sitio en portugués. La página de inicio usa una foto real de la fachada, y la [galería de la tienda](https://www.herciliaconstrucoes.com/loja/#galeria) reúne diez fotos del local y sus materiales. Estas fotos muestran la tienda; no confirman las existencias actuales de cada producto.

## Decisiones de ingeniería

Usé un proceso de compilación en Node.js para generar HTML a partir de datos estructurados y plantillas, sin dependencias de producción. CSS se encarga del diseño adaptable, mientras que pequeños módulos JavaScript añaden la búsqueda y la lista de presupuesto. Las páginas de productos, la navegación por categorías, los enlaces telefónicos y la información de la tienda funcionan sin JavaScript en el navegador.

Las imágenes se sirven localmente en tamaños adaptables en WebP y JPEG. Los hashes de contenido generan URL versionadas para los archivos estáticos. El sitio también publica datos estructurados, un mapa del sitio, [instrucciones para agentes](https://www.herciliaconstrucoes.com/llms.txt), páginas en Markdown y un [catálogo en JSON](https://www.herciliaconstrucoes.com/catalogo.json), de modo que la información pública está disponible más allá de la interfaz visual.

## Alcance

El sitio facilita consultas: no recibe pagos, confirma existencias, calcula totales de pedidos ni envía mensajes automáticamente. La tienda confirma los precios y la disponibilidad directamente con el cliente. La implementación no tiene cuentas de clientes ni rastreadores. Este caso describe las funcionalidades entregadas, sin atribuirles un crecimiento de ventas medido ni una certificación de accesibilidad.
