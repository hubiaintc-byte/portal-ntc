/**
 * Textos institucionais padrão da proposta (seções 17 a 23 do modelo aprovado,
 * `docs/prototipos/proposta-modelo-v1.html`), transcritos literalmente e
 * interpolados com os dados do cliente. Módulo puro: sem I/O.
 *
 * Formato do texto devolvido (puro, sem HTML):
 * - parágrafos separados por uma linha em branco (`\n\n`);
 * - uma linha começando com `## ` marca um subtítulo (h3 do modelo) — hoje só
 *   em `certificacaoReplay`. A conversão para Lexical é de outra camada.
 *
 * Fora do texto, por serem mobília fixa do documento: a citação de fecho da
 * seção 23 e a formatação inline (negrito) do modelo.
 */

export interface ContextoTextosProposta {
  clienteOrgao: string;
  clienteSigla: string;
  programaSigla: string;
  modalidade: string;
  replay: string;
  numModulos: number;
}

export type ChaveTextoInstitucional =
  | "eventon"
  | "certificacaoReplay"
  | "cancelamento"
  | "protecaoConteudo"
  | "fundamentacaoLegal"
  | "proximosPassos"
  | "fechamento";

function paragrafos(...linhas: string[]): string {
  return linhas.join("\n\n");
}

