"use client";

import {
  CampoCheckbox,
  CampoEmail,
  CampoSelect,
  CampoSelectMulti,
  CampoTelefone,
  CampoTextarea,
  CampoTexto,
  CampoUpload,
  CampoUrl,
  Container,
  FormularioSoberano,
  Secao,
} from "@ntc/ui";
import {
  POLITICA_VERSAO_ATUAL,
  schemaCandidatura,
  schemaContato,
  schemaNewsletter,
  schemaProposta,
} from "@ntc/lib";

const MODALIDADES = [
  { label: "In company", value: "in-company" },
  { label: "Turma aberta", value: "turma-aberta" },
  { label: "Sob medida", value: "sob-medida" },
  { label: "Proposta livre", value: "proposta-livre" },
];

const ESFERAS = [
  { label: "Municipal", value: "municipal" },
  { label: "Estadual", value: "estadual" },
  { label: "Federal", value: "federal" },
  { label: "Privada", value: "privada" },
  { label: "Terceiro setor", value: "terceiro-setor" },
];

const ASSUNTOS = [
  { label: "Imprensa", value: "imprensa" },
  { label: "Parcerias", value: "parcerias" },
  { label: "Fornecedor", value: "fornecedor" },
  { label: "Dúvida institucional", value: "duvida-institucional" },
  { label: "Outro", value: "outro" },
];

const TITULACOES = [
  { label: "Doutorado", value: "doutorado" },
  { label: "Pós-doutorado", value: "pos-doutorado" },
  { label: "Mestrado", value: "mestrado" },
  { label: "Especialização", value: "especializacao" },
  { label: "Graduação", value: "graduacao" },
];

// Mocks de áreas para o select multi (em produção virá do Payload).
const AREAS_MOCK = [
  { label: "Educação", value: "1" },
  { label: "Gestão Pública", value: "2" },
  { label: "Saúde", value: "3" },
];

