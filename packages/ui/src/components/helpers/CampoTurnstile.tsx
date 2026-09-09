"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Widget do Cloudflare Turnstile.
 *
 * **Por que renderização explícita e não a implícita.** O modo implícito
 * (classe `cf-turnstile` + o api.js varrendo o DOM sozinho ao carregar) é
 * incompatível com React: o script encontra a div no HTML do servidor e
 * injeta o iframe do desafio ANTES de o React hidratar; a hidratação então
 * reconcilia essa div — que no JSX é declarada vazia — e apaga o iframe. O
 * Turnstile fica com um widget órfão ("Cannot find Widget" no console), o
 * desafio nunca completa, o token fica vazio e os handlers de /api/forms/*
 * rejeitam o envio com 400. Foi exatamente o que aconteceu em 09/09/2026.
 *
 * **Por que `onload=` e não `turnstile.ready()`.** O api.js é carregado com
 * `async`, e a Cloudflare recusa `ready()` nesse caso — lança
 * `TurnstileError: Remove async/defer ... before using turnstile.ready()`.
 * Com `async`, o caminho suportado é o parâmetro `onload` na URL do script,
 * apontando para uma função global. Ela vive no escopo do módulo (uma só,
 * compartilhada por todas as instâncias) e resolve a promessa que cada
 * componente espera antes de renderizar o seu widget.
 *
 * **Por que o `<script>` é injetado no efeito e não renderizado no JSX.**
 * Renderizado no JSX, ele vai no HTML do servidor e o browser pode executá-lo
 * antes de o bundle do cliente definir a função global — o api.js então
 * reclama ("Unable to find onload callback"). Injetando no efeito, o callback
 * já existe (é do escopo do módulo) quando o script começa a carregar.
 *
 * **Por que o input é nosso.** Com `response-field: false` o Turnstile não
 * injeta o campo dele; quem renderiza `cf-turnstile-response` é o React,
 * com o token vindo do callback. Isso mantém todo o DOM sob um dono só e
 * evita dois inputs com o mesmo `name` — que fariam
 * `form.elements.namedItem()` devolver uma RadioNodeList em vez do input,
 * quebrando a leitura do token em `enviarLead.ts` e no NewsletterForm.
 *
 * Sem `NEXT_PUBLIC_TURNSTILE_SITE_KEY` não renderiza nada — é o estado com
 * as chaves não provisionadas e também o comportamento certo em dev local.
 */

const NOME_CALLBACK = "onloadTurnstileCallback";
const URL_API =
  `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${NOME_CALLBACK}`;

interface OpcoesTurnstile {
  sitekey: string;
  language?: string;
  "response-field"?: boolean;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (codigo: string) => boolean;
}

interface ApiTurnstile {
  render(elemento: HTMLElement, opcoes: OpcoesTurnstile): string | undefined;
  remove(widgetId: string): void;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: ApiTurnstile;
    [NOME_CALLBACK]?: () => void;
  }
}

/**
 * Resolve quando o api.js terminou de carregar. Montada no escopo do módulo
 * para que a função global exista antes de o `<script>` executar — e para
 * que as N instâncias do componente na mesma página compartilhem uma só.
 */
const apiPronta: Promise<void> =
  typeof window === "undefined"
    ? new Promise<void>(() => {}) // no servidor nunca resolve; o efeito não roda lá
    : new Promise<void>((resolve) => {
        window[NOME_CALLBACK] = resolve;
        // Numa navegação client-side o script já pode ter carregado antes.
        if (window.turnstile) resolve();
      });

/** Garante um único `<script>` do api.js na página, seja qual for o número de widgets. */
function carregarApi() {
  if (document.querySelector("script[data-turnstile-api]")) return;
  const script = document.createElement("script");
  script.src = URL_API;
  script.async = true;
  script.defer = true;
  script.dataset.turnstileApi = "true";
  document.head.appendChild(script);
}

export function CampoTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey) return;

    let widgetId: string | undefined;
    let cancelado = false;
    let formulario: HTMLFormElement | null = null;

    /**
     * Cada token do Turnstile vale por um siteverify só. Sem isto, um
     * segundo envio (o usuário corrigiu um campo que o servidor recusou,
     * por exemplo) reenviaria o token já consumido e levaria 400.
     * O reset é agendado para depois do handler de submit, que lê o token
     * de forma síncrona.
     */
    const renovarApos = () => {
      window.setTimeout(() => {
        if (cancelado || !widgetId) return;
        setToken("");
        window.turnstile?.reset(widgetId);
      }, 0);
    };

    carregarApi();

    void apiPronta.then(() => {
      if (cancelado || !container.current || !window.turnstile) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        language: "pt-br",
        "response-field": false,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => {
          setToken("");
          return true;
        },
      });
      formulario = container.current.closest("form");
      formulario?.addEventListener("submit", renovarApos);
    });

    return () => {
      cancelado = true;
      formulario?.removeEventListener("submit", renovarApos);
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <div ref={container} data-turnstile />
      <input type="hidden" name="cf-turnstile-response" value={token} readOnly />
    </>
  );
}
