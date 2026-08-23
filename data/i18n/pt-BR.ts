import type { LocaleDictionary } from "@/data/i18n/types"
import { buildRecommendations, type RecommendationTranslationsById } from "@/data/recommendations"

const recommendationTranslations: RecommendationTranslationsById = {
  "valeriia-kruchinina": {
    context: "9 de julho de 2024, Valeriia gerenciou Cleisson diretamente",
    quote: [
      "Fui product manager em um projeto no qual o Cleisson atuou como desenvolvedor front-end, ou eu diria até full-stack.",
      "Fiquei impressionada com a rapidez e eficiência com que ele trabalhava. Ele também estava profundamente envolvido no projeto e propôs soluções que melhoraram significativamente a experiência do usuário. Foi um prazer trabalhar com um profissional tão incrível quanto ele!"
    ]
  },
  "cristian-karsten": {
    context: "17 de julho de 2023, Cristian gerenciou Cleisson diretamente",
    quote: [
      "Fui líder do Cleisson durante um período de em torno de nove meses no setor de pesquisa e desenvolvimento e, de maneira geral, foi um privilégio conhecer e trabalhar com ele. Abraçou desde o início o desafio de desenvolver do zero uma aplicação mobile first, o qual executou com perícia e qualidade muito superior à de outros profissionais que já conheci. Em geral, é um dos desenvolvedores com maior potencial futuro com quem já trabalhei."
    ]
  },
  "gabriel-lobo": {
    context:
      "20 de abril de 2023, Gabriel era sênior ao Cleisson, mas não o gerenciava diretamente",
    quote: [
      "É com satisfação que expresso minha admiração pela competência e comprometimento do Cleisson. Ele demonstra interesse e entusiasmo constantes em compreender os desafios que lhe são apresentados, sendo extremamente proativo e curioso na busca por conhecimento.",
      "Reforço minha recomendação ao Cleisson como um profissional excepcional! Ele se dedica intensamente a cada atividade, sempre buscando entregar resultados de alta qualidade."
    ]
  },
  "andrezza-de-melo-troian": {
    context: "14 de julho de 2023, Andrezza trabalhou com Cleisson no mesmo time",
    quote: [
      "Recomendo o Cleisson como um talentoso desenvolvedor com quem tive o prazer de trabalhar. Atuando na gestão da equipe, pude testemunhar sua habilidade técnica impressionante e compromisso com a excelência. Cleisson foi fundamental para o sucesso dos projetos, contribuindo com sua expertise e colaboração."
    ]
  },
  "matheus-goulart": {
    context: "14 de julho de 2023, Matheus trabalhou com Cleisson no mesmo time",
    quote: [
      "É com grande satisfação que recomendo Cleisson como desenvolvedor React Native. Tive o prazer de trabalhar ao lado dele em vários projetos e sua expertise nessa área é impressionante. Cleisson possui um profundo conhecimento técnico, habilidades sólidas em desenvolvimento e um olhar meticuloso para os detalhes. Sua capacidade de criar aplicações de alta qualidade usando o React Native é notável. Além disso, Cleisson é um membro de equipe extremamente colaborativo, sempre disposto a compartilhar conhecimentos e ajudar os colegas. Recomendo Cleisson sem dúvidas como um desenvolvedor React Native altamente competente."
    ]
  },
  "vinicius-dos-santos-bueno": {
    context: "14 de julho de 2023, Vinicius trabalhou com Cleisson no mesmo time",
    quote: [
      "Trabalhei junto com Cleisson no mesmo programa de estágio e no mesmo setor. Ele sempre se destacou como exemplo de dedicação, responsabilidade e qualidade no desenvolvimento. Foi um prazer trabalhar com Cleisson e eu o recomendo 100%. Sua ética de trabalho, habilidades e colaboração o tornam um profissional de destaque."
    ]
  },
  "luisa-foppa": {
    context: "14 de julho de 2023, Luísa trabalhou com Cleisson no mesmo time",
    quote: [
      "Cleisson é um desenvolvedor excelente e tinha um relacionamento muito bom com todos da equipe em que trabalhei. A comunicação dele é excepcional, e sua organização e dedicação para realizar os projetos são admiráveis. Considerando as qualidades citadas, ele tem muito potencial para ingressar e trazer sucesso para qualquer equipe e projeto."
    ]
  }
}

