export type Merge4096Dictionary = {
  summary: string
  description: string
  boardLabel: string
  scoreLabel: string
  bestScoreLabel: string
  movesLabel: string
  directionLabels: [string, string, string, string]
  controlsLabel: string
  actions: {
    newGame: string
    continue: string
    retry: string
    fullscreen: string
    exitFullscreen: string
  }
  statusLabels: { loading: string; playing: string; won: string; over: string; error: string }
  loadingNote: string
  loadError: string
  wonNote: string
  overNote: string
  replaceTitle: string
  replaceNote: string
  storageUnavailable: string
  inputHint: string
  storageNote: string
  accessibilityNote: string
  cellLabel: string
  emptyLabel: string
  rulesTitle: string
  rules: string[]
}
