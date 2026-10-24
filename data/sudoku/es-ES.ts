import type { SudokuDictionary } from "./types"

export const sudokuEsES: SudokuDictionary = {
  summary:
    "Un Sudoku clásico con notas, deshacer, pistas explicadas y progreso guardado localmente.",
  description:
    "Completa un tablero de 9×9 para que cada fila, columna y bloque de 3×3 contenga los números del 1 al 9. Los rompecabezas se generan en tu navegador con un motor de Rust y WebAssembly y tienen una única solución.",
  boardLabel: "Tablero de Sudoku",
  difficultyLabel: "Dificultad",
  difficultyLabels: ["Fácil", "Medio", "Difícil"],
  difficultyNote:
    "Fácil empieza con 42 números rellenos, Medio con 35 y Difícil con 29. La dificultad de resolución varía entre rompecabezas.",
  elapsedLabel: "Tiempo",
  bestTimeLabel: "Mejor tiempo sin pistas",
  noBestTime: "Aún sin récord",
  statusLabels: {
    loading: "Cargando rompecabezas…",
    playing: "En juego",
    paused: "En pausa",
    solved: "Rompecabezas resuelto",
    error: "No se ha podido cargar"
  },
  actions: {
    newGame: "Nuevo juego",
    pause: "Pausar",
    resume: "Continuar",
    retry: "Reintentar",
    notes: "Notas",
    undo: "Deshacer",
    clear: "Borrar celda",
    hint: "Explicar una pista",
    applyHint: "Aplicar pista",
    dismissHint: "Cerrar pista",
    fullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa"
  },
  loadingNote:
    "Para jugar se necesitan JavaScript y WebAssembly. Las reglas siguen disponibles como texto.",
  loadError:
    "No se ha podido cargar el rompecabezas. Inténtalo de nuevo o comprueba que tu navegador admite WebAssembly.",
  restoredNote:
    "Tu rompecabezas guardado está en pausa. Continúa cuando quieras. El historial de deshacer empieza de nuevo al recargar la página.",
  storageUnavailable:
    "Este navegador no ha podido guardar tu progreso. Puedes seguir jugando durante esta visita.",
  replaceTitle: "¿Sustituir este rompecabezas?",
  replaceNote: "Empezar uno nuevo sustituye el tablero sin terminar y su progreso guardado.",
  assistedLabel: "Con pistas",
  unassistedLabel: "Sin pistas",
  solvedNote: "Bien hecho. Completaste este rompecabezas sin pistas.",
  solvedAssistedNote:
    "Rompecabezas completado. Las partidas con pistas no cuentan para el mejor tiempo sin pistas.",
  hintTitle: "Explicación de la pista",
  noHint: "No hay ninguna pista que aplicar. Revisa los conflictos resaltados o sigue resolviendo.",
  hintMessages: {
    1: "La fila {row}, columna {column} solo tiene un número posible: {value}. Los demás números ya aparecen en su fila, columna o bloque.",
    2: "En la fila {row}, el número {value} solo puede ir en la columna {column}. Ninguna otra celda vacía de esta fila admite ese número.",
    3: "En la columna {column}, el número {value} solo puede ir en la fila {row}. Ninguna otra celda vacía de esta columna admite ese número.",
    4: "En este bloque de 3×3, el número {value} solo puede ir en la fila {row}, columna {column}.",
    5: "El número de la fila {row}, columna {column} no coincide con la solución del rompecabezas. Borra la celda para continuar. Esta información procede de la solución y cuenta como una pista.",
    6: "Número revelado de la solución: la fila {row}, columna {column} contiene {value}. No había una deducción sencilla disponible; esta pista revela un número de la solución en lugar de explicar una deducción lógica."
  },
  cellLabel: "Fila {row}, columna {column}: {value}",
  emptyLabel: "vacía",
  givenLabel: "número inicial",
  conflictLabel: "número en conflicto",
  notesLabel: "notas",
  numberPadLabel: "Teclado numérico",
  inputHint:
    "Selecciona una celda y usa el teclado numérico o las teclas del 1 al 9. Las flechas mueven entre celdas; Inicio y Fin llevan a los extremos de la fila. Retroceso o Suprimir borra la celda. N activa o desactiva las notas; Ctrl/Cmd+Z deshace. Al salir del juego, el cronómetro se pausa.",
  storageNote:
    "Tu tablero, notas, tiempo transcurrido, uso de pistas y mejores tiempos sin pistas se guardan en este navegador cuando el almacenamiento local está disponible. Borrar los datos del sitio elimina esta información. Los rompecabezas guardados se reanudan en pausa; el historial de deshacer no se guarda.",
  accessibilityNote:
    "El tablero permite navegar con el teclado y anuncia coordenadas, números iniciales, números introducidos, notas y conflictos. Los conflictos también tienen una marca visible. El cronómetro se pausa cuando el juego se oculta o pierde el foco.",
  rulesTitle: "Cómo jugar al Sudoku",
  rules: [
    "Introduce los números del 1 al 9 para que cada fila, columna y bloque de 3×3 contenga cada número una vez. Los números iniciales no se pueden cambiar.",
    "Usa las notas para apuntar números posibles en una celda vacía. Las notas son manuales y no impiden que la partida cuente para tu mejor tiempo.",
    "Los conflictos resaltados indican números repetidos en una fila, columna o bloque; no revelan todos los números incorrectos. Deshacer revierte el último cambio de número o nota.",
    "Una pista primero explica un paso y después permite aplicarlo. Leer una pista marca la partida como asistida, aunque cierres la explicación o deshagas el cambio. Solo los rompecabezas completados sin pistas cuentan para el mejor tiempo."
  ]
}