export default function ShowcaseFormularios() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
            Sprint F.4 · sandbox interna
          </p>
          <h1 className="mt-4 font-titulo text-h1 text-balance text-oxford">
            Formulários <em className="text-cardeal">institucionais</em>
          </h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
            Os 4 formulários cabeados às rotas <code className="font-mono text-pequeno text-oxford">/api/forms/*</code>.
            Cada submit persiste um Lead no Payload (visível em{" "}
            <a
              href="http://localhost:3001/admin/collections/leads"
              className="underline decoration-oxford"
              target="_blank"
              rel="noopener noreferrer"
            >
              /admin/collections/leads
            </a>
            ).
          </p>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="editorial">
          <FormularioSoberano
            endpoint="/api/forms/proposta"
            schema={schemaProposta}
            politicaVersao={POLITICA_VERSAO_ATUAL}
            titulo="Solicitar proposta"
            eyebrow="Programa institucional"
            descricao="Diga a quem nos dirigimos. Em até 2 dias úteis nossa equipe de relacionamento institucional retorna."
            textoBotao="Enviar proposta"
            estadoSucesso={<EstadoSucesso titulo="Proposta recebida" mensagem="Em até 2 dias úteis nossa equipe retornará pelo e-mail informado." />}
          >
            <CampoTexto nome="nome" rotulo="Nome completo" obrigatorio autoComplete="name" />
            <CampoEmail nome="email" rotulo="E-mail institucional" obrigatorio />
            <CampoTelefone nome="telefone" rotulo="Telefone" obrigatorio />
            <CampoTexto nome="cargo" rotulo="Cargo" obrigatorio />
            <CampoTexto nome="instituicao" rotulo="Instituição" obrigatorio />
            <CampoSelect nome="esfera" rotulo="Esfera" obrigatorio opcoes={ESFERAS} />
            <CampoSelect nome="modalidade" rotulo="Modalidade desejada" obrigatorio opcoes={MODALIDADES} />
            <CampoTextarea
              nome="mensagem"
              rotulo="Mensagem"
              obrigatorio
              linhas={6}
              placeholder="Conte-nos sobre o desafio institucional que motiva esta proposta."
            />
            <CampoCheckbox
              nome="aceiteLgpd"
              rotulo="Li e concordo com o tratamento dos meus dados conforme a"
              rotuloPolitica="Política de Privacidade"
              linkPolitica="/politica-de-privacidade"
              obrigatorio
            />
          </FormularioSoberano>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <FormularioSoberano
            endpoint="/api/forms/contato"
            schema={schemaContato}
            politicaVersao={POLITICA_VERSAO_ATUAL}
            titulo="Fale com o Grupo NTC"
            eyebrow="Canal institucional"
            descricao="Imprensa, parcerias, fornecedores ou dúvidas institucionais. Distribuição interna é feita pelo assunto."
            textoBotao="Enviar mensagem"
            estadoSucesso={<EstadoSucesso titulo="Mensagem enviada" mensagem="A área responsável retornará pelo canal informado." />}
          >
            <CampoTexto nome="nome" rotulo="Nome completo" obrigatorio autoComplete="name" />
            <CampoEmail nome="email" rotulo="E-mail" obrigatorio />
            <CampoTelefone nome="telefone" rotulo="Telefone" obrigatorio />
            <CampoTexto nome="instituicao" rotulo="Instituição" />
            <CampoTexto nome="cargo" rotulo="Cargo" />
            <CampoSelect nome="assunto" rotulo="Assunto" obrigatorio opcoes={ASSUNTOS} />
            <CampoTextarea nome="mensagem" rotulo="Mensagem" obrigatorio linhas={5} />
            <CampoCheckbox
              nome="aceiteLgpd"
              rotulo="Li e concordo com o tratamento dos meus dados conforme a"
              rotuloPolitica="Política de Privacidade"
              linkPolitica="/politica-de-privacidade"
              obrigatorio
            />
          </FormularioSoberano>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="editorial">
          <FormularioSoberano
            endpoint="/api/forms/newsletter"
            schema={schemaNewsletter}
            politicaVersao={POLITICA_VERSAO_ATUAL}
            titulo="Assinar a Carta Soberana"
            eyebrow="Conteúdo institucional"
            descricao="Notas técnicas, pesquisas aplicadas e agenda institucional. Mensal."
            textoBotao="Assinar a Carta"
            estadoSucesso={<EstadoSucesso titulo="Inscrição confirmada" mensagem="A próxima edição chegará no e-mail informado." />}
          >
            <CampoTexto nome="nome" rotulo="Nome completo" obrigatorio autoComplete="name" />
            <CampoEmail nome="email" rotulo="E-mail" obrigatorio />
            <CampoSelectMulti
              nome="areasInteresse"
              rotulo="Áreas de interesse"
              obrigatorio
              opcoes={AREAS_MOCK}
              helper="Selecione ao menos uma. Em produção, esta lista virá do Payload."
            />
            <CampoCheckbox
              nome="aceiteLgpd"
              rotulo="Li e concordo com o tratamento dos meus dados conforme a"
              rotuloPolitica="Política de Privacidade"
              linkPolitica="/politica-de-privacidade"
              obrigatorio
            />
          </FormularioSoberano>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <FormularioSoberano
            endpoint="/api/forms/candidatura-especialista"
            schema={schemaCandidatura}
            politicaVersao={POLITICA_VERSAO_ATUAL}
            titulo="Candidatura ao corpo docente"
            eyebrow="Corpo docente NTC"
            descricao="Doutores e doutoras com experiência em gestão pública. Envie seu currículo em PDF (até 10 MB)."
            textoBotao="Enviar candidatura"
            multipart
            estadoSucesso={<EstadoSucesso titulo="Candidatura recebida" mensagem="O corpo docente entrará em contato após análise editorial." />}
          >
            <CampoTexto nome="nome" rotulo="Nome completo" obrigatorio autoComplete="name" />
            <CampoEmail nome="email" rotulo="E-mail" obrigatorio />
            <CampoTelefone nome="telefone" rotulo="Telefone" obrigatorio />
            <CampoSelect nome="titulacao" rotulo="Titulação" obrigatorio opcoes={TITULACOES} />
            <CampoSelectMulti
              nome="linhasAtuacao"
              rotulo="Linhas de atuação"
              obrigatorio
              opcoes={AREAS_MOCK}
            />
            <CampoTextarea
              nome="apresentacao"
              rotulo="Apresentação"
              obrigatorio
              linhas={6}
              helper="Resumo de trajetória institucional, mínimo de 40 caracteres."
            />
            <CampoUrl nome="linkLattes" rotulo="Link do currículo Lattes" placeholder="https://lattes.cnpq.br/..." />
            <CampoUrl nome="linkLinkedin" rotulo="Link do LinkedIn" placeholder="https://linkedin.com/in/..." />
            <CampoUpload
              nome="curriculo"
              rotulo="Currículo em PDF"
              obrigatorio
              aceita="application/pdf"
              maxMb={10}
              helper="Apenas PDF, até 10 MB."
            />
            <CampoCheckbox
              nome="aceiteLgpd"
              rotulo="Li e concordo com o tratamento dos meus dados conforme a"
              rotuloPolitica="Política de Privacidade"
              linkPolitica="/politica-de-privacidade"
              obrigatorio
            />
          </FormularioSoberano>
        </Container>
      </Secao>
    </main>
  );
}

interface EstadoSucessoProps {
  titulo: string;
  mensagem: string;
}

function EstadoSucesso({ titulo, mensagem }: EstadoSucessoProps) {
  return (
    <div className="border-l-2 border-dourado pl-6">
      <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-dourado">
        Recebido
      </p>
      <h2 className="mt-2 font-titulo text-h2 text-oxford">{titulo}</h2>
      <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite">{mensagem}</p>
    </div>
  );
}
