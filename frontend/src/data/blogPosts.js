export const blogPosts = [
  {
    id: 'intro',
    title: 'Bem-vindo ao Blog do FutStats',
    excerpt:
      'Aqui vou publicar análises rápidas, novidades do projeto, mudanças nas métricas e notícias relevantes do futebol.',
    content:
      'Bem-vindo ao Blog do FutStats.\n\n' +
      'Este espaço vai reunir notícias, atualizações do projeto e conteúdos rápidos para te ajudar a interpretar melhor as estatísticas e probabilidades.\n\n' +
      'Em breve vou publicar também mudanças de funcionalidades, notas de release e análises de jogos e ligas.',
    date: '2026-01-10',
    category: 'Atualizações',
  },
  {
    id: 'over-btts',
    title: 'Over 2.5 e BTTS: como interpretar e quando usar',
    excerpt:
      'Entenda os mercados Mais de 2.5 gols (Over 2.5) e Ambos marcam (BTTS), como ler as probabilidades e o que observar antes de apostar.',
    content:
      'Dois dos mercados mais populares no futebol são o Over 2.5 (mais de 2,5 gols) e o BTTS (Both Teams To Score / Ambos marcam).\n\n' +
      'Over 2.5 significa que o jogo termina com 3 ou mais gols somados (ex.: 2x1, 3x0, 2x2). BTTS significa que os dois times marcam pelo menos um gol (ex.: 1x1, 2x1, 2x2).\n\n' +
      'Como usar as probabilidades do FutStats: trate a porcentagem como uma estimativa baseada no histórico recente. Quanto maior a amostra de jogos com placar, maior a confiança.\n\n' +
      'Antes de decidir, vale checar: estilo de jogo, fase, ausências (lesões/suspensões) e contexto do calendário. Estatística ajuda, mas não substitui o cenário real do jogo.',
    date: '2026-01-14',
    category: 'Guia',
  },
  {
    id: 'probabilidade-implicita',
    title: 'Probabilidade implícita: o que a odd “está dizendo”',
    excerpt:
      'Aprenda a transformar odds em probabilidade implícita e entender por que isso é essencial para falar de “valor”.',
    content:
      'Odds decimais podem ser convertidas em uma probabilidade aproximada. Essa probabilidade é chamada de “probabilidade implícita” — é o que o mercado está precificando.\n\n' +
      'Regra prática: probabilidade implícita ≈ 100 / odd. Ex.: odd 2.00 ≈ 50%; odd 1.50 ≈ 66,7%; odd 3.00 ≈ 33,3%.\n\n' +
      'Onde entra o “valor”? Se a sua estimativa (ou a do FutStats) for maior do que a probabilidade implícita, pode haver um descompasso a seu favor. Isso não garante acerto, mas melhora a lógica de longo prazo.\n\n' +
      'Importante: casas aplicam margem (overround), então a soma das probabilidades implícitas do mercado costuma passar de 100%. Use a implícita como referência, não como verdade absoluta.',
    date: '2026-01-14',
    category: 'Conceitos',
  },
  {
    id: 'como-usar-futstats',
    title: 'Como usar o FutStats para filtrar jogos do dia (passo a passo)',
    excerpt:
      'Um fluxo simples para achar partidas prioritárias com base em probabilidades e contexto, sem perder tempo.',
    content:
      'O objetivo do FutStats é te ajudar a priorizar jogos. Um fluxo simples:\n\n' +
      '1) Comece em “Probabilidades do Dia” e ordene do maior para o menor.\n\n' +
      '2) Abra as partidas que estão no topo e confira o bloco “Por que essa probabilidade?” — amostra e taxas de cada time.\n\n' +
      '3) Se a amostra estiver baixa, trate a estimativa com mais cautela.\n\n' +
      '4) Use a “Metodologia” para entender o que está por trás do número e como ele se relaciona com odds (quando disponíveis).\n\n' +
      'Com isso você reduz ruído e foca em poucos jogos com melhor base estatística.',
    date: '2026-01-14',
    category: 'Guia',
  },
  {
    id: 'probabilidades',
    title: 'Como interpretamos as probabilidades do dia',
    excerpt:
      'Uma visão geral de como as probabilidades são calculadas e como usar a página de Probabilidades para encontrar bons jogos.',
    content:
      'As probabilidades do dia são um resumo do que os números indicam para os jogos disponíveis.\n\n' +
      'Na prática, o objetivo é facilitar a comparação entre partidas (por exemplo, mercados como Over 2.5 e BTTS) para você priorizar os jogos com maior expectativa estatística.\n\n' +
      'Dica: use a ordenação na página de Probabilidades para navegar rapidamente entre as melhores oportunidades do dia.',
    date: '2026-01-12',
    category: 'Guia',
  },
  {
    id: 'noticias',
    title: 'Notícias e mudanças: o que esperar esta semana',
    excerpt:
      'Resumo das principais alterações planejadas e novidades que podem impactar as análises.',
    content:
      'Nesta semana, o foco é melhorar a experiência de leitura e navegação.\n\n' +
      'Também vamos revisar alguns indicadores e organizar melhor as telas para você encontrar informações importantes mais rápido.\n\n' +
      'Se tiver sugestões de melhorias, me mande — elas ajudam a priorizar o roadmap.',
    date: '2026-01-13',
    category: 'Notícias',
  },
];
