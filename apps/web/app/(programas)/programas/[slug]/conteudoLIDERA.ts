import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const LIDERA: ConteudoPrograma = {
  sigla: "LIDERA",
  siglaCss: "LIDERA",
  siglaExibida: "LIDERA",
  slug: "lidera",
  nomeCompleto: "Liderança, Direção Estratégica e Resultados na Administração",
  vertical: "gestao-publica",
  verticalRotulo: "NTC Gestão Pública",
  breadcrumb: { current: "LIDERA" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Liderança, Direção Estratégica e Resultados na <em>Administração Pública</em>`,
    sub: "Capacitação executiva para gestores, secretários e lideranças com responsabilidade direta sobre a direção institucional — articulando liderança pública contemporânea, decisão estratégica baseada em evidências e cultura de performance verificável.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=lidera", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=lidera&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Gestão Pública" },
    { rotulo: "Estrutura",     valor: "8 módulos" },
    { rotulo: "Carga horária", valor: "64 horas" },
    { rotulo: "Modalidades",   valor: "Híbrido" },
    { rotulo: "Status",        valor: "Módulos abertos" },
  ],
  navAnchors: [
    { href: "#visao-geral",     rotulo: "Visão geral" },
    { href: "#problema",        rotulo: "Problema" },
    { href: "#publico",         rotulo: "Público" },
    { href: "#eixos",           rotulo: "Eixos" },
    { href: "#modulos",         rotulo: "Módulos" },
    { href: "#resultados",      rotulo: "Resultados" },
    { href: "#docentes",        rotulo: "Corpo docente" },
    { href: "#modalidades",     rotulo: "Modalidades" },
    { href: "#modulos-abertos", rotulo: "Módulos abertos" },
    { href: "#faq",             rotulo: "FAQ" },
  ],
  visaoGeral: {
    eyebrow: "Visão geral",
    titulo: "Um programa estratégico para a direção institucional da Administração Pública brasileira.",
    corpoHtml: `<p class="lede-block">O LIDERA articula liderança pública contemporânea, direção estratégica, governança de resultados e cultura de performance em um arco formativo de 8 módulos e 64 horas, dimensionado para gestores que ocupam — ou são preparados para ocupar — posições de direção na Administração.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a direção institucional — secretários, secretários-adjuntos, superintendentes, diretores e coordenadores de áreas estratégicas — que precisam de <strong>repertório executivo atualizado</strong>, <strong>metodologia aplicada à decisão pública</strong> e <strong>protocolos institucionais</strong> que conversem com a complexidade real da gestão pública brasileira contemporânea.</p>
<p>O LIDERA não é um curso de liderança comportamental nem um programa genérico de gestão. É um programa de direção estratégica aplicada — articulando visão institucional, decisão baseada em evidências, gestão de pessoas, performance e articulação política em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de liderança e direção</strong>, construída pelos próprios participantes para sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    corpoHtml: `<p>A Administração Pública brasileira opera em ambiente de complexidade crescente — multiplicidade de stakeholders, ciclos políticos curtos, pressão social por resultados verificáveis e regulação cada vez mais densa. Cargos de direção exigem hoje uma combinação rara de visão estratégica, capacidade técnica e habilidade institucional.</p>
<p>A maioria das instituições convive simultaneamente com três pressões: rotatividade de quadros estratégicos, decisões cada vez mais complexas com janelas mais curtas e expectativa social por performance mensurável. Programas de capacitação que tratam liderança como tema comportamental abstrato perdem o ponto.</p>
<div class="problem-block">O que está em jogo não é a aquisição de competências genéricas de liderança. <strong>É a arquitetura institucional da direção pública como instrumento de governança</strong> — articulando visão estratégica, decisão baseada em evidências, gestão de pessoas, performance e articulação política em um sistema coerente, defensável e replicável.</div>
<p>O LIDERA responde a essa pressão construindo capacidade institucional avançada: lideranças que dirigem com método, instituições que operam com cultura de performance documentada e quadros estratégicos preparados para sustentar a continuidade institucional para além de ciclos políticos.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O LIDERA é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a direção institucional:</p>
<div class="audience-chips" style="display:flex; gap:10px; flex-wrap:wrap; margin-top: var(--space-2);">
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Secretários e secretários-adjuntos</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Superintendentes e diretores executivos</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Chefes de gabinete</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Coordenadores e gerentes estratégicos</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Cargos de direção e assessoramento (DAS · CC)</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Equipes de planejamento estratégico</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Lideranças em formação na Administração</span>
  <span style="font-family: var(--font-cond); font-weight: 500; font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tinta); background: var(--pergaminho); border: 1px solid var(--prata-30); padding: 8px 14px; border-radius: 22px;">Quadros sucessórios institucionais</span>
</div>`,
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    itens: [
      {
        titulo: "Liderança pública contemporânea",
        descricao: "Fundamentos contemporâneos de liderança aplicada ao setor público, modelos de direção institucional e referenciais consolidados para a tomada de posição em cargos estratégicos.",
      },
      {
        titulo: "Direção estratégica e decisão",
        descricao: "Construção da visão institucional, metodologias de decisão baseada em evidências, planejamento estratégico aplicado e articulação entre direção, áreas técnicas e equipes.",
      },
      {
        titulo: "Performance e cultura de resultados",
        descricao: "Indicadores estratégicos institucionais, painéis de governança de resultados, accountability pública e modelos de monitoramento aplicáveis à Administração.",
      },
      {
        titulo: "Aplicação institucional",
        descricao: "Construção da matriz aplicada de liderança e direção, articulação política e técnica, gestão de pessoas e formação de equipes de alta performance.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    itens: [
      {
        numero: "I",
        titulo: "Liderança pública contemporânea: fundamentos e modelos de direção",
        descricao: "Fundamentos contemporâneos de liderança aplicada à Administração Pública, com leitura crítica de modelos consolidados e referenciais brasileiros e internacionais relevantes para cargos de direção.",
        cargaHoraria: "8h",
      },
      {
        numero: "II",
        titulo: "Direção estratégica e construção da visão institucional",
        descricao: "Construção da visão institucional como instrumento de direção pública — articulando diagnóstico, prioridades e arquitetura de implementação.",
        cargaHoraria: "8h",
      },
      {
        numero: "III",
        titulo: "Decisão baseada em evidências e governança de resultados",
        descricao: "Metodologias de decisão baseada em evidências aplicadas à rotina do cargo de direção — articulando dados, contexto e responsabilidade institucional.",
        cargaHoraria: "8h",
      },
      {
        numero: "IV",
        titulo: "Gestão de pessoas, cultura organizacional e equipes de alta performance",
        descricao: "Construção e direção de equipes de alta performance no setor público, com foco em cultura organizacional, gestão de talentos e formação de quadros sucessórios.",
        cargaHoraria: "8h",
      },
      {
        numero: "V",
        titulo: "Performance institucional: indicadores, painéis e accountability",
        descricao: "Construção de sistemas institucionais de performance — indicadores estratégicos, painéis de governança e accountability aplicáveis à direção pública.",
        cargaHoraria: "8h",
      },
      {
        numero: "VI",
        titulo: "Comunicação estratégica e articulação política-institucional",
        descricao: "Comunicação executiva, posicionamento institucional e articulação com stakeholders relevantes para o exercício do cargo de direção pública.",
        cargaHoraria: "8h",
      },
      {
        numero: "VII",
        titulo: "Liderança em cenários de complexidade e gestão de crises",
        descricao: "Direção em ambientes de complexidade e gestão de crises institucionais — protocolos, decisão sob pressão e proteção da continuidade institucional.",
        cargaHoraria: "8h",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz LIDERA",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de liderança e direção institucional para a sua instituição de origem.",
        cargaHoraria: "8h",
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do LIDERA",
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Capacidade institucional de direção estratégica fortalecida nos quadros de comando.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Tomada de decisão pública estruturada em evidências, dados e responsabilidade institucional.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Cultura de performance e accountability instalada nas áreas estratégicas.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Equipes de alta performance estruturadas e quadros sucessórios mapeados.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores estratégicos da área de direção.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de liderança e direção institucional para a instituição.</p></div>
</div>`,
  },
  docentes: {
    eyebrow: "Autoridade técnica",
    titulo: "Lideranças e especialistas para a alta gestão pública",
    descricaoHtml: `<p class="faculty-prime-intro">O LIDERA articula gestores públicos, especialistas em liderança, governança, estratégia, comunicação, pessoas, inovação e resultados institucionais para apoiar dirigentes e equipes na tomada de decisão e na condução de organizações públicas.</p>
<p>[texto a definir pela equipe editorial]</p>
<p class="faculty-prime-note">A curadoria docente do LIDERA é organizada por competências executivas e pode variar conforme o perfil da turma, os desafios institucionais do órgão contratante e os módulos priorizados, preservando os eixos estruturantes do programa.</p>`,
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    corpoHtml: `<p>O LIDERA é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para órgãos públicos, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do LIDERA — liderança pública, direção estratégica, decisão por evidências, gestão de pessoas, performance, comunicação, gestão de crises e construção da matriz institucional. Certificação consolidada da trilha.</p>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da instituição. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a instituição</h4>
    <p>Programa entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil dos quadros de direção.</p>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do LIDERA",
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>
<p class="prog-events-microcopy">A composição da agenda do LIDERA é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para órgãos públicos ou solução sob medida.</p>`,
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do LIDERA?",
        resposta: "Sim. O LIDERA é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Liderança pública contemporânea) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O LIDERA é indicado para lideranças em formação?",
        resposta: "Sim. O programa é dimensionado tanto para quem já ocupa cargos de direção quanto para quadros em formação — coordenadores e gerentes estratégicos sendo preparados para posições de comando. Para mapeamento sucessório institucional, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O LIDERA pode ser entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade institucional e o perfil dos quadros de direção. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha LIDERA. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
};
