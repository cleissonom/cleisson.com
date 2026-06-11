---
title: "Planejamento de Implementação vs. Desenvolvimento: Um Modelo Mental ao Qual Sempre Volto"
slug: implementation-planning-vs-developing
summary: "Uma reflexão prática sobre como o planejamento de implementação pode reduzir esforço de desenvolvimento, sem fingir que o gráfico é um modelo científico."
date: 2026-06-09
updatedAt: 2026-06-11
tags:
  - Desenvolvimento de Software
  - Planejamento
  - Engenharia
coverImage: /images/blog/implementation-planning-vs-desenvolvimento.pt-BR.png
coverAlt: "Gráfico de linha mostrando o esforço esperado de desenvolvimento diminuindo conforme o esforço de planejamento de implementação aumenta"
pdfUrl: /downloads/blog/implementation-planning-vs-desenvolvimento.pt-BR.pdf
lang: pt-BR
---

Isto não é um estudo. Não é um benchmark. E definitivamente não sou eu tentando fingir que um gráfico consegue explicar toda decisão de engenharia.

É apenas um modelo mental ao qual eu volto com frequência depois de trabalhar em funcionalidades, refatorações, integrações, migrações e mudanças maiores em que o desafio real não era apenas escrever o código, mas entender o que aquele código estava prestes a tocar.

A ideia ficou mais clara para mim depois de uma mudança na forma como nosso time começou a organizar alguns trabalhos. No projeto em que atuo, passamos a criar tarefas específicas para **planos de implementação** antes de iniciar as tarefas reais de desenvolvimento. Em alguns casos, a tarefa de desenvolvimento só era criada, refinada ou quebrada corretamente depois que a tarefa de planejamento de implementação terminava.

No começo, essa separação me pareceu um pouco incomum. Uma parte do meu cérebro queria ir direto para o código, porque é ali que as coisas parecem concretas. Mas depois de ver esse processo acontecer algumas vezes, comecei a entender o valor de tratar o plano como uma peça própria de trabalho. Não como burocracia. Não como cerimônia. Mais como uma pausa para entender o terreno antes de se comprometer com uma rota.

Quando digo **Planejamento de Implementação**, quero dizer o trabalho que acontece antes da construção prática: entender o impacto, verificar fronteiras do sistema, pensar na estrutura, ler código existente, identificar padrões, listar casos de teste e expor os passos manuais chatos, mas importantes, que podem surpreender o time depois.

Quando digo **Desenvolvimento**, quero dizer a parte prática: escrever código, ajustar testes, revisar, integrar, depurar, fazer deploy e lidar com as coisas que só ficam visíveis quando a mudança começa a existir.

A forma como eu imagino essa relação se parece com isto:

![Planejamento de Implementação vs. Desenvolvimento - curva de retornos decrescentes](/images/blog/implementation-planning-vs-desenvolvimento.pt-BR.svg)

Os números não são o ponto. Eles são unidades relativas e ilustrativas. O formato da curva é a parte útil.

## A ideia simples

Quanto mais planejamento de implementação útil fazemos, menos esforço desnecessário de desenvolvimento normalmente criamos depois.

Não menos esforço de desenvolvimento no sentido de que programar fica magicamente fácil. Não fica.

Mas menos esforço desperdiçado em confusão evitável.

Menos retrabalho causado por uma regra de negócio escondida. Menos idas e vindas porque a propriedade de um fluxo não estava clara. Menos descoberta tardia de um detalhe de integração. Menos _"ah, isso também afeta aquele outro serviço"_. Menos tentativa de adivinhar enquanto já estamos dentro da implementação.

É aí que o planejamento ajuda muito.

Um bom plano de implementação não é um contrato com o futuro. Ele se parece mais com um mapa. Não remove toda surpresa do caminho, mas ajuda o time a evitar andar em círculos.

## Por que uma tarefa separada de planejamento pode ajudar

Uma coisa que gosto em ter uma tarefa dedicada de planejamento de implementação é que ela dá ao time permissão para desacelerar pelo motivo certo.

