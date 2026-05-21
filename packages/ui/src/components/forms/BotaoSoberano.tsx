import type { ReactNode } from "react";

/**
 * `<BotaoSoberano>` — botão e link institucional (doc 12 §9.3).
 *
 * Server-safe: sem hooks. Discriminator por presença de `href` — vira
 * `<a>` quando link, `<button>` quando ação.
 */

type Variante = "primario" | "secundario" | "fantasma" | "editorial";
type Tamanho = "medio" | "amplo";

interface BotaoBaseProps {
  variante: Variante;
  tamanho?: Tamanho;
  children: ReactNode;
  className?: string;
}

interface BotaoLinkProps extends BotaoBaseProps {
  href: string;
  externo?: boolean;
}

interface BotaoAcaoProps extends BotaoBaseProps {
  type?: "button" | "submit";
  disabled?: boolean;
  carregando?: boolean;
  onClick?: () => void;
}

export type BotaoSoberanoProps = BotaoLinkProps | BotaoAcaoProps;

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-oxford text-pergaminho border border-oxford hover:bg-oxford-claro hover:border-oxford-claro",
  secundario:
    "bg-transparent text-oxford border border-oxford hover:bg-oxford hover:text-pergaminho",
  fantasma:
    "bg-transparent text-oxford border-0 underline-offset-4 hover:underline decoration-oxford",
  editorial:
    "bg-transparent text-oxford border-0 font-titulo italic text-h4 hover:text-cardeal",
};

const TAMANHOS: Record<Tamanho, string> = {
  medio: "px-6 py-3 text-corpo",
  amplo: "px-10 py-4 text-corpo",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-corpo uppercase tracking-[0.12em] transition-colors duration-[250ms] ease-out disabled:opacity-60 disabled:cursor-not-allowed";

const BASE_EDITORIAL =
  "inline-flex items-center justify-center gap-2 transition-colors duration-[250ms] ease-out disabled:opacity-60 disabled:cursor-not-allowed";

function classes(variante: Variante, tamanho: Tamanho, extra?: string) {
  const base = variante === "editorial" ? BASE_EDITORIAL : BASE;
  const t = variante === "editorial" ? "" : TAMANHOS[tamanho];
  return [base, VARIANTES[variante], t, extra].filter(Boolean).join(" ");
}

function isLink(props: BotaoSoberanoProps): props is BotaoLinkProps {
  return "href" in props && typeof props.href === "string";
}

export function BotaoSoberano(props: BotaoSoberanoProps) {
  const tamanho = props.tamanho ?? "medio";

  if (isLink(props)) {
    const externo = props.externo === true;
    return (
      <a
        href={props.href}
        className={classes(props.variante, tamanho, props.className)}
        {...(externo
          ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${stringifyChildren(props.children)} (abre em nova aba)` }
          : null)}
      >
        {props.children}
      </a>
    );
  }

  const carregando = props.carregando === true;
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled || carregando}
      className={classes(props.variante, tamanho, props.className)}
      aria-busy={carregando ? "true" : undefined}
    >
      {carregando ? <IndicadorEditorial /> : props.children}
    </button>
  );
}

function IndicadorEditorial() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span className="size-1 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
      <span className="size-1 animate-pulse rounded-full bg-current [animation-delay:200ms]" />
      <span className="size-1 animate-pulse rounded-full bg-current [animation-delay:400ms]" />
    </span>
  );
}

function stringifyChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  return "Abrir link";
}
