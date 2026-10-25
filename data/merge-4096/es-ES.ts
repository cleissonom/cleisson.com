import type { Merge4096Dictionary } from "./types"

export const merge4096EsES: Merge4096Dictionary = {
  summary: "Desliza fichas de colores con números, combina pares iguales e intenta llegar a 4096.",
  description:
    "Un rompecabezas numérico de 4×4 con un motor en Rust y WebAssembly. Desliza el tablero en cuatro direcciones, combina fichas iguales y sigue jugando después de llegar a 4096.",
  boardLabel: "Tablero de 4096",
  scoreLabel: "Puntos",
  bestScoreLabel: "Récord",
  movesLabel: "Jugadas",
  directionLabels: ["← Izquierda", "↑ Arriba", "Derecha →", "↓ Abajo"],
  controlsLabel: "Mover fichas",
  actions: {
    newGame: "Nueva partida",
    continue: "Continuar",
    retry: "Reintentar",
    fullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa"
  },
  statusLabels: {
    loading: "Cargando juego…",
    playing: "En juego",
    won: "¡Llegaste a 4096!",
    over: "No quedan movimientos",
    error: "No se ha podido cargar"
  },
  loadingNote:
    "Para jugar se necesitan JavaScript y WebAssembly. Las reglas y los controles siguen disponibles como texto.",
  loadError:
    "No se ha podido cargar el juego. Inténtalo de nuevo o comprueba que tu navegador admite WebAssembly.",
  wonNote:
    "Has creado una ficha 4096. Sigue jugando para intentar números mayores o empieza una nueva partida.",
  overNote:
    "El tablero está lleno y ninguna ficha vecina se puede combinar. Empieza una nueva partida cuando quieras.",
  replaceTitle: "¿Empezar una nueva partida?",
  replaceNote:
    "La partida sin terminar y su progreso guardado se sustituirán. Tu récord se mantiene.",
  storageUnavailable:
    "Este navegador no ha podido guardar tu progreso o récord. Puedes seguir jugando durante esta visita.",
  inputHint:
    "Selecciona el tablero para usar las flechas o WASD. En el móvil, desliza el dedo sobre el tablero o usa los botones de dirección. Cada gesto hace una jugada. La pantalla completa está disponible en el móvil y en el ordenador.",
  storageNote:
    "Tu tablero y récord se guardan en este navegador cuando el almacenamiento local está disponible. Borrar los datos del sitio elimina esta información. No se envía nada a un servidor de juego.",
  accessibilityNote:
    "Cada celda del tablero informa de su posición y su número como texto. Los atajos de teclado funcionan solo cuando el tablero está seleccionado; los botones de dirección hacen las mismas jugadas. La puntuación y el estado del juego se anuncian después de una jugada.",
  cellLabel: "Fila {row}, columna {column}: {value}",
  emptyLabel: "vacía",
  rulesTitle: "Cómo jugar a 4096",
  rules: [
    "Desliza todas las fichas a la izquierda, arriba, a la derecha o abajo. Las fichas vecinas iguales se combinan en una ficha con la suma de sus valores; una ficha recién combinada no se puede volver a combinar en la misma jugada.",
    "Cada jugada que cambia el tablero añade una ficha 2 o 4 a una celda vacía. Una jugada que deja el tablero igual no añade fichas ni aumenta el contador de jugadas.",
    "Combinar fichas suma su nuevo valor a tu puntuación. Llega a 4096 para alcanzar el objetivo y después elige si quieres seguir jugando.",
    "La partida termina cuando el tablero está lleno y ninguna ficha vecina en horizontal o vertical se puede combinar. Empezar una nueva partida mantiene tu récord."
  ]
}