Sem esse passo explícito, o planejamento costuma acontecer em fragmentos: um comentário rápido aqui, uma conversa no Slack ali, uma pequena investigação durante o desenvolvimento e alguns detalhes importantes descobertos só depois que o trabalho já começou. Às vezes isso é suficiente. Mas, para mudanças maiores, essas descobertas espalhadas podem ficar caras sem fazer barulho.

Uma tarefa separada de planejamento cria um pequeno contêiner para as incertezas. Dá ao engenheiro tempo para ler o código, fazer perguntas, checar premissas e transformar uma tarefa vaga de desenvolvimento em algo sobre o qual o time consegue raciocinar.

Às vezes o resultado não é um documento enorme. Pode ser um plano curto, uma lista de áreas afetadas, uma sequência proposta de implementação ou alguns riscos que precisam de alinhamento. O valor não está em produzir um plano bonito. O valor está em tornar a próxima tarefa menos cega.

Nesse sentido, a tarefa de desenvolvimento que vem depois do plano costuma nascer melhor definida. Ela tem limites mais claros, expectativas de teste melhores, menos passos manuais escondidos e uma compreensão mais honesta do que pode dar errado.

## O que o planejamento está tentando descobrir

Para mim, a parte mais valiosa do planejamento não é criar um documento longo. É forçar as perguntas certas a aparecerem antes que o custo de mudar de direção fique alto demais.

Uma funcionalidade ou uma mudança técnica grande normalmente carrega mais contexto do que o ticket mostra. Existem fronteiras de sistema, regras de negócio, decisões legadas, padrões de código, compromissos históricos, detalhes de rollout e, às vezes, algumas áreas do tipo _"não mexa nisso a menos que você saiba o motivo"_.

O planejamento de implementação é o momento em que tento trazer esses detalhes para mais perto da superfície.

Coisas como:

- Quais sistemas, módulos, jobs, eventos ou APIs serão afetados?
- Qual é a estrutura proposta de implementação?
- Quais padrões de código existentes devem guiar a solução?
- Quais padrões provavelmente devem ser evitados?
- Quais regras de negócio ou comportamentos legados podem mudar a direção do trabalho?
- Quais casos de teste precisam ser cobertos?
- Quais casos de borda são fáceis de esquecer?
- Quais passos manuais estão envolvidos?
- Existem scripts, migrações, backfills, feature flags, mudanças de configuração ou etapas de rollout?
- O que precisa ser verificado depois do release?
- O que pode ser automatizado e o que ainda precisa de verificação humana?

Quanto mais complexo o sistema, mais esses detalhes importam.

Em uma base de código limpa e isolada, talvez o plano possa ser muito pequeno. Mas em um produto real, com história, dependências, lógica legada, regras específicas do negócio e decisões técnicas anteriores, o planejamento de implementação passa a ser menos sobre _escrever um plano_ e mais sobre reduzir a quantidade de surpresas caras.

## Por que a primeira parte da curva cai rápido

No começo, o planejamento costuma ter um retorno alto.

Mesmo uma conversa curta, uma pequena nota de design ou uma exploração rápida do código pode remover uma quantidade surpreendente de incerteza.

Às vezes uma hora de planejamento economiza muitas horas de desenvolvimento porque impede o time de começar na direção errada.

Essa é a parte íngreme da curva.

O time descobre que um fluxo já existe. Ou que um campo tem um significado escondido. Ou que uma dependência se comporta de forma diferente em produção. Ou que uma mudança parecida causou problemas antes. Ou que a implementação pode ser muito mais simples se seguir um padrão existente.

Esse é o tipo de planejamento que parece valioso imediatamente. Ele transforma _"vamos começar a codar e ver o que acontece"_ em _"conhecemos o caminho principal, os riscos principais e as primeiras decisões"_.

## Por que a curva eventualmente achata

Mas planejamento tem limites.

Em algum ponto, mais planejamento ainda ajuda, mas o ganho fica menor. Essa é a parte em que a curva achata.

Existem alguns motivos para isso.

