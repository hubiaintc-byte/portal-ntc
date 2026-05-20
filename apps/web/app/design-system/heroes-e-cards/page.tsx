import type { Metadata } from "next";
import type { Route } from "next";

import {
  Breadcrumbs,
  CardCliente,
  CardConteudo,
  CardEspecialista,
  CardEvento,
  CardPrograma,
  Container,
  Grade,
  HeroArea,
  HeroConteudo,
  HeroEvento,
  HeroInstitucional,
  HeroPrograma,
  type ItemMenu,
  NavegacaoSoberana,
  Secao,
  tokens,
} from "@ntc/ui";

export const metadata: Metadata = {
  title: "Heroes e Cards — Design System",
  robots: { index: false, follow: false },
};

const ROTAS: ItemMenu[] = [
  { rotulo: "Grupo NTC", href: "/grupo" },
  {
    rotulo: "Programas",
    filhos: [
      { rotulo: "EDUTEC", href: "/programas/edutec", descricao: "Educação Digital" },
      { rotulo: "PEAR", href: "/programas/pear", descricao: "Alfabetização" },
      { rotulo: "PROSUS+", href: "/programas/prosus", descricao: "Governança no SUS" },
    ],
  },
  {
    rotulo: "Capacitação",
    filhos: [
      { rotulo: "Agenda Geral NTC", href: "/capacitacao", descricao: "Eventos abertos" },
      { rotulo: "EventOn", href: "/eventon", descricao: "Plataforma de acesso e replay" },
    ],
  },
  {
    rotulo: "Soluções",
    filhos: [
      { rotulo: "NTC Educação", href: "/educacao", descricao: "Redes públicas de ensino" },
      { rotulo: "NTC Gestão Pública", href: "/gestao-publica", descricao: "Administração" },
      { rotulo: "NTC Saúde", href: "/saude", descricao: "SUS" },
    ],
  },
  { rotulo: "Conteúdos", href: "/conteudos" },
  { rotulo: "Contato", href: "/contato" },
];

const IMG = {
  institucional: "https://picsum.photos/seed/ntc-institucional/1920/1080",
  educacao: "https://picsum.photos/seed/ntc-educacao/1600/1000",
  gestao: "https://picsum.photos/seed/ntc-gestao/1600/1000",
  saude: "https://picsum.photos/seed/ntc-saude/1600/1000",
  programa: "https://picsum.photos/seed/ntc-programa/1200/900",
  evento: "https://picsum.photos/seed/ntc-evento/1600/1000",
  conteudo: "https://picsum.photos/seed/ntc-conteudo/1600/700",
  conteudo2: "https://picsum.photos/seed/ntc-conteudo2/1600/900",
  especialista1: "https://picsum.photos/seed/ntc-pessoa1/600/690",
  especialista2: "https://picsum.photos/seed/ntc-pessoa2/600/690",
  especialista3: "https://picsum.photos/seed/ntc-pessoa3/600/690",
  cliente1: "https://picsum.photos/seed/ntc-logo1/240/120",
  cliente2: "https://picsum.photos/seed/ntc-logo2/240/120",
  cliente3: "https://picsum.photos/seed/ntc-logo3/240/120",
  cliente4: "https://picsum.photos/seed/ntc-logo4/240/120",
};

// Hrefs mock — rotas reais ainda não existem; cast explícito para typedRoutes.
const r = (path: string): Route => path as Route;

