import type { SudokuDictionary } from "./types"

export const sudokuEnUS: SudokuDictionary = {
  summary: "A classic Sudoku with pencil notes, undo, explained hints, and saved local progress.",
  description:
    "Fill a 9×9 grid so each row, column, and 3×3 box contains the digits 1–9. Puzzles are generated in your browser by a Rust and WebAssembly engine and have one solution.",
  boardLabel: "Sudoku board",
  difficultyLabel: "Difficulty",
  difficultyLabels: ["Easy", "Medium", "Hard"],
  difficultyNote:
    "Easy starts with 42 clues, Medium 35, and Hard 29. The solving challenge varies between puzzles.",
  elapsedLabel: "Time",
  bestTimeLabel: "Best unassisted time",
  noBestTime: "No record yet",
  statusLabels: {
    loading: "Loading puzzle…",
    playing: "Playing",
    paused: "Paused",
    solved: "Puzzle solved",
    error: "Unable to load"
  },
  actions: {
    newGame: "New puzzle",
    pause: "Pause",
    resume: "Resume",
    retry: "Try again",
    notes: "Pencil notes",
    undo: "Undo",
    clear: "Clear cell",
    hint: "Explain a hint",
    applyHint: "Apply hint",
    dismissHint: "Close hint",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen"
  },
  loadingNote: "Playing requires JavaScript and WebAssembly. The rules remain available as text.",
  loadError:
    "The puzzle could not load. Try again or check that your browser supports WebAssembly.",
  restoredNote:
    "Your saved puzzle is paused. Resume when you are ready. Undo history starts fresh after reloading.",
  storageUnavailable:
    "This browser could not save your progress. You can keep playing during this visit.",
  replaceTitle: "Replace this puzzle?",
  replaceNote: "Starting a new puzzle replaces your unfinished puzzle and its saved progress.",
  assistedLabel: "Hints used",
  unassistedLabel: "No hints used",
  solvedNote: "Well done. You completed this puzzle without hints.",
  solvedAssistedNote:
    "Puzzle completed. Games with hints do not count toward your best unassisted time.",
  hintTitle: "Hint explanation",
  noHint: "There is no hint to apply. Check any highlighted conflicts or continue solving.",
  hintMessages: {
    1: "Row {row}, column {column} has only one possible digit: {value}. Its other digits are already used in the row, column, or box.",
    2: "In row {row}, {value} can go only in column {column}. No other empty cell in this row allows it.",
    3: "In column {column}, {value} can go only in row {row}. No other empty cell in this column allows it.",
    4: "In this 3×3 box, {value} can go only in row {row}, column {column}.",
    5: "The entry in row {row}, column {column} does not match the puzzle's solution. Clear it to continue. This uses solution information and counts as a hint.",
    6: "Solution reveal: row {row}, column {column} contains {value}. A simple single was not available; this reveals a digit from the solution rather than explaining a logical deduction."
  },
  cellLabel: "Row {row}, column {column}: {value}",
  emptyLabel: "empty",
  givenLabel: "given clue",
  conflictLabel: "conflicting entry",
  notesLabel: "notes",
  numberPadLabel: "Number pad",
  inputHint:
    "Select a cell, then use the number pad or keys 1–9. Arrows move between cells; Home and End move to a row's edges. Backspace or Delete clears a cell. N toggles pencil notes; Ctrl/Cmd+Z undoes. Leaving the game pauses the timer.",
  storageNote:
    "Your puzzle, pencil notes, elapsed time, hint use, and best unassisted times stay in this browser when local storage is available. Clearing site data removes them. Saved puzzles resume paused; undo history is not saved.",
  accessibilityNote:
    "The grid supports keyboard navigation and announces coordinates, clues, entries, notes, and conflicts. Conflicts also have a visible mark. The timer pauses when the game is hidden or loses focus.",
  rulesTitle: "How to play Sudoku",
  rules: [
    "Enter digits 1–9 so every row, column, and 3×3 box contains each digit once. The original clues cannot be changed.",
    "Use pencil notes to record possible digits in an empty cell. Notes are manual and do not affect your best time eligibility.",
    "Highlighted conflicts show repeated digits in a row, column, or box; they do not reveal every incorrect entry. Undo reverses your latest entry or note change.",
    "A hint first explains a step, then lets you apply it. Reading a hint marks the puzzle as assisted, even if you close it or undo the change. Only completed puzzles without hints qualify for a best time."
  ]
}