Primeiro, desenvolvimento nunca chega a zero. Mesmo com um ótimo plano, alguém ainda precisa escrever o código, testá-lo, revisá-lo, integrá-lo, fazer deploy e corrigir as coisas que só aparecem quando o sistema é exercitado.

Segundo, algumas incertezas não são removíveis antecipadamente. Algumas perguntas só se tornam reais quando o código encontra o sistema existente. Você pode ler, inspecionar e discutir bastante, mas às vezes a resposta honesta é: precisamos construir uma parte pequena e validar.

Terceiro, planejamento demais pode começar a dar ao time uma falsa sensação de certeza. O documento fica maior, mas o risco não necessariamente diminui no mesmo ritmo.

Por isso, não vejo planejamento como algo a maximizar.

Vejo como algo a calibrar.

## Uma pequena equação para o modelo mental

Gosto desta equação como uma forma simples de representar a ideia:

```text
Desenvolvimento(P) = D_min + (D0 - D_min) * e^(-kP)
```

Onde:

- `P` é o esforço de planejamento de implementação
- `Desenvolvimento(P)` é o esforço esperado de desenvolvimento
- `D0` é o esforço de desenvolvimento quando o planejamento está perto de zero
- `D_min` é o mínimo prático de esforço de desenvolvimento
- `k` é o quanto o planejamento reduz incerteza e retrabalho

Esta não é uma fórmula que eu usaria para estimar uma sprint real.

Eu não colocaria esses números em uma planilha fingindo que são precisos.

A equação só é útil porque captura o formato da intuição: o planejamento reduz o esforço de desenvolvimento rapidamente no início, e depois o retorno fica menor com o tempo.

## As duas armadilhas

A primeira armadilha é planejar de menos.

Isso acontece quando o time começa a desenvolver antes de entender o suficiente sobre impacto, dependências, estrutura, testes, rollout e restrições específicas do sistema. O planejamento que faltou não desaparece. Ele se desloca para a fase de desenvolvimento, onde vira interrupções, retrabalho e descobertas de última hora.

A segunda armadilha é planejar demais.

Isso acontece quando o time tenta responder todas as perguntas possíveis antes de construir qualquer coisa. O plano fica mais longo, mas o time nem sempre fica proporcionalmente mais seguro. Às vezes o próximo passo útil de aprendizado não é mais uma reunião ou mais um diagrama. É um pequeno spike de implementação, um teste ou a validação de uma premissa no código.

As duas armadilhas são compreensíveis.

Planejar de menos costuma vir da pressão para se mover rápido. Planejar demais costuma vir do desejo de evitar erros.

Já fiz os dois. A maioria dos times provavelmente também.

A parte difícil é encontrar o meio.

## Como "planejamento suficiente" se parece

Para mim, planejamento suficiente normalmente se parece com isto:

O time entende o caminho principal. As áreas de risco estão visíveis. A estrutura de implementação não é um mistério. Os padrões de código são conhecidos. A estratégia de testes está clara o bastante. Os passos manuais estão listados. O rollout não depende de esperança. As incertezas que continuam existindo são aceitáveis e intencionais.

Essa última parte importa: aceitáveis e intencionais.

Um bom plano não elimina toda incerteza. Ele torna as incertezas restantes explícitas o suficiente para que o time decida carregá-las para o desenvolvimento.

Essa sensação é muito diferente de descobri-las por acidente depois.

## Minha conclusão atual

Planejamento de implementação é uma forma de mover a incerteza para mais cedo, quando geralmente é mais barato discutir, questionar e ajustar.

Ele ajuda o desenvolvimento a ficar mais focado, mas tem retornos decrescentes. O objetivo não é criar o plano mais completo possível. O objetivo é criar clareza suficiente para construir com confiança.

Para mim, o ponto ideal fica em algum lugar entre caos e teatro.

Não _"vamos só codar e descobrir no caminho"_.

Não _"vamos planejar até que nada pareça incerto"_.

Mais como:

_"Vamos entender o suficiente para tomar as próximas decisões com responsabilidade, e então deixar a implementação nos ensinar o resto."_

Esse é o equilíbrio que ainda estou tentando melhorar.
