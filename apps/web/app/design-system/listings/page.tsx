"use client";

import { useState } from "react";
import type { Route } from "next";

import {
  Breadcrumbs,
  Container,
  FILTRO_INICIAL,
  FiltrosAgenda,
  GradeEspecialistas,
  GradeEventos,
  GradeProgramas,
  ListaModulos,
  Secao,
  type FiltroEstado,
  type EspecialistaItem,
  type EventoItem,
  type ProgramaItem,
  type ModuloItem,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

const r = (p: string): Route => p as Route;

const IMG = {
  prog1: "https://picsum.photos/seed/ntc-prog-edutec/1200/900",
  prog2: "https://picsum.photos/seed/ntc-prog-lidera/1200/900",
  prog3: "https://picsum.photos/seed/ntc-prog-prosus/1200/900",
  evento1: "https://picsum.photos/seed/ntc-ev-prosus/1600/1000",
  evento2: "https://picsum.photos/seed/ntc-ev-edutec/1600/1000",
  evento3: "https://picsum.photos/seed/ntc-ev-lidera/1600/1000",
  pessoa1: "https://picsum.photos/seed/ntc-p-1/600/690",
  pessoa2: "https://picsum.photos/seed/ntc-p-2/600/690",
  pessoa3: "https://picsum.photos/seed/ntc-p-3/600/690",
  pessoa4: "https://picsum.photos/seed/ntc-p-4/600/690",
};

const PROGRAMAS: ProgramaItem[] = [
  {
    sigla: "EDUTEC",
    nomeCompleto: "Educação Digital de Alta Performance",
    area: "educacao",
    resumoVisaoGeral: "Tecnologia aplicada ao currículo da rede pública.",
    imagem: { src: IMG.prog1, alt: "EDUTEC" },
    href: r("/programas/edutec"),
    eyebrow: "Programa NTC Educação",
  },
  {
    sigla: "PEAR",
    nomeCompleto: "Alfabetização de Alta Performance",
    area: "educacao",
    resumoVisaoGeral: "Método estruturado de alfabetização para os anos iniciais.",
    imagem: { src: IMG.prog1, alt: "PEAR" },
    href: r("/programas/pear"),
  },
  {
    sigla: "LIDERA",
    nomeCompleto: "Direção Estratégica no Setor Público",
    area: "gestao-publica",
    resumoVisaoGeral: "Formação de direção para gestores em transição.",
    imagem: { src: IMG.prog2, alt: "LIDERA" },
    href: r("/programas/lidera"),
  },
  {
    sigla: "PROSUS+",
    nomeCompleto: "Governança no SUS",
    area: "saude",
    resumoVisaoGeral: "Atenção primária, regionalização e contratualização.",
    imagem: { src: IMG.prog3, alt: "PROSUS+" },
    href: r("/programas/prosus"),
  },
];

const EVENTOS: EventoItem[] = [
  {
    nome: "Encontro PROSUS+ Brasília 2026",
    eyebrow: "Programa PROSUS+",
    imagem: { src: IMG.evento1, alt: "Auditório" },
    dataInicio: "2026-08-12",
    modalidade: "presencial",
    local: { cidade: "Brasília", estado: "DF" },
    programa: { sigla: "PROSUS+" },
    area: "saude",
    inscricaoAberta: true,
    href: r("/eventos/prosus-brasilia-2026"),
  },
  {
    nome: "EDUTEC · Módulo 1 Online",
    imagem: { src: IMG.evento2, alt: "Aula online" },
    dataInicio: "2026-03-08",
    modalidade: "online",
    programa: { sigla: "EDUTEC" },
    area: "educacao",
    inscricaoAberta: false,
    href: r("/eventos/edutec-m01"),
  },
  {
    nome: "LIDERA · Imersão Recife",
    imagem: { src: IMG.evento3, alt: "Encontro presencial" },
    dataInicio: "2026-09-22",
    modalidade: "hibrido",
    local: { cidade: "Recife", estado: "PE" },
    programa: { sigla: "LIDERA" },
    area: "gestao-publica",
    inscricaoAberta: true,
    href: r("/eventos/lidera-recife"),
  },
];

const ESPECIALISTAS: EspecialistaItem[] = [
  {
    nome: "Profa. Dra. Maria Andrade",
    titulacao: "PhD em Educação",
    instituicao: "USP · NTC Educação",
    foto: { src: IMG.pessoa1, alt: "Retrato editorial" },
    href: r("/corpo-docente/maria-andrade"),
  },
  {
    nome: "Prof. Dr. João Soares",
    titulacao: "Doutor em Administração Pública",
    instituicao: "FGV · NTC Gestão Pública",
    cargoAtual: "Diretor editorial",
    foto: { src: IMG.pessoa2, alt: "Retrato editorial" },
    href: r("/corpo-docente/joao-soares"),
  },
  {
    nome: "Profa. Dra. Helena Lima",
    titulacao: "PhD em Saúde Coletiva",
    instituicao: "Fiocruz · NTC Saúde",
    foto: { src: IMG.pessoa3, alt: "Retrato editorial" },
    href: r("/corpo-docente/helena-lima"),
  },
  {
    nome: "Prof. Carlos Mendes",
    titulacao: "Mestre em Políticas Públicas",
    instituicao: "ENAP",
    foto: { src: IMG.pessoa4, alt: "Retrato editorial" },
  },
];

const MODULOS: ModuloItem[] = [
  { numero: 1, titulo: "Fundamentos", ementa: LEXICAL_DEMO, cargaHoraria: "30h" },
  { numero: 2, titulo: "Métodos", ementa: LEXICAL_DEMO, cargaHoraria: "30h" },
  {
    numero: 3,
    titulo: "Aplicação em rede",
    ementa: LEXICAL_DEMO,
    cargaHoraria: "60h",
    eventosVinculados: [{ nome: "Imersão Recife", href: r("/eventos/lidera-recife") }],
  },
];

export default function PaginaListings() {
  const [filtros, setFiltros] = useState<FiltroEstado>(FILTRO_INICIAL);

  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Listings e grids" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="compacto">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Listings e grids</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §8 do Inventário. Composições de cards para Programas, Eventos, Especialistas
            e Módulos, mais o painel de filtros da Agenda.
          </p>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeProgramas (agrupada por área)</h2>
          <div className="mt-10">
            <GradeProgramas programas={PROGRAMAS} agruparPorArea variante="editorial" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeEventos (agrupada por mês)</h2>
          <div className="mt-10">
            <GradeEventos eventos={EVENTOS} agruparPorMes ordenacao="cronologica" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeEspecialistas (modo expandido)</h2>
          <div className="mt-10">
            <GradeEspecialistas especialistas={ESPECIALISTAS} modo="expandido" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">ListaModulos (variante completa)</h2>
          <div className="mt-10">
            <ListaModulos modulos={MODULOS} variante="completa" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">FiltrosAgenda (controlado)</h2>
          <div className="mt-10">
            <FiltrosAgenda
              programasDisponiveis={[
                { sigla: "EDUTEC", nomeCompleto: "Educação Digital" },
                { sigla: "LIDERA", nomeCompleto: "Direção Estratégica" },
                { sigla: "PROSUS+", nomeCompleto: "Governança no SUS" },
              ]}
              onChange={setFiltros}
            />
          </div>
          <pre className="mt-6 overflow-x-auto bg-pergaminho p-4 font-corpo text-pequeno text-grafite">
            {JSON.stringify(filtros, null, 2)}
          </pre>
        </Container>
      </Secao>
    </main>
  );
}
