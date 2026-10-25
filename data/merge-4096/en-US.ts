import type { Merge4096Dictionary } from "./types"

export const merge4096EnUS: Merge4096Dictionary = {
  summary: "Slide colorful number tiles, combine equal pairs, and work toward 4096.",
  description:
    "A 4×4 number puzzle powered by Rust and WebAssembly. Slide the board in four directions, combine equal tiles, and keep playing after reaching 4096.",
  boardLabel: "4096 board",
  scoreLabel: "Score",
  bestScoreLabel: "Best score",
  movesLabel: "Moves",
  directionLabels: ["← Left", "↑ Up", "Right →", "↓ Down"],
  controlsLabel: "Move tiles",
  actions: {
    newGame: "New game",
    continue: "Keep playing",
    retry: "Try again",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen"
  },
  statusLabels: {
    loading: "Loading game…",
    playing: "Playing",
    won: "Congratulations! You reached 4096!",
    over: "No moves left",
    error: "Unable to load"
  },
  loadingNote:
    "Playing requires JavaScript and WebAssembly. The rules and controls remain available as text.",
  loadError: "The game could not load. Try again or check that your browser supports WebAssembly.",
  wonNote: "You made a 4096 tile. Keep playing to try for larger tiles, or start a new game.",
  overNote:
    "The board is full and no neighboring tiles can combine. Start a new game when you are ready.",
  replaceTitle: "Start a new game?",
  replaceNote:
    "This replaces your unfinished board and its saved progress. Your best score is kept.",
  storageUnavailable:
    "This browser could not save your progress or best score. You can keep playing during this visit.",
  inputHint:
    "Focus the board to use arrow keys or WASD. On a phone, swipe across the board or use the direction buttons. Each swipe makes one move. Fullscreen is available on phones and laptops.",
  storageNote:
    "Your board and best score stay in this browser when local storage is available. Clearing site data removes them. Nothing is sent to a game server.",
  accessibilityNote:
    "Each grid cell exposes its position and number as text. Keyboard controls work only while the board is focused; direction buttons provide the same moves. The score and game status are announced after a move. The victory animation respects reduced-motion settings.",
  cellLabel: "Row {row}, column {column}: {value}",
  emptyLabel: "empty",
  rulesTitle: "How to play 4096",
  rules: [
    "Slide every tile left, up, right, or down. Equal neighboring tiles combine into a tile worth their sum; a newly combined tile cannot combine again during the same move.",
    "Each changed move adds a new 2 or 4 tile to an empty cell. A move that leaves the board unchanged adds no tile and does not increase the move count.",
    "Combining tiles adds their new value to your score. Reach 4096 to meet the goal, then choose whether to keep playing.",
    "The game ends when the board is full and no horizontal or vertical neighbors can combine. Starting a new game keeps your best score."
  ]
}
