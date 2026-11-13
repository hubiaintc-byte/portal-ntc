"use client";

import {
  IDENTIDADES_VISUAIS,
  type LinhaCoordenacao,
  type LinhaEspecialista,
  type LinhaModalidade,
  type PaginaProgramaEdicao,
} from "@/lib/cms/paginaProgramaCatalogo";

import { CampoMarkdown } from "./crm/CampoMarkdown";
import { CampoArea, CampoSelect, CampoTexto } from "./crm/CamposCrm";
import { EditorListaCatalogo } from "./EditorListaCatalogo";
import { identificacaoDaLinha } from "./rotuloImagemPrograma";
import { UploadImagemPrograma } from "./UploadImagemPrograma";

/**
 * Blocos "Página do site" do detalhe do programa (group `programas.pagina`),
 * na ordem em que aparecem na página pública. Os textos longos (visão geral,
 * corpo do problema, público-alvo…) ficam no bloco Textos do detalhe, porque
 * a proposta também os usa.
 */

interface BlocosPaginaProgramaProps {
  pagina: PaginaProgramaEdicao;
  onMudar: (p: PaginaProgramaEdicao) => void;
  /** Endereço atual da página, para orientar quem edita. */
  slug: string;
  /** `null` = programa novo, ainda sem id: o envio de imagens espera o primeiro salvar. */
  programaId: string | null;
}

const DICA_MARCACAO = "Use *texto* para itálico e **texto** para negrito.";

const OPCOES_IDENTIDADE = IDENTIDADES_VISUAIS.map((v) => ({
  value: v,
  label: v === "vertente" ? "Pela vertente (cores da área)" : v,
}));

const novaCoordenacao = (): LinhaCoordenacao => ({
  linhaId: "",
  tag: "",
  imagemId: "",
  imagemCaminho: "",
  imagemAlt: "",
  eixoBadge: "",
  nome: "",
  credencial: "",
  eixo: "",
  modulos: "",
});

const novoEspecialista = (): LinhaEspecialista => ({
  linhaId: "",
  imagemId: "",
  imagemCaminho: "",
  imagemAlt: "",
  eixoBadge: "",
  nome: "",
  credencial: "",
  modulos: "",
});

const novaModalidade = (): LinhaModalidade => ({
  destaque: false,
  tag: "",
  titulo: "",
  descricao: "",
  ctaRotulo: "",
  ctaHref: "",
});

