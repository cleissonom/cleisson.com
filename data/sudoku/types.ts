export type SudokuDictionary = {
  summary: string
  description: string
  boardLabel: string
  difficultyLabel: string
  difficultyLabels: [string, string, string]
  difficultyNote: string
  elapsedLabel: string
  bestTimeLabel: string
  noBestTime: string
  statusLabels: { loading: string; playing: string; paused: string; solved: string; error: string }
  actions: {
    newGame: string
    pause: string
    resume: string
    retry: string
    notes: string
    undo: string
    clear: string
    hint: string
    applyHint: string
    dismissHint: string
    fullscreen: string
    exitFullscreen: string
  }
  loadingNote: string
  loadError: string
  restoredNote: string
  storageUnavailable: string
  replaceTitle: string
  replaceNote: string
  assistedLabel: string
  unassistedLabel: string
  solvedNote: string
  solvedAssistedNote: string
  hintTitle: string
  noHint: string
  hintMessages: Record<1 | 2 | 3 | 4 | 5 | 6, string>
  cellLabel: string
  emptyLabel: string
  givenLabel: string
  conflictLabel: string
  notesLabel: string
  numberPadLabel: string
  inputHint: string
  storageNote: string
  accessibilityNote: string
  rulesTitle: string
  rules: string[]
}