export const ptBRDictionary: LocaleDictionary = {
  site: {
    shortTitle: "Desenvolvedor de Software Sênior",
    headline:
      "Desenvolvedor de Software Sênior | Especialista em Node.js, Python e AWS | Sistemas Escaláveis | Kubernetes | Design de Sistemas | Construindo Produtos com IA"
  },
  ui: {
    nav: {
      home: "Sobre",
      experience: "Experiência",
      projects: "Projetos",
      blog: "Blog",
      resume: "Currículo"
    },
    cta: {
      contact: "Contato",
      linkedin: "Ver LinkedIn",
      downloadResume: "Baixar currículo em PDF"
    },
    sections: {
      about: "Sobre",
      focusAreas: "Áreas de foco",
      experience: "Experiência",
      projects: "Projetos",
      blog: "Blog"
    },
    labels: {
      locale: "Idioma",
      light: "Claro",
      dark: "Escuro",
      readMore: "Ler mais",
      published: "Publicado",
      updated: "Atualizado",
      period: "Período",
      role: "Função",
      status: "Status",
      stack: "Stack",
      topics: "Tópicos",
      highlights: "Destaques",
      experienceTimelineAria: "Linha do tempo de experiência",
      mainNavigationAria: "Navegação principal",
      backToProjects: "Voltar para projetos",
      backToBlog: "Voltar para o blog",
      notFoundTitle: "Página não encontrada",
      notFoundDescription: "A página solicitada não existe para este idioma.",
      goHome: "Ir para o início",
      opensInNewTab: "abre em uma nova aba"
    }
  },
  content: {
    about: [
      "Desenvolvedor de Software Sênior especializado em desenvolvimento backend, infraestrutura em nuvem e sistemas escaláveis.",
      "Atuo no design e desenvolvimento de software em produção usando Node.js, Python, AWS, Kubernetes e tecnologias modernas cloud-native.",
      "Tenho experiência em arquitetura e evolução de sistemas backend escaláveis, desenvolvimento e operação de infraestrutura em nuvem, criação de APIs e sistemas distribuídos, atuação em startups e ambientes internacionais, além de contribuir ativamente para decisões técnicas e arquitetura.",
      "Sou apaixonado por design de sistemas, performance e software confiável. Fora do trabalho, gosto de explorar novas tecnologias e desenvolver projetos pessoais."
    ],
    focusAreas: [
      "Desenvolvimento de Software",
      "Infraestrutura em Nuvem",
      "Sistemas Distribuídos",
      "Design de Sistemas",
      "Escalabilidade e Performance",
      "AWS",
      "Kubernetes",
      "Node.js",
      "Python",
      "Produtos com IA"
    ],
    experienceTimeline: [
      {
        company: "Productera LLC",
        employment: "Tempo integral",
        location: "Estados Unidos - Remoto",
        roles: [
          {
            title: "Desenvolvedor de Software Sênior - Projeto Encore",
            period: "jul. 2024 - atual",
            bullets: [
              "Migrei um monólito Django para microsserviços usando Kubernetes (EKS) e Python, melhorando escalabilidade e confiabilidade dos deploys.",
              "Desenhei serviços cloud-native aproveitando AWS (RDS, Bedrock, SSM, SQS, EventBridge, EKS).",
              "Migrei a infraestrutura de Terraform e Helm para AWS CDK, padronizando infraestrutura como código.",
              "Construí e mantive pipelines de CI/CD com Octopus Deploy, manifests do Kubernetes e automações em shell.",
              "Arquitetei sistemas orientados a eventos usando SQS e SNS, workers em background e Redis para cache e processamento distribuído.",
              "Desenvolvi recursos com IA, incluindo transcrição de áudio, destaque de conteúdo e transformação de dados.",
              "Integrei provedores de LLM como OpenAI, Perplexity e Anthropic (via Bedrock) para análise, sumarização e automação.",
              "Desenhei arquiteturas escaláveis, defini limites de serviços e liderei o planejamento de implementação.",
              "Colaborei em funcionalidades focadas no usuário, garantindo performance, conformidade e confiabilidade em ambientes de produção."
            ]
          },
          {
            title: "Desenvolvedor de Software - Projeto ThirdEdition",
            period: "mai. 2024 - jul. 2024 (2 meses)",
            bullets: [
              "Esse projeto me proporcionou experiência valiosa em tomada de decisões tecnológicas, planejamento completo de infraestrutura e desenvolvimento front-end.",
              "Planejei e estruturei a infraestrutura do sistema com serviços da AWS.",
              "Utilizei Terraform para gerenciar e controlar a evolução da infraestrutura na AWS.",
              "Desenvolvi toda a estrutura de front-end e conduzi as decisões tecnológicas.",
              "Também contribuí para o desenvolvimento backend."
            ]
          }
        ]
      },
      {
        company: "MeMima.com.br",
        employment: "Tempo integral",
        location: "Brasil - Remoto",
        roles: [
          {
            title: "Desenvolvedor de Software",
            period: "jul. 2023 - fev. 2025 (1 ano e 8 meses)",
            bullets: [
              "A experiência em startup em estágio inicial me ensinou a lançar um produto e impulsionar sua adoção.",
              "Alcancei mais de 2.000 usuários ativos em poucos meses.",
              "Introduzi recursos inovadores para sustentar a evolução contínua do produto.",
              "Liderei o planejamento estratégico e a ideação colaborativa de projetos.",
              "Integrei gateways de pagamento e funcionalidades de chat.",
              "Melhorei o fluxo do usuário e as recomendações com bancos de dados em grafo.",
              "Entreguei uma infraestrutura em nuvem robusta e escalável na AWS.",
              "Utilizei serviços de IA da AWS em fluxos de processamento de fotos, incluindo verificação de idade e reconhecimento facial."
            ]
          }
        ]
      },
      {
        company: "Avanti E-commerce & Digital Marketing",
        employment: "Tempo integral",
        location: "Florianópolis, Santa Catarina, Brasil",
        roles: [
          {
            title: "Desenvolvedor de Software (Remoto)",
            period: "fev. 2024 - mai. 2024 (3 meses)",
            bullets: [
              "Planejei e desenvolvi um aplicativo mobile de e-commerce com React Native e Expo."
            ]
          },
          {
            title: "Desenvolvedor de Software (Remoto)",
            period: "jan. 2023 - jul. 2023 (6 meses)",
            bullets: [
              "Desenvolvi e publiquei aplicativos mobile para grandes marcas.",
              "Desenvolvi e mantive software para mais de 150 usuários, incluindo apps da GOL, Kopenhagen e Intelbras na App Store e na Play Store.",
              "Criei e mantive APIs com Django e Django REST Framework usando PostgreSQL e Heroku.",
              "Integrei Firebase Analytics, VTEX Orders, WordPress e RD Station.",
              "Criei um sistema de notificações com AWS SNS e SES, Celery e Firebase Cloud Messaging."
            ]
          },
          {
            title: "Estagiário de Desenvolvimento de Software (Presencial)",
            period: "ago. 2022 - jan. 2023 (6 meses)",
            bullets: [
              "Atuei no time de pesquisa, desenvolvimento e inovação.",
              "Trabalhei com o framework VTEX para desenvolvimento de e-commerce.",
              "Desenvolvi um aplicativo mobile do zero."
            ]
          }
        ]
      }
    ],
    recommendations: buildRecommendations(recommendationTranslations)
  },
  pages: {
    home: {
      breadcrumbLabel: "Início",
      keywords: [
        "Desenvolvimento de Software",
        "Infraestrutura em Nuvem",
        "Sistemas Distribuídos",
        "Design de Sistemas",
        "Escalabilidade e Performance",
        "AWS",
        "Kubernetes",
        "Node.js",
        "Python",
        "Produtos com IA"
      ]
    },
    about: {
      metadataTitle: "Sobre Cleisson de Oliveira Moura",
      metadataDescription:
        "Perfil profissional de Cleisson de Oliveira Moura, engenheiro de software sênior focado em sistemas backend, infraestrutura em nuvem e produtos escaláveis.",
      lead: "Trajetória, foco técnico e links profissionais verificados de Cleisson de Oliveira Moura.",
      profileHeading: "Perfil profissional",
      focusHeading: "Áreas de especialidade",
      linksHeading: "Perfis e trabalhos verificados"
    },
    contact: {
      metadataTitle: "Contato com Cleisson de Oliveira Moura",
      metadataDescription:
        "Como entrar em contato com Cleisson de Oliveira Moura sobre oportunidades de engenharia de software sênior, colaboração técnica e assuntos profissionais.",
      lead: "Use esta página para uma conversa profissional direta sobre engenharia de software sênior, colaboração ou o conteúdo publicado neste site.",
      sections: [
        {
          heading: "Quando entrar em contato",
          paragraphs: [
            "As conversas mais adequadas são sobre posições de engenharia backend ou full-stack sênior, infraestrutura em nuvem, sistemas distribuídos, design de sistemas, ferramentas para desenvolvedores e produtos com IA. Recrutadores, lideranças de engenharia, fundadores e outros profissionais de software podem escrever quando houver uma vaga, projeto, questão técnica ou colaboração concreta para discutir.",
            "Antes de entrar em contato, consulte a página de experiência para o histórico profissional, a página de projetos para trabalhos públicos de engenharia, o blog para textos técnicos e o currículo localizado para um registro profissional conciso. Essas páginas são a fonte de referência para as informações deste portfólio."
          ]
        },
        {
          heading: "O que incluir",
          paragraphs: [
            "Uma boa primeira mensagem identifica você ou sua organização, explica o motivo do contato e inclui a vaga ou o projeto relevante, prazo, local ou expectativas de trabalho remoto e um link quando fizer sentido. Não envie senhas, tokens de acesso, dados confidenciais de clientes, informações de saúde, documentos oficiais ou outros dados pessoais sensíveis.",
            "O e-mail é o canal direto de contato. O LinkedIn também está disponível para contexto profissional, e o GitHub é o melhor lugar para consultar código público. Este site não possui formulário de contato, agendamento automático, telefone público nem prazo garantido de resposta."
          ]
        }
      ]
    },
    privacy: {
      metadataTitle: "Privacidade",
      metadataDescription:
        "Informações de privacidade do cleisson.com, incluindo cookies, analytics, logs de hospedagem, links externos e contato direto por e-mail.",
      lead: "Este aviso explica as informações limitadas processadas quando você navega no cleisson.com ou entra em contato diretamente com Cleisson de Oliveira Moura.",
      sections: [
        {
          heading: "Informações processadas pelo site",
          paragraphs: [
            "Este portfólio não oferece contas de usuário, comentários, pagamentos, perfis de publicidade ou formulário de contato na web. O site pode processar informações comuns de requisição necessárias para entregar uma página, como endereço IP, detalhes do navegador ou dispositivo, URL solicitada, referência, horários e eventos de diagnóstico ou segurança por meio da infraestrutura de hospedagem. Requisições ao endpoint público do Model Context Protocol (MCP) também podem conter metadados do cliente, nomes de ferramentas ou prompts, idioma, tópicos de busca ou o slug de um projeto. O endpoint usa essas informações apenas para devolver evidências públicas do portfólio; ele não possui banco de contas nem modelo de linguagem no servidor.",
            "Se você optar por enviar um e-mail, a mensagem, os dados do remetente, anexos e demais informações incluídas serão processados pelos serviços de e-mail usados por você e por Cleisson. Envie apenas o necessário para o assunto profissional e evite credenciais confidenciais ou dados pessoais sensíveis."
          ]
        },
        {
          heading: "Cookies, analytics e desempenho",
          paragraphs: [
            "O site usa um cookie de idioma para apoiar a detecção e o roteamento de idioma, e um cookie de tema quando você escolhe o modo claro ou escuro. Cada um pode permanecer por até um ano. Eles atendem ao comportamento solicitado do site, e não à publicidade. Vercel Analytics e Speed Insights estão habilitados para entender uso agregado, entrega de páginas e desempenho; a Vercel pode processar informações técnicas da requisição e do dispositivo sob seus próprios termos.",
            "Provedores de hospedagem e segurança podem manter logs operacionais conforme suas próprias políticas. Este site não vende informações pessoais nem adiciona rastreadores de publicidade de terceiros. Links para LinkedIn, GitHub e outros recursos externos deixam este site e seguem as práticas de privacidade desses serviços."
          ]
        },
        {
          heading: "Dúvidas e escolhas",
          paragraphs: [
            "Você pode limpar os cookies de idioma e tema no navegador, bloquear recursos opcionais no cliente ou consultar o conteúdo renderizado no servidor sem JavaScript. Requisições MCP e seus argumentos limitados podem aparecer em logs comuns de hospedagem, limite de uso, diagnóstico ou segurança; não envie uma descrição confidencial de vaga, credenciais ou dados pessoais sensíveis. Para uma dúvida de privacidade sobre este site ou sobre um e-mail enviado anteriormente, use a página de contato e descreva o pedido sem acrescentar outros dados sensíveis. Este aviso foi atualizado em 23 de agosto de 2026."
          ]
        }
      ]
    },
    mcp: {
      metadataTitle: "MCP de evidências profissionais",
      metadataDescription:
        "Conecte um agente de IA às evidências profissionais públicas, somente leitura e ligadas às fontes de Cleisson de Oliveira Moura pelo Model Context Protocol.",
      eyebrow: "Model Context Protocol",
      lead: "Uma interface pública e somente leitura para agentes consultarem evidências profissionais, distinguirem correspondências textuais de evidência pública ausente e citarem a fonte.",
      endpointHeading: "Conecte seu agente",
      endpointDescription:
        "Use o endpoint abaixo em um cliente MCP compatível com Streamable HTTP remoto. Nenhuma conta ou autenticação é necessária, e o endpoint expõe apenas informações já publicadas neste site.",
      configurationLabel: "Exemplo de configuração MCP remota (o formato varia por cliente)",
      toolsHeading: "Ferramentas disponíveis",
      tools: [
        {
          name: "get_profile",
          description:
            "Retorna um resumo profissional localizado, áreas de foco, a função atual publicada neste site e links verificados."
        },
        {
          name: "find_evidence",
          description:
            "Encontra evidências públicas ligadas às fontes para tópicos concisos, sem gerar uma nota de candidato."
        },
        {
          name: "get_project",
          description:
            "Retorna os fatos publicados e artefatos públicos de um estudo de caso disponível."
        }
      ],
      capabilitiesNote:
        "Os clientes também podem ler recursos Markdown localizados e usar os prompts assess_role_fit e prepare_interview.",
      examplesHeading: "Perguntas para testar",
      examples: [
        "Encontre evidências de Kubernetes, sistemas orientados a eventos e responsabilidade por arquitetura.",
        "Mapeie os requisitos desta vaga para evidências diretas, adjacentes ou públicas ausentes.",
        "Prepare perguntas de entrevista que validem escopo, decisões e impacto em produção."
      ],
      boundariesHeading: "Limites de confiança",
      boundaries: [
        "O MCP é uma fonte de informações do portfólio; ele não é Cleisson e não fala em nome dele.",
        "Os resultados diferenciam declarações do candidato, artefatos verificáveis, textos publicados e recomendações republicadas.",
        "Direta e adjacente descrevem relevância textual, não verificação independente; use evidenceType e os links de fonte para avaliar a procedência.",
        "Nenhuma evidência pública significa apenas que este site não encontrou correspondência; isso não prova ausência de experiência.",
        "Não envie descrições confidenciais de vagas, credenciais ou dados pessoais sensíveis; detalhes limitados da requisição podem aparecer em logs de hospedagem ou segurança.",
        "O servidor não envia e-mails, agenda reuniões, consulta URLs arbitrárias, recebe uploads nem mantém um perfil privado do recrutador."
      ],
      contactLabel: "Falar diretamente com Cleisson"
    },
    experience: {
      metadataTitle: "Experiência",
      metadataDescription:
        "Experiência de engenharia de software com Node.js, Python, AWS, Kubernetes, microsserviços, produtos com IA e infraestrutura em nuvem.",
      lead: "Uma visão detalhada dos times, sistemas e resultados por trás do meu trabalho em engenharia de software.",
      overviewHeading: "Perfil profissional",
      currentRoleLabel: "Função atual",
      focusLabel: "Foco principal",
      statsLabels: {
        recommendations: "Recomendações"
      },
      latestRoleLabel: "Função mais recente",
      opensInNewTabLabel: "abre em uma nova aba",
      timelineHeading: "Experiência Profissional",
      recommendationsHeading: "Recomendações",
      recommendationsLead: "Recomendações recebidas de colegas e lideranças.",
      viewProfileLabel: "Ver perfil no LinkedIn"
    },
    projects: {
      metadataTitle: "Projetos pessoais",
      metadataDescription:
        "Projetos pessoais de software entre infraestrutura do portfólio, ferramentas open source para desenvolvedores e futuros laboratórios de aprendizado.",
      lead: "Projetos pessoais reais que eu construo, mantenho ou uso para aprofundar habilidades de engenharia. Esta página fica focada em trabalhos públicos ou demonstráveis, não em ideias provisórias.",
      filterHeading: "Filtrar por label",
      allLabels: "Todas as labels",
      clearLabels: "Limpar labels",
      noResultsDescription: "Nenhum projeto encontrado para as labels selecionadas.",
      detailsComingSoonLabel: "Detalhes em breve",
      notFoundTitle: "Projeto não encontrado",
      notFoundDescription: "Projeto não encontrado para este idioma.",
      linksHeading: "Links",
      typeHeading: "Tipo",
      stageHeading: "Estágio",
      statusLabels: {
        active: "Ativo",
        archived: "Arquivado"
      },
      typeLabels: {
        product: "Produto",
        "developer-tool": "Ferramenta dev",
        website: "Website",
        "systems-lab": "Lab de sistemas",
        game: "Jogo",
        experiment: "Experimento"
      },
      stageLabels: {
        live: "No ar",
        "in-progress": "Em andamento",
        maintained: "Mantido",
        lab: "Laboratório",
        archived: "Arquivado"
      },
      linkLabels: {
        repo: "Repositório",
        live: "Aplicação",
        caseStudy: "Estudo de caso",
        demo: "Demonstração",
        package: "Pacote"
      }
    },
    blog: {
      metadataTitle: "Blog",
      metadataDescription:
        "Conteúdos sobre desenvolvimento de software backend, infraestrutura em nuvem e arquitetura escalável.",
      lead: "Notas de trabalho em desenvolvimento de software: confiabilidade, infraestrutura, sistemas distribuídos e estratégia de entrega.",
      downloadPdfLabel: "Baixar artigo em PDF",
      notFoundTitle: "Post não encontrado",
      notFoundDescription: "Post não encontrado para este idioma."
    },
    resume: {
      metadataTitle: "Currículo",
      metadataDescription:
        "Visão geral do currículo com download direto em PDF e links de contato.",
      summary:
        "Desenvolvedor de Software Sênior focado em sistemas backend, infraestrutura em nuvem e entrega de produtos escaláveis."
    },
    notFound: {
      metadataTitle: "404",
      metadataDescription: "Rota localizada de página não encontrada."
    }
  },
  snippets: {
    readMoreAboutPrefix: "sobre",
    readingMinutesShort: "min"
  }
}
