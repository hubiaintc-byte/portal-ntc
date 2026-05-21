import type { Metadata } from "next";
import type { Route } from "next";

import {
  BlocoCitacao,
  BlocoCtaInstitucional,
  BlocoFaq,
  BlocoImagemLegenda,
  BlocoNumeros,
  BlocoProgramacao,
  BlocoTexto,
  Breadcrumbs,
  Container,
  Secao,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

export const metadata: Metadata = {
  title: "Blocos editoriais — Design System",
  robots: { index: false, follow: false },
};

const IMG = {
  cta: "https://picsum.photos/seed/ntc-bloco-cta/1200/900",
  legenda: "https://picsum.photos/seed/ntc-bloco-legenda/1600/900",
};

const r = (p: string): Route => p as Route;

export default function PaginaBlocos() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Blocos editoriais" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="compacto">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Blocos editoriais</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §7 do Inventário. Unidades composíveis dentro de páginas. Aceitam tema cromático
            via vert.
          </p>
        </Container>
      </Secao>

      <BlocoNumeros
        titulo="Impacto institucional 2025"
        numeros={[
          { valor: "27", rotulo: "Estados atendidos" },
          { valor: "180+", rotulo: "Municípios" },
          { valor: "12.4k", rotulo: "Profissionais formados" },
          { valor: "98%", rotulo: "Aprovação" },
        ]}
        fundo="oxford"
      />

      <BlocoCitacao
        citacao="A inteligência institucional não nasce de planilhas — nasce de quadros públicos que sabem ler o seu tempo."
        autoria="Prof. Dr. João Soares"
        cargo="Diretor editorial, NTC Gestão Pública"
        variante="cerimonial"
      />

      <BlocoCitacao
        citacao="O método NTC junta governança e pedagogia num lugar só."
        autoria="Profa. Dra. Maria Andrade"
        cargo="USP · NTC Educação"
        variante="discreta"
      />

      <BlocoTexto
        eyebrow="Posicionamento institucional"
        titulo="O método Soberano"
        corpo={LEXICAL_DEMO}
      />

      <BlocoCtaInstitucional
        variante="oxford"
        titulo="Pronto para começar uma conversa?"
        descricao="Equipes públicas que buscam formação editorial de alto nível encontram no Grupo NTC um parceiro de longo prazo."
        rotuloCta="Solicitar proposta"
        linkCta={r("/contato")}
        imagem={{ src: IMG.cta, alt: "Cenário institucional" }}
      />

      <BlocoCtaInstitucional
        variante="cardeal"
        titulo="Variante cardeal"
        descricao="Para chamadas de Gestão Pública com tom mais grave."
        rotuloCta="Conhecer LIDERA"
        linkCta={r("/programas/lidera")}
      />

      <BlocoCtaInstitucional
        variante="oliva"
        titulo="Variante oliva"
        descricao="Para chamadas de Saúde."
        rotuloCta="Conhecer PROSUS+"
        linkCta={r("/programas/prosus")}
      />

      <BlocoCtaInstitucional
        variante="neutro"
        titulo="Variante neutra"
        descricao="Sobre Pergaminho — para CTAs internos ou de conteúdo."
        rotuloCta="Ler artigos"
        linkCta={r("/conteudos")}
      />

      <BlocoImagemLegenda
        imagem={{ src: IMG.legenda, alt: "Auditório institucional" }}
        legenda="Encontro nacional de gestores em Brasília, 2025."
        credito="Foto: Acervo Instituto NTC"
        proporcao="16:9"
      />

      <BlocoFaq
        titulo="Perguntas frequentes"
        itens={[
          { pergunta: "Como contratar um programa?", resposta: LEXICAL_DEMO },
          { pergunta: "Quem é o público-alvo?", resposta: LEXICAL_DEMO },
          { pergunta: "Há certificação?", resposta: LEXICAL_DEMO },
        ]}
        variante="acordeao"
      />

      <BlocoProgramacao
        titulo="Programação · dia 12 de agosto"
        itens={[
          {
            horario: "09:00",
            titulo: "Abertura institucional",
            descricao: "Boas-vindas e contexto da edição 2026.",
            palestrantes: [{ nome: "Profa. Helena Lima", href: r("/corpo-docente/helena-lima") }],
          },
          {
            horario: "10:30",
            titulo: "Painel 1 · Governança no SUS",
            descricao: "Atenção primária, regionalização e contratualização.",
            palestrantes: [
              { nome: "Prof. João Soares" },
              { nome: "Profa. Helena Lima", href: r("/corpo-docente/helena-lima") },
            ],
          },
          { horario: "14:00", titulo: "Estudo de caso · Pernambuco" },
        ]}
      />
    </main>
  );
}
