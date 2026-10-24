import type { SudokuDictionary } from "./types"

export const sudokuPtBR: SudokuDictionary = {
  summary:
    "Um Sudoku clássico com anotações, desfazer, dicas explicadas e progresso salvo localmente.",
  description:
    "Preencha um tabuleiro 9×9 para que cada linha, coluna e bloco 3×3 contenha os números de 1 a 9. Os desafios são gerados no seu navegador por um motor em Rust e WebAssembly e têm uma única solução.",
  boardLabel: "Tabuleiro de Sudoku",
  difficultyLabel: "Dificuldade",
  difficultyLabels: ["Fácil", "Médio", "Difícil"],
  difficultyNote:
    "Fácil começa com 42 números preenchidos, Médio com 35 e Difícil com 29. O desafio varia de um tabuleiro para outro.",
  elapsedLabel: "Tempo",
  bestTimeLabel: "Melhor tempo sem dicas",
  noBestTime: "Ainda sem recorde",
  statusLabels: {
    loading: "Carregando desafio…",
    playing: "Em jogo",
    paused: "Pausado",
    solved: "Desafio resolvido",
    error: "Não foi possível carregar"
  },
  actions: {
    newGame: "Novo jogo",
    pause: "Pausar",
    resume: "Retomar",
    retry: "Tentar novamente",
    notes: "Anotações",
    undo: "Desfazer",
    clear: "Limpar célula",
    hint: "Explicar uma dica",
    applyHint: "Aplicar dica",
    dismissHint: "Fechar dica",
    fullscreen: "Tela cheia",
    exitFullscreen: "Sair da tela cheia"
  },
  loadingNote:
    "Para jogar, é preciso ter JavaScript e WebAssembly. As regras continuam disponíveis em texto.",
  loadError:
    "Não foi possível carregar o desafio. Tente novamente ou confira se o navegador oferece suporte a WebAssembly.",
  restoredNote:
    "Seu desafio salvo está pausado. Retome quando quiser. O histórico de desfazer recomeça após recarregar a página.",
  storageUnavailable:
    "Este navegador não conseguiu salvar seu progresso. Você pode continuar jogando durante esta visita.",
  replaceTitle: "Substituir este desafio?",
  replaceNote: "Um novo desafio substitui o tabuleiro em andamento e seu progresso salvo.",
  assistedLabel: "Com dicas",
  unassistedLabel: "Sem dicas",
  solvedNote: "Muito bem. Você completou este quebra-cabeça sem dicas.",
  solvedAssistedNote:
    "Desafio concluído. Partidas com dicas não contam para o melhor tempo sem dicas.",
  hintTitle: "Explicação da dica",
  noHint: "Não há uma dica para aplicar. Confira os conflitos destacados ou continue resolvendo.",
  hintMessages: {
    1: "A linha {row}, coluna {column} tem apenas um número possível: {value}. Os outros números já aparecem na linha, coluna ou bloco.",
    2: "Na linha {row}, o número {value} só pode ficar na coluna {column}. Nenhuma outra célula vazia dessa linha permite esse número.",
    3: "Na coluna {column}, o número {value} só pode ficar na linha {row}. Nenhuma outra célula vazia dessa coluna permite esse número.",
    4: "Neste bloco 3×3, o número {value} só pode ficar na linha {row}, coluna {column}.",
    5: "O número na linha {row}, coluna {column} não corresponde à solução do desafio. Limpe a célula para continuar. Esta informação vem da solução e conta como uma dica.",
    6: "Número revelado da solução: linha {row}, coluna {column} contém {value}. Não havia uma dedução simples disponível; esta dica revela um número da solução em vez de explicar uma dedução lógica."
  },
  cellLabel: "Linha {row}, coluna {column}: {value}",
  emptyLabel: "vazia",
  givenLabel: "número inicial",
  conflictLabel: "número em conflito",
  notesLabel: "anotações",
  numberPadLabel: "Teclado numérico",
  inputHint:
    "Selecione uma célula e use o teclado numérico ou as teclas de 1 a 9. As setas movem entre células; Home e End levam às extremidades da linha. Backspace ou Delete limpa a célula. N alterna as anotações; Ctrl/Cmd+Z desfaz. Ao sair do jogo, o cronômetro pausa.",
  storageNote:
    "Seu tabuleiro, anotações, tempo decorrido, uso de dicas e melhores tempos sem dicas ficam neste navegador quando o armazenamento local está disponível. Limpar os dados do site apaga essas informações. Desafios salvos são retomados em pausa; o histórico de desfazer não é salvo.",
  accessibilityNote:
    "O tabuleiro permite navegação por teclado e anuncia coordenadas, números iniciais, números inseridos, anotações e conflitos. Os conflitos também têm uma marca visível. O cronômetro pausa quando o jogo fica oculto ou perde o foco.",
  rulesTitle: "Como jogar Sudoku",
  rules: [
    "Insira os números de 1 a 9 para que cada linha, coluna e bloco 3×3 contenha cada número uma vez. Os números iniciais não podem ser alterados.",
    "Use as anotações para registrar números possíveis em uma célula vazia. As anotações são manuais e não impedem que a partida conte para seu melhor tempo.",
    "Os conflitos destacados indicam números repetidos em uma linha, coluna ou bloco; eles não revelam todos os números incorretos. Desfazer reverte a última mudança de número ou anotação.",
    "Uma dica primeiro explica um passo e depois permite aplicá-lo. Ler uma dica marca a partida como assistida, mesmo se você fechar a explicação ou desfizer a mudança. Apenas desafios concluídos sem dicas contam para o melhor tempo."
  ]
}