export default function DesignSystemPage() {
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS}
        ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato" }}
        ctaSecundario={{ rotulo: "Área do Participante", href: "/eventon/area" }}
      />

      <main id="conteudo">
        <Secao fundo="osso" vertical="compacto">
          <Container variante="amplo">
            <Breadcrumbs
              itens={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Design System", href: "/design-system" },
                { rotulo: "Heroes e Cards" },
              ]}
            />
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
              Sandbox interna · não-listada no sitemap
            </p>
            <h1 className="mt-4 text-h1 text-balance">
              Heroes e Cards <em className="text-cardeal">Soberana</em>
            </h1>
            <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-pretty">
              Checkpoint visual da sessão 7 do Sprint F. Cinco famílias de hero (Inventário §5)
              e cinco famílias de card (§6), todos com dados mock.
            </p>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="compacto">
          <Container variante="amplo">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
              Hero family — §5 do Inventário
            </p>
            <h2 className="mt-3 text-h2 text-oxford">Cinco variantes canônicas</h2>
          </Container>
        </Secao>

        <HeroInstitucional
          eyebrow="Instituto NTC do Brasil"
          titulo="Inteligência institucional. Impacto real."
          subtitulo="Formação de capacidades públicas em educação, gestão e saúde — com método editorial, currículos próprios e corpo docente sênior."
          imagem={{ src: IMG.institucional, alt: "Cenário institucional NTC" }}
          ctas={[
            { rotulo: "Conhecer o Grupo", href: r("/grupo"), variante: "primario" },
            { rotulo: "Falar com a equipe", href: r("/contato"), variante: "secundario" },
          ]}
        />

        <HeroArea
          area="educacao"
          eyebrow="Vertical de Educação"
          titulo="Redes públicas que aprendem com método."
          subtitulo="Programas para secretarias estaduais e municipais com foco em alfabetização, educação integral e digitalização do ensino."
          imagem={{ src: IMG.educacao, alt: "Sala de aula pública" }}
          corAcento={tokens.cores.oxford}
        />

        <HeroArea
          area="gestao-publica"
          eyebrow="Vertical de Gestão Pública"
          titulo="Direção estratégica para o serviço público."
          subtitulo="Liderança, contratações, integridade e modernização para administrações públicas comprometidas com resultado."
          imagem={{ src: IMG.gestao, alt: "Cenário institucional" }}
          corAcento={tokens.cores.cardeal}
        />

        <HeroArea
          area="saude"
          eyebrow="Vertical de Saúde"
          titulo="Governança no SUS com método e rigor editorial."
          subtitulo="Formação para gestores e quadros técnicos do Sistema Único de Saúde — da Atenção Primária à direção de redes complexas."
          imagem={{ src: IMG.saude, alt: "Centro de saúde pública" }}
          corAcento={tokens.cores.oliva}
        />

        <HeroPrograma
          sigla="EDUTEC"
          nomeCompleto="Educação Digital de Alta Performance"
          eyebrow="Programa"
          imagem={{ src: IMG.programa, alt: "Imagem editorial do programa" }}
          area="educacao"
          cargaHorariaTotal="180 horas"
          modulosQuantidade={6}
          ctaPrincipal={{ rotulo: "Solicitar proposta", href: r("/contato?programa=edutec") }}
        />

        <HeroEvento
          nome="Encontro PROSUS+ Brasília 2026"
          eyebrow="Capacitação · Saúde"
          imagem={{ src: IMG.evento, alt: "Auditório do evento" }}
          dataInicio="2026-08-12"
          dataFim="2026-08-14"
          modalidade="presencial"
          local={{ cidade: "Brasília", estado: "DF", nomeLocal: "Centro Internacional de Convenções" }}
          programa={{ sigla: "PROSUS+", href: r("/programas/prosus") }}
          area="saude"
          ctaInscricao={{ rotulo: "Inscrever-se", href: r("/eventon/prosus-brasilia-2026"), externo: false }}
        />

        <HeroConteudo
          categoria="Insights · Gestão Pública"
          titulo="A nova fronteira da liderança no Estado brasileiro"
          lide="Por que a próxima década exigirá um modelo de direção pública mais analítica, mais ética e mais editorial — e como o Grupo NTC vem formando esses quadros."
          imagem={{ src: IMG.conteudo, alt: "Cenário editorial" }}
          autor={{ nome: "Profa. Dra. M. Andrade", titulacao: "Diretora editorial" }}
          dataPublicacao="2026-04-12"
          tempoLeitura="9 min de leitura"
        />

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
              Cards editoriais — §6 do Inventário
            </p>
            <h2 className="mt-3 text-h2 text-oxford">CardPrograma</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Variantes editorial (com imagem) e compacto (texto + tag de área).
            </p>
            <Grade colunas={3} gap="medio" className="mt-12">
              <CardPrograma
                sigla="EDUTEC"
                nomeCompleto="Educação Digital de Alta Performance"
                eyebrow="Programa NTC Educação"
                imagem={{ src: IMG.programa, alt: "Imagem editorial do EDUTEC" }}
                area="educacao"
                resumoVisaoGeral="Trilha de 180h para secretarias de educação que querem profissionalizar a integração de tecnologia ao currículo."
                href={r("/programas/edutec")}
                variante="editorial"
              />
              <CardPrograma
                sigla="LIDERA"
                nomeCompleto="Direção Estratégica no Setor Público"
                eyebrow="Programa NTC Gestão Pública"
                imagem={{ src: IMG.gestao, alt: "Imagem editorial do LIDERA" }}
                area="gestao-publica"
                resumoVisaoGeral="Formação de direção para gestores em transição de carreira para o alto escalão do Estado."
                href={r("/programas/lidera")}
                variante="editorial"
              />
              <CardPrograma
                sigla="PROSUS+"
                nomeCompleto="Governança no SUS"
                area="saude"
                href={r("/programas/prosus")}
                variante="compacto"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardEvento</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              CTA muda conforme inscricaoAberta.
            </p>
            <Grade colunas={2} gap="medio" className="mt-12">
              <CardEvento
                nome="Encontro PROSUS+ Brasília 2026"
                eyebrow="Programa PROSUS+"
                imagem={{ src: IMG.evento, alt: "Auditório do evento" }}
                dataInicio="2026-08-12"
                modalidade="presencial"
                local={{ cidade: "Brasília", estado: "DF" }}
                programa={{ sigla: "PROSUS+" }}
                area="saude"
                inscricaoAberta
                href={r("/eventos/prosus-brasilia-2026")}
              />
              <CardEvento
                nome="EDUTEC · Módulo 1 Online"
                imagem={{ src: IMG.educacao, alt: "Cenário do evento online" }}
                dataInicio="2026-03-08"
                modalidade="online"
                programa={{ sigla: "EDUTEC" }}
                area="educacao"
                inscricaoAberta={false}
                href={r("/eventos/edutec-m01")}
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardEspecialista</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Foto 20:23. Variantes regular, expandido e cerimonial.
            </p>
            <Grade colunas={3} gap="medio" className="mt-12">
              <CardEspecialista
                nome="Profa. Dra. Maria Andrade"
                titulacao="PhD em Educação"
                instituicao="USP · NTC Educação"
                foto={{ src: IMG.especialista1, alt: "Retrato editorial" }}
                href={r("/corpo-docente/maria-andrade")}
                variante="regular"
              />
              <CardEspecialista
                nome="Prof. Dr. João Soares"
                titulacao="Doutor em Administração Pública"
                instituicao="FGV · NTC Gestão Pública"
                cargoAtual="Ex-secretário estadual de fazenda; consultor sênior do Banco Mundial em modernização de gestão pública."
                foto={{ src: IMG.especialista2, alt: "Retrato editorial" }}
                href={r("/corpo-docente/joao-soares")}
                variante="expandido"
              />
              <CardEspecialista
                nome="Profa. Dra. Helena Lima"
                titulacao="PhD em Saúde Coletiva"
                instituicao="Fiocruz · NTC Saúde"
                cargoAtual="Diretora editorial do programa PROSUS+"
                foto={{ src: IMG.especialista3, alt: "Retrato editorial" }}
                href={r("/corpo-docente/helena-lima")}
                variante="cerimonial"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardConteudo</h2>
            <Grade colunas={2} gap="medio" className="mt-12">
              <CardConteudo
                titulo="A nova fronteira da liderança no Estado brasileiro"
                lide="Por que a próxima década exigirá um modelo de direção pública mais analítica, mais ética e mais editorial."
                categoria="Insights · Gestão Pública"
                imagem={{ src: IMG.conteudo2, alt: "Cenário editorial" }}
                area="gestao-publica"
                dataPublicacao="2026-04-12"
                tempoLeitura="9 min de leitura"
                href={r("/conteudos/lideranca-estado")}
              />
              <CardConteudo
                titulo="Alfabetização: o gargalo silencioso da educação brasileira"
                lide="Dados do PEAR mostram que redes com método estruturado dobram o rendimento ao fim do 2º ano."
                categoria="Insights · Educação"
                imagem={{ src: IMG.educacao, alt: "Sala de aula" }}
                area="educacao"
                dataPublicacao="2026-03-20"
                tempoLeitura="7 min de leitura"
                href={r("/conteudos/alfabetizacao-gargalo")}
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardCliente</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Mosaico (logo central) e lista (logo + nome + esfera/estado).
            </p>
            <Grade colunas={4} gap="medio" className="mt-12">
              <CardCliente
                nome="Secretaria de Educação de Goiás"
                logo={{ src: IMG.cliente1, alt: "SEDUC-GO" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Secretaria de Saúde da Bahia"
                logo={{ src: IMG.cliente2, alt: "SESAB" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Tribunal de Contas do Estado do Ceará"
                logo={{ src: IMG.cliente3, alt: "TCE-CE" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Prefeitura de Recife"
                logo={{ src: IMG.cliente4, alt: "PCR" }}
                variante="mosaico"
              />
            </Grade>
            <Grade colunas={2} gap="medio" className="mt-10">
              <CardCliente
                nome="Secretaria de Educação de Goiás"
                logo={{ src: IMG.cliente1, alt: "SEDUC-GO" }}
                esfera="Estadual"
                estado="GO"
                variante="lista"
              />
              <CardCliente
                nome="Prefeitura de Recife"
                logo={{ src: IMG.cliente4, alt: "PCR" }}
                esfera="Municipal"
                estado="PE"
                variante="lista"
              />
            </Grade>
          </Container>
        </Secao>
      </main>
    </>
  );
}
