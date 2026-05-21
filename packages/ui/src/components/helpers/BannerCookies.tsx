"use client";

import { useEffect, useState } from "react";

/**
 * `<BannerCookies>` — banner LGPD sticky-bottom (doc 12 §12.3, CLAUDE.md §12).
 *
 * Em mount, lê o cookie `ntc_cookies_consent_v1`. Se a versão armazenada
 * bater com `politicaVersao` (prop), não renderiza nada. Caso contrário,
 * renderiza faixa Pergaminho na base da tela com checkboxes desmarcados
 * para categorias além de "essencial" e dois botões.
 *
 * "Essencial" sempre ativa. Sem backdrop. ESC não fecha (LGPD exige
 * escolha explícita).
 */

type Categoria = "essencial" | "analytics" | "marketing";

interface BannerCookiesProps {
  politicaVersao: string;
  categorias?: Categoria[];
}

const NOME_COOKIE = "ntc_cookies_consent_v1";

interface ConsentimentoArmazenado {
  versao: string;
  timestamp: string;
  categorias: Categoria[];
}

function lerCookie(): ConsentimentoArmazenado | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${NOME_COOKIE}=`));
  if (!par) return null;
  try {
    return JSON.parse(decodeURIComponent(par.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

function escreverCookie(valor: ConsentimentoArmazenado) {
  if (typeof document === "undefined") return;
  const seguro =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NOME_COOKIE}=${encodeURIComponent(
    JSON.stringify(valor),
  )}; path=/; max-age=31536000; SameSite=Lax${seguro}`;
}

const ROTULOS: Record<Categoria, string> = {
  essencial: "Essenciais (necessárias)",
  analytics: "Estatísticas de navegação",
  marketing: "Comunicação institucional",
};

export function BannerCookies({
  politicaVersao,
  categorias = ["essencial", "analytics", "marketing"],
}: BannerCookiesProps) {
  const [visivel, setVisivel] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Categoria[]>(["essencial"]);

  useEffect(() => {
    const atual = lerCookie();
    if (!atual || atual.versao !== politicaVersao) setVisivel(true);
  }, [politicaVersao]);

  if (!visivel) return null;

  const opcionais = categorias.filter((c) => c !== "essencial");

  const toggle = (c: Categoria) => {
    setSelecionadas((arr) => (arr.includes(c) ? arr.filter((x) => x !== c) : [...arr, c]));
  };

  const aceitar = (todas: boolean) => {
    const final: Categoria[] = todas
      ? Array.from(new Set<Categoria>(["essencial", ...selecionadas]))
      : ["essencial"];
    escreverCookie({
      versao: politicaVersao,
      timestamp: new Date().toISOString(),
      categorias: final,
    });
    setVisivel(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de privacidade"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-oxford bg-pergaminho shadow-2xl"
    >
      <div className="mx-auto flex max-w-[var(--container-editorial)] flex-col gap-4 px-[var(--spacing-margem-editorial)] py-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[60ch]">
          <p className="font-corpo text-corpo text-grafite">
            Usamos cookies para garantir a navegação institucional e, com seu consentimento, para
            estatísticas e comunicação. Leia nossa{" "}
            <a
              href="/politica-de-privacidade"
              className="underline decoration-oxford underline-offset-2 hover:text-cardeal"
            >
              Política de Privacidade
            </a>
            .
          </p>
          {opcionais.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-4">
              {opcionais.map((c) => (
                <label key={c} className="flex items-center gap-2 font-corpo text-pequeno text-grafite">
                  <input
                    type="checkbox"
                    checked={selecionadas.includes(c)}
                    onChange={() => toggle(c)}
                    className="size-4 border-linha-sutil text-oxford focus:ring-oxford"
                  />
                  {ROTULOS[c]}
                </label>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => aceitar(false)}
            className="inline-flex items-center justify-center border border-oxford px-5 py-2.5 font-corpo text-pequeno uppercase tracking-[0.12em] text-oxford hover:bg-oxford hover:text-pergaminho"
          >
            Aceitar essenciais
          </button>
          <button
            type="button"
            onClick={() => aceitar(true)}
            className="inline-flex items-center justify-center bg-oxford px-5 py-2.5 font-corpo text-pequeno uppercase tracking-[0.12em] text-pergaminho hover:bg-oxford-claro"
          >
            Aceitar selecionados
          </button>
        </div>
      </div>
    </div>
  );
}
