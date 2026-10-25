import type { Merge4096Dictionary } from "./types"

export const merge4096PtBR: Merge4096Dictionary = {
  summary: "Deslize peças coloridas com números, combine pares iguais e tente chegar a 4096.",
  description:
    "Um quebra-cabeça numérico 4×4 com motor em Rust e WebAssembly. Deslize o tabuleiro em quatro direções, combine peças iguais e continue jogando depois de chegar a 4096.",
  boardLabel: "Tabuleiro de 4096",
  scoreLabel: "Pontos",
  bestScoreLabel: "Recorde",
  movesLabel: "Jogadas",
  directionLabels: ["← Esquerda", "↑ Cima", "Direita →", "↓ Baixo"],
  controlsLabel: "Mover peças",
  actions: {
    newGame: "Nova partida",
    continue: "Continuar",
    retry: "Tentar novamente",
    fullscreen: "Tela cheia",
    exitFullscreen: "Sair da tela cheia"
  },
  statusLabels: {
    loading: "Carregando jogo…",
    playing: "Em jogo",
    won: "Parabéns! Você chegou a 4096!",
    over: "Sem jogadas possíveis",
    error: "Não foi possível carregar"
  },
  loadingNote:
    "Para jogar, é preciso ter JavaScript e WebAssembly. As regras e os controles continuam disponíveis em texto.",
  loadError:
    "Não foi possível carregar o jogo. Tente novamente ou confira se o navegador oferece suporte a WebAssembly.",
  wonNote:
    "Você criou uma peça 4096. Continue jogando para tentar números maiores ou comece uma nova partida.",
  overNote:
    "O tabuleiro está cheio e nenhuma peça vizinha pode ser combinada. Comece uma nova partida quando quiser.",
  replaceTitle: "Começar uma nova partida?",
  replaceNote:
    "A partida em andamento e seu progresso salvo serão substituídos. Seu recorde será mantido.",
  storageUnavailable:
    "Este navegador não conseguiu salvar seu progresso ou recorde. Você pode continuar jogando durante esta visita.",
  inputHint:
    "Selecione o tabuleiro para usar as setas ou WASD. No celular, deslize o dedo sobre o tabuleiro ou use os botões de direção. Cada gesto faz uma jogada. A tela cheia está disponível no celular e no computador.",
  storageNote:
    "Seu tabuleiro e recorde ficam neste navegador quando o armazenamento local está disponível. Limpar os dados do site apaga essas informações. Nada é enviado a um servidor de jogo.",
  accessibilityNote:
    "Cada célula do tabuleiro informa sua posição e seu número em texto. Os atalhos de teclado funcionam apenas quando o tabuleiro está selecionado; os botões de direção fazem as mesmas jogadas. A pontuação e o estado do jogo são anunciados após uma jogada. A animação de vitória respeita a preferência por movimento reduzido.",
  cellLabel: "Linha {row}, coluna {column}: {value}",
  emptyLabel: "vazia",
  rulesTitle: "Como jogar 4096",
  rules: [
    "Deslize todas as peças para a esquerda, para cima, para a direita ou para baixo. Peças vizinhas iguais se combinam em uma peça com a soma de seus valores; uma peça recém-combinada não pode se combinar de novo na mesma jogada.",
    "Cada jogada que muda o tabuleiro adiciona uma peça 2 ou 4 a uma célula vazia. Uma jogada que não muda o tabuleiro não adiciona peças nem aumenta o contador de jogadas.",
    "Combinar peças soma o novo valor à sua pontuação. Chegue a 4096 para atingir o objetivo e depois escolha se quer continuar jogando.",
    "A partida termina quando o tabuleiro está cheio e nenhuma peça vizinha na horizontal ou vertical pode ser combinada. Começar uma nova partida mantém seu recorde."
  ]
}
