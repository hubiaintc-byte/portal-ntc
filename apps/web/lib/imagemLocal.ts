import type { CSSProperties } from "react";

import { LARGURAS_OTIMIZADAS } from "./imagensOtimizadasLarguras";

/**
 * Variantes responsivas das fotos de `public/img/fotos/_optimized/`.
 *
 * O código e os arquivos de conteúdo (`conteudo*.ts`) apontam sempre para
 * `<nome>.1920.webp`. Estas funções derivam, na hora de renderizar, as
 * outras variantes que já estão no disco (`.640`, e `.avif` além de
 * `.webp`), sem mudar o markup nem os dados:
 *
 * - `<img>` ganha `srcSet` (webp, larguras reais) + `sizes`. Formato avif
 *   em `<img>` exigiria `<picture>`, que muda a estrutura do markup.
 * - fundo inline (`style`) ganha a custom property `--fundo-set` com um
 *   `image-set()` avif/webp; a regra em `globals.css` só a aplica quando o
 *   navegador entende `image-set(... type())` — os demais seguem com o
 *   `url()` do webp de sempre. Miniaturas vão direto para o `.640.webp`.
 *
 * URLs que não são dessas fotos (CMS, SVG, vazias) passam intactas.
 */

const PADRAO = /^\/img\/fotos\/_optimized\/(.+)\.(?:640|1280|1920)\.(?:webp|avif)$/;

interface Variantes {
  base: string;
  /** Largura real de cada variante distinta, crescente: [640, …, maior]. */
  larguras: { sufixo: 640 | 1280 | 1920; largura: number }[];
}

function variantes(src: string): Variantes | null {
  const m = PADRAO.exec(src);
  if (!m) return null;
  const nome = m[1]!;
  const reais = LARGURAS_OTIMIZADAS[nome];
  if (!reais) return null;
  const larguras: Variantes["larguras"] = [];
  ([640, 1280, 1920] as const).forEach((sufixo, i) => {
    const largura = reais[i]!;
    // O pipeline não amplia: `.1280` e `.1920` costumam ser o mesmo arquivo.
    // Fica o `.1920`, o mesmo que o `src` e o CSS já pedem (uma entrada de cache só).
    const igual = larguras.find((l) => l.largura === largura);
    if (igual) igual.sufixo = sufixo;
    else larguras.push({ sufixo, largura });
  });
  return { base: `/img/fotos/_optimized/${nome}`, larguras };
}

/** `srcset` só com webp; espaços do nome viram `%20` (são separadores no srcset). */
export function srcSetLocal(src: string): string | undefined {
  const v = variantes(src);
  if (!v || v.larguras.length < 2) return undefined;
  return v.larguras
    .map(({ sufixo, largura }) => `${encodeURI(`${v.base}.${sufixo}.webp`)} ${largura}w`)
    .join(", ");
}

export interface ImagemResponsiva {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Props para espalhar num `<img>`: `<img {...imgResponsiva(src, "…")} alt=… />`.
 * `src` continua sendo o `.1920.webp` (fallback para quem ignora `srcset`).
 */
export function imgResponsiva(src: string, sizes: string): ImagemResponsiva {
  const srcSet = srcSetLocal(src);
  return srcSet ? { src, srcSet, sizes } : { src };
}

/**
 * Tamanho em que a foto aparece como fundo (`background-size: cover`):
 * - `grande`: pode ocupar a largura da tela (heróis, faixas, cards que viram
 *   100% no tablet) — só troca o formato, sempre a maior variante;
 * - `pequena`: até ~500 px CSS em qualquer viewport — `.640` em tela 1x,
 *   a maior em tela 2x ou mais;
 * - `miniatura`: até ~200 px CSS — `.640` basta mesmo em tela 3x. Fica em
 *   `.640.webp` puro, sem avif: nas páginas de programa/evento a mesma foto
 *   aparece num `<img srcSet>` (só webp) que escolhe o `.640.webp`, e um avif
 *   aqui baixaria a foto duas vezes para poupar ~10 KB.
 */
export type TamanhoFundo = "grande" | "pequena" | "miniatura";

/** Valor `image-set()` avif + webp, ou `undefined` se a URL não é dessas fotos. */
export function imageSetLocal(src: string, tamanho: "grande" | "pequena" = "grande"): string | undefined {
  const v = variantes(src);
  if (!v) return undefined;
  const menor = v.larguras[0]!.sufixo;
  const maior = v.larguras[v.larguras.length - 1]!.sufixo;
  const opcoes: [sufixo: number, resolucao: string][] =
    tamanho === "grande"
      ? [[maior, ""]]
      : [
          [menor, " 1x"],
          [maior, " 2x"],
        ];
  const itens: string[] = [];
  for (const formato of ["avif", "webp"] as const) {
    for (const [sufixo, resolucao] of opcoes) {
      itens.push(`url("${v.base}.${sufixo}.${formato}") type("image/${formato}")${resolucao}`);
    }
  }
  return `image-set(${itens.join(", ")})`;
}

/**
 * `style` de um fundo inline: `style={fundoResponsivo(src)}`. Mantém o
 * `backgroundImage: url(...)` original e acrescenta `--fundo-set`, que a regra
 * de `globals.css` aplica onde há suporte a `image-set(... type())`.
 */
export function fundoResponsivo(src: string, tamanho: TamanhoFundo = "grande"): CSSProperties {
  if (tamanho === "miniatura") {
    const v = variantes(src);
    const menor = v ? `${v.base}.${v.larguras[0]!.sufixo}.webp` : src;
    return { backgroundImage: `url('${menor}')` };
  }
  const estilo: CSSProperties & Record<`--${string}`, string> = { backgroundImage: `url('${src}')` };
  const set = imageSetLocal(src, tamanho);
  if (set) estilo["--fundo-set"] = set;
  return estilo;
}