export function textosPadraoProposta(
  c: ContextoTextosProposta,
): Record<ChaveTextoInstitucional, string> {
  return {
    eventon: paragrafos(
      "A participação no evento online ao vivo observará as condições institucionais, operacionais, comerciais e jurídicas estabelecidas nesta proposta, bem como as orientações complementares encaminhadas pela Coordenação de Eventos do Instituto NTC.",
      "O evento será realizado em ambiente virtual do Instituto NTC, por meio da plataforma EventON NTC, com transmissão ao vivo, acesso individual dos participantes regularmente inscritos, suporte operacional e disponibilização dos recursos previstos na proposta.",
      `Após a formalização da inscrição ou contratação, a ${c.clienteSigla} deverá encaminhar ao Instituto NTC a relação oficial dos participantes autorizados, contendo nome completo, e-mail individual e telefone de contato.`,
      "O acesso ao ambiente virtual, links, credenciais, materiais, gravações, replays ou quaisquer recursos disponibilizados pelo Instituto NTC é pessoal, individual e intransferível. Cada participante deverá utilizar e-mail próprio, válido e acessível.",
      "Para melhor aproveitamento da experiência formativa, recomenda-se conexão estável à internet, equipamento em boas condições e navegador atualizado, preferencialmente Google Chrome.",
      "É expressamente proibida, sem autorização prévia e formal do Instituto NTC, a gravação, captação, reprodução, edição, distribuição, transmissão, compartilhamento, publicação, comercialização ou disponibilização total ou parcial dos conteúdos.",
    ),
    certificacaoReplay: paragrafos(
      "## Certificação",
      `A emissão de certificado pelo Instituto NTC observará os critérios institucionais definidos para cada módulo-evento, podendo considerar presença, acesso à plataforma, participação e cumprimento de requisitos mínimos. Os certificados serão emitidos de forma nominal, com identificação do participante, nome da atividade, carga horária de cada módulo, período de realização e demais elementos de registro. A certificação total do combo formativo contemplará a carga horária somada dos ${c.numModulos} módulos contratados.`,
      "## Replay Institucional Ampliado",
      `Para a presente proposta, foi pactuado replay institucional ampliado de ${c.replay} após cada módulo-evento — condição negociada especificamente para ${c.clienteSigla}, superando o padrão institucional de 7 dias dos eventos abertos. O replay constitui facilidade adicional oferecida ao participante regularmente inscrito, sendo pessoal, individual, temporário e intransferível.`,
    ),
    cancelamento: paragrafos(
      "A solicitação de cancelamento ou substituição de participante deverá ser formalizada por escrito, por meio dos canais oficiais indicados na proposta ou informados pela Coordenação de Eventos do Instituto NTC, preferencialmente até 2 dias úteis antes da realização da atividade.",
      "A substituição estará condicionada ao envio completo dos dados do novo participante e à possibilidade operacional de atualização do cadastro, emissão de credenciais e adequação de registros internos.",
      "Caso o participante inscrito não acesse a sala virtual na data programada, participe de forma parcial ou não utilize o período de replay, não haverá reembolso automático do valor da inscrição.",
      "O Instituto NTC poderá, por razões técnicas, operacionais, pedagógicas, institucionais, caso fortuito, força maior ou circunstâncias alheias à sua governabilidade direta, reagendar, adiar, alterar ou cancelar a realização da atividade, comprometendo-se a comunicar os inscritos com antecedência razoável.",
    ),
    protecaoConteudo: paragrafos(
      "Todo conteúdo disponibilizado pelo Instituto NTC, incluindo aulas, palestras, apresentações, materiais didáticos, apostilas, gravações, replays, documentos de apoio, roteiros, metodologias, recursos visuais, identidade gráfica e demais elementos educacionais, é protegido por direitos autorais, direitos de imagem, propriedade intelectual e legislação aplicável.",
      "É expressamente proibida, sem autorização prévia e formal do Instituto NTC, a gravação, captação, reprodução, edição, distribuição, transmissão, compartilhamento, publicação, comercialização ou disponibilização total ou parcial dos conteúdos, por qualquer meio físico, digital, eletrônico ou audiovisual.",
      "A inscrição ou contratação confere ao participante apenas o direito pessoal, temporário e intransferível de acesso ao conteúdo, exclusivamente para fins educacionais e institucionais, nos limites estabelecidos na proposta.",
    ),
    fundamentacaoLegal: paragrafos(
      `A contratação dos módulos-evento promovidos pelo Instituto NTC poderá ser formalizada pela ${c.clienteSigla} conforme o procedimento administrativo cabível, observada a legislação aplicável, a natureza do objeto, a justificativa da necessidade pública, a adequada instrução do processo e a análise jurídica interna do contratante.`,
      'Conforme o caso concreto, a contratação poderá ser instruída com fundamento na hipótese de inexigibilidade de licitação prevista no art. 74, inciso III, alínea "f", da Lei Federal nº 14.133/2021, quando caracterizada a prestação de serviço técnico especializado de natureza predominantemente intelectual, especialmente treinamento e aperfeiçoamento de pessoal.',
      "A caracterização da inexigibilidade exige a demonstração da inviabilidade de competição, da pertinência entre a necessidade administrativa e o objeto contratado, da especialização do contratado, da compatibilidade do preço e da justificativa técnica que sustenta a escolha.",
      "O Instituto NTC poderá fornecer elementos de apoio à instrução administrativa, incluindo proposta comercial, conteúdo programático, objetivos, carga horária, metodologia, público-alvo, currículos dos docentes, dados cadastrais, documentos de regularidade fiscal e portfólio institucional.",
    ),
    proximosPassos: paragrafos(
      `Para prosseguimento da presente proposta, a ${c.clienteSigla} deverá confirmar formalmente o aceite das condições comerciais, operacionais e institucionais apresentadas, indicando o quantitativo de participantes por módulo, os dados necessários à emissão da nota fiscal e o responsável interno pelo acompanhamento da ação.`,
      "Após a confirmação, o Instituto NTC adotará as providências necessárias para organização das atividades: validação dos dados dos participantes, alinhamento operacional com a Coordenação de Eventos NTC, emissão dos documentos complementares, disponibilização das orientações de acesso à plataforma EventON e demais medidas necessárias à execução do combo formativo contratado.",
      "As orientações operacionais detalhadas de acesso ao ambiente digital serão encaminhadas em documento próprio (Documento Complementar de Orientações EventON), após a formalização da inscrição ou contratação.",
    ),
    fechamento: paragrafos(
      `O Instituto NTC do Brasil agradece a oportunidade de apresentar esta proposta a ${c.clienteOrgao} e renova sua disposição institucional de contribuir para o fortalecimento das capacidades técnicas, gerenciais e pedagógicas da rede municipal de educação de Palmas.`,
      "Mais do que realizar eventos, cursos ou capacitações, o Instituto NTC estrutura experiências formativas com densidade técnica, aplicabilidade prática, curadoria especializada e excelência docente, comprometidas com a melhoria efetiva da aprendizagem e da gestão das escolas públicas brasileiras.",
      `A presente proposta encontra-se aberta ao diálogo, ajustes e adequações às especificidades operacionais da ${c.clienteSigla}.`,
    ),
  };
}