export function BlocosPaginaPrograma({ pagina: p, onMudar, slug, programaId }: BlocosPaginaProgramaProps) {
  const campo =
    <K extends keyof PaginaProgramaEdicao>(chave: K) =>
    (v: PaginaProgramaEdicao[K]) =>
      onMudar({ ...p, [chave]: v });
  const docente =
    <K extends keyof PaginaProgramaEdicao["docentes"]>(chave: K) =>
    (v: PaginaProgramaEdicao["docentes"][K]) =>
      onMudar({ ...p, docentes: { ...p.docentes, [chave]: v } });
  /** Troca só a imagem enviada de uma linha de docente (a escrita já gravou). */
  const imagemDaLinha =
    <L extends { imagemId: string }>(lista: "coordenacao" | "especialistas", indice: number) =>
    (midiaId: string) =>
      onMudar({
        ...p,
        docentes: {
          ...p.docentes,
          [lista]: (p.docentes[lista] as unknown as L[]).map((l, j) => (j === indice ? { ...l, imagemId: midiaId } : l)),
        },
      });
  const cartao =
    <K extends keyof PaginaProgramaEdicao["cartao"]>(chave: K) =>
    (v: PaginaProgramaEdicao["cartao"][K]) =>
      onMudar({ ...p, cartao: { ...p.cartao, [chave]: v } });

  return (
    <>
      <section className="pcms-det-bloco">
        <h2>Página do site · Identidade visual</h2>
        <p className="pcms-editor__hint">
          {slug ? `Página pública: /programas/${slug}. ` : ""}
          Publicar põe a página no ar e libera o programa para as propostas.
        </p>
        <CampoSelect rotulo="Identidade visual" valor={p.identidadeVisual} onMudar={campo("identidadeVisual")} opcoes={OPCOES_IDENTIDADE} />
      </section>

      <section className="pcms-det-bloco">
        <h2>Página do site · Topo</h2>
        <CampoMarkdown rotulo="Título do topo" valor={p.heroTitulo} onMudar={campo("heroTitulo")} linhas={2} soEnfase dica={DICA_MARCACAO} />
        <CampoArea rotulo="Subtítulo do topo" valor={p.heroSubtitulo} onMudar={campo("heroSubtitulo")} />
        <UploadImagemPrograma
          programaId={programaId}
          alvo={{ tipo: "topo" }}
          rotulo="Imagem do topo — imagem enviada"
          identificacao="imagem do topo"
          midiaId={p.heroImagemId}
          onMudou={campo("heroImagemId")}
        />
        <CampoTexto rotulo="Imagem do topo — caminho (/img/…)" valor={p.heroImagemCaminho} onMudar={campo("heroImagemCaminho")} />
      </section>

      <EditorListaCatalogo
        rotulo="Página do site · Barra de dados"
        descricao="A faixa logo abaixo do topo (ex.: Carga horária · 80h)."
        rotuloItem="Dado"
        itens={p.barraDados}
        onMudar={campo("barraDados")}
        novo={() => ({ rotulo: "", valor: "", valorSub: "" })}
        campos={[
          { chave: "rotulo", rotulo: "Rótulo" },
          { chave: "valor", rotulo: "Valor" },
          { chave: "valorSub", rotulo: "Complemento do valor (opcional)" },
        ]}
      />

      <section className="pcms-det-bloco">
        <h2>Página do site · Visão geral e problema</h2>
        <p className="pcms-editor__hint">Os textos destas seções ficam no bloco Textos, acima.</p>
        <CampoMarkdown rotulo="Título da Visão Geral" valor={p.visaoGeralTitulo} onMudar={campo("visaoGeralTitulo")} linhas={2} soEnfase dica={DICA_MARCACAO} />
        <CampoMarkdown rotulo="Título do Problema" valor={p.problemaTitulo} onMudar={campo("problemaTitulo")} linhas={2} soEnfase dica={DICA_MARCACAO} />
        <CampoMarkdown
          rotulo="Destaque do Problema (parágrafo de fechamento)"
          valor={p.problemaDestaque}
          onMudar={campo("problemaDestaque")}
          linhas={3}
          soEnfase
          dica={DICA_MARCACAO}
        />
      </section>

      <EditorListaCatalogo
        rotulo="Página do site · Público-alvo (chips)"
        descricao="O parágrafo do público-alvo fica no bloco Textos; a proposta recebe os dois juntos."
        rotuloItem="Chip"
        itens={p.publicoChips}
        onMudar={campo("publicoChips")}
        novo={() => ({ texto: "" })}
        campos={[{ chave: "texto", rotulo: "Texto" }]}
      />

      <section className="pcms-det-bloco">
        <h2>Página do site · Docentes</h2>
        <CampoMarkdown rotulo="Título" valor={p.docentes.titulo} onMudar={docente("titulo")} linhas={2} soEnfase dica={DICA_MARCACAO} />
        <CampoMarkdown rotulo="Introdução" valor={p.docentes.intro} onMudar={docente("intro")} linhas={3} soEnfase dica={DICA_MARCACAO} />
        <CampoTexto rotulo="Marcador da coordenação" valor={p.docentes.coordenacaoMarcador} onMudar={docente("coordenacaoMarcador")} />
        <CampoTexto rotulo="Marcador dos especialistas" valor={p.docentes.especialistasMarcador} onMudar={docente("especialistasMarcador")} />
        <CampoArea rotulo="Nota" valor={p.docentes.nota} onMudar={docente("nota")} />
      </section>
      <EditorListaCatalogo
        rotulo="Página do site · Docentes · Contadores"
        rotuloItem="Contador"
        itens={p.docentes.contadores}
        onMudar={docente("contadores")}
        novo={() => ({ num: "", lbl: "" })}
        campos={[
          { chave: "num", rotulo: "Número" },
          { chave: "lbl", rotulo: "Legenda" },
        ]}
      />
      <EditorListaCatalogo
        rotulo="Página do site · Docentes · Coordenação científica"
        rotuloItem="Coordenação"
        itens={p.docentes.coordenacao}
        onMudar={docente("coordenacao")}
        novo={novaCoordenacao}
        extra={(linha, i) => (
          <UploadImagemPrograma
            programaId={programaId}
            alvo={linha.linhaId === "" ? null : { tipo: "coordenacao", linhaId: linha.linhaId }}
            rotulo={`Coordenação ${i + 1} — imagem enviada`}
            identificacao={identificacaoDaLinha("Coordenação", linha.nome, i)}
            midiaId={linha.imagemId}
            onMudou={imagemDaLinha("coordenacao", i)}
          />
        )}
        campos={[
          { chave: "tag", rotulo: "Etiqueta" },
          { chave: "nome", rotulo: "Nome" },
          { chave: "credencial", rotulo: "Credencial", area: true },
          { chave: "eixoBadge", rotulo: "Selo do eixo" },
          { chave: "eixo", rotulo: "Eixo" },
          { chave: "modulos", rotulo: "Módulos" },
          { chave: "imagemCaminho", rotulo: "Imagem — caminho (/img/…)" },
          { chave: "imagemAlt", rotulo: "Texto alternativo da imagem" },
        ]}
      />
      <EditorListaCatalogo
        rotulo="Página do site · Docentes · Especialistas"
        rotuloItem="Especialista"
        itens={p.docentes.especialistas}
        onMudar={docente("especialistas")}
        novo={novoEspecialista}
        extra={(linha, i) => (
          <UploadImagemPrograma
            programaId={programaId}
            alvo={linha.linhaId === "" ? null : { tipo: "especialista", linhaId: linha.linhaId }}
            rotulo={`Especialista ${i + 1} — imagem enviada`}
            identificacao={identificacaoDaLinha("Especialista", linha.nome, i)}
            midiaId={linha.imagemId}
            onMudou={imagemDaLinha("especialistas", i)}
          />
        )}
        campos={[
          { chave: "nome", rotulo: "Nome" },
          { chave: "credencial", rotulo: "Credencial", area: true },
          { chave: "eixoBadge", rotulo: "Selo do eixo" },
          { chave: "modulos", rotulo: "Módulos" },
          { chave: "imagemCaminho", rotulo: "Imagem — caminho (/img/…)" },
          { chave: "imagemAlt", rotulo: "Texto alternativo da imagem" },
        ]}
      />

      <section className="pcms-det-bloco">
        <h2>Página do site · Modalidades</h2>
        <CampoArea rotulo="Introdução das modalidades" valor={p.modalidadesIntro} onMudar={campo("modalidadesIntro")} />
      </section>
      <EditorListaCatalogo
        rotulo="Página do site · Modalidades · Cartões"
        descricao="O link do botão aceita /, #, http://, https:// ou mailto:."
        rotuloItem="Modalidade"
        itens={p.modalidadesCards}
        onMudar={campo("modalidadesCards")}
        novo={novaModalidade}
        campos={[
          { chave: "destaque", rotulo: "Destaque", marcar: true },
          { chave: "tag", rotulo: "Etiqueta" },
          { chave: "titulo", rotulo: "Título" },
          { chave: "descricao", rotulo: "Descrição", area: true },
          { chave: "ctaRotulo", rotulo: "Rótulo do botão" },
          { chave: "ctaHref", rotulo: "Link do botão" },
        ]}
      />

      <section className="pcms-det-bloco">
        <h2>Página do site · Módulos abertos e chamada final</h2>
        <p className="pcms-editor__hint">Os módulos abertos vêm dos eventos publicados do programa, na agenda.</p>
        <CampoArea rotulo="Texto dos módulos abertos" valor={p.modulosAbertosMicrocopy} onMudar={campo("modulosAbertosMicrocopy")} />
        <CampoMarkdown rotulo="Título da chamada final" valor={p.chamadaFinalTitulo} onMudar={campo("chamadaFinalTitulo")} linhas={2} soEnfase dica={DICA_MARCACAO} />
        <CampoArea rotulo="Texto da chamada final" valor={p.chamadaFinalTexto} onMudar={campo("chamadaFinalTexto")} />
      </section>

      <EditorListaCatalogo
        rotulo="Página do site · Resumo lateral"
        rotuloItem="Linha"
        itens={p.resumoLateral}
        onMudar={campo("resumoLateral")}
        novo={() => ({ rotulo: "", valor: "" })}
        campos={[
          { chave: "rotulo", rotulo: "Rótulo" },
          { chave: "valor", rotulo: "Valor" },
        ]}
      />
      <EditorListaCatalogo
        rotulo="Página do site · Resumo lateral · Entregas"
        rotuloItem="Entrega"
        itens={p.entregas}
        onMudar={campo("entregas")}
        novo={() => ({ texto: "" })}
        campos={[{ chave: "texto", rotulo: "Texto" }]}
      />

      <section className="pcms-det-bloco">
        <h2>Página do site · Cartão (listas e menus)</h2>
        <p className="pcms-editor__hint">
          Como o programa aparece em /programas, na página da vertente, no menu do topo e no mapa do site.
        </p>
        <CampoTexto rotulo="Nome" valor={p.cartao.nome} onMudar={cartao("nome")} />
        <CampoTexto rotulo="Chamada" valor={p.cartao.tagline} onMudar={cartao("tagline")} />
        <CampoTexto rotulo="Meta (ex.: 10 módulos · 80h)" valor={p.cartao.meta} onMudar={cartao("meta")} />
        <UploadImagemPrograma
          programaId={programaId}
          alvo={{ tipo: "cartao" }}
          rotulo="Imagem do cartão — imagem enviada"
          identificacao="imagem do cartão"
          midiaId={p.cartao.imagemId}
          onMudou={cartao("imagemId")}
        />
        <CampoTexto rotulo="Imagem — caminho (/img/…)" valor={p.cartao.imagemCaminho} onMudar={cartao("imagemCaminho")} />
        <CampoTexto rotulo="Ordem nas listas" valor={p.cartao.ordem} onMudar={cartao("ordem")} curto />
        <CampoTexto rotulo="Descrição no menu" valor={p.cartao.descricaoMenu} onMudar={cartao("descricaoMenu")} />
        <CampoTexto rotulo="Descrição no mapa do site" valor={p.cartao.descricaoMapa} onMudar={cartao("descricaoMapa")} />
      </section>
    </>
  );
}
