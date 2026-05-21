"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { ZodTypeAny } from "zod";

import { FormularioContexto } from "./contexto";
import type { FormularioContextValue, FormularioResposta } from "./tipos";
import { BotaoSoberano } from "./BotaoSoberano";

/**
 * `<FormularioSoberano>` — orquestrador de formulários institucionais
 * (doc 12 §9). Coleta valores via Context, valida client-side com Zod,
 * envia ao endpoint indicado e mostra `estadoSucesso` ao receber 200.
 *
 * O front injeta automaticamente no submit:
 * - `origem`: pagina (window.location.pathname), referrer, UTMs (querystring).
 * - `consentimentoLgpd.politicaVersao`: prop `politicaVersao`.
 *
 * Erros 422 do servidor populam `erros` no contexto (lookup por nome de campo).
 */

interface FormularioSoberanoProps {
  endpoint: string;
  schema: ZodTypeAny;
  titulo: string;
  eyebrow?: string;
  descricao?: string;
  politicaVersao: string;
  estadoSucesso: ReactNode;
  textoBotao?: string;
  contextoAdicional?: Record<string, unknown>;
  multipart?: boolean;
  children: ReactNode;
}

function capturarUtms(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => params.get(k) ?? undefined;
  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_term: get("utm_term"),
    utm_content: get("utm_content"),
  };
}

function montaOrigem() {
  if (typeof window === "undefined") return { pagina: "/" };
  return {
    pagina: window.location.pathname,
    referrer: document.referrer || undefined,
    ...capturarUtms(),
  };
}

function valorTemArquivo(v: unknown): v is File {
  return typeof File !== "undefined" && v instanceof File;
}

function temArquivo(valores: Record<string, unknown>): boolean {
  return Object.values(valores).some(valorTemArquivo);
}

function montaFormData(valores: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(valores)) {
    if (valorTemArquivo(v)) {
      fd.append(k, v);
    } else if (v === undefined || v === null) {
      // skip
    } else if (typeof v === "object") {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, String(v));
    }
  }
  return fd;
}

export function FormularioSoberano({
  endpoint,
  schema,
  titulo,
  eyebrow,
  descricao,
  politicaVersao,
  estadoSucesso,
  textoBotao = "Enviar",
  contextoAdicional,
  multipart,
  children,
}: FormularioSoberanoProps) {
  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [resposta, setResposta] = useState<FormularioResposta | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const setCampo = useCallback((nome: string, valor: unknown) => {
    setValores((v) => ({ ...v, [nome]: valor }));
  }, []);

  const marcarTocado = useCallback((nome: string) => {
    setTocados((t) => (t[nome] ? t : { ...t, [nome]: true }));
  }, []);

  const ctxValue = useMemo<FormularioContextValue>(
    () => ({ valores, erros, tocados, enviando, setCampo, marcarTocado }),
    [valores, erros, tocados, enviando, setCampo, marcarTocado],
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviando) return;

    const payload = {
      ...valores,
      ...contextoAdicional,
      origem: montaOrigem(),
      consentimentoLgpd: {
        aceito: valores.aceiteLgpd === true,
        politicaVersao,
      },
    };

    const validacao = schema.safeParse(payload);
    if (!validacao.success) {
      const novosErros: Record<string, string> = {};
      for (const issue of validacao.error.issues) {
        const chave = issue.path.join(".");
        if (!novosErros[chave]) novosErros[chave] = issue.message;
      }
      setErros(novosErros);
      setTocados((t) => {
        const novo = { ...t };
        for (const k of Object.keys(novosErros)) novo[k] = true;
        return novo;
      });
      const primeiroErro = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      primeiroErro?.scrollIntoView({ behavior: "smooth", block: "center" });
      primeiroErro?.focus();
      return;
    }

    setEnviando(true);
    setErros({});

    try {
      const usaMultipart = multipart || temArquivo(valores);
      const body = usaMultipart ? montaFormData(payload) : JSON.stringify(payload);
      const headers: HeadersInit = usaMultipart
        ? { Accept: "application/json" }
        : { "Content-Type": "application/json", Accept: "application/json" };

      const r = await fetch(endpoint, { method: "POST", body, headers });
      const data = (await r.json().catch(() => null)) as FormularioResposta | null;

      if (r.ok && data && data.ok) {
        setResposta(data);
      } else if (r.status === 422 && data && !data.ok && data.erros) {
        setErros(data.erros);
        setTocados((t) => {
          const novo = { ...t };
          for (const k of Object.keys(data.erros ?? {})) novo[k] = true;
          return novo;
        });
      } else if (r.status === 429) {
        setResposta({
          ok: false,
          message:
            "Recebemos muitas requisições deste IP em pouco tempo. Aguarde alguns minutos e tente novamente.",
        });
      } else {
        setResposta({
          ok: false,
          message:
            data?.ok === false && data?.message
              ? data.message
              : "Não foi possível enviar agora. Tente novamente em instantes.",
        });
      }
    } catch {
      setResposta({
        ok: false,
        message: "Falha de rede. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  if (resposta && resposta.ok) {
    return <div className="font-corpo">{estadoSucesso}</div>;
  }

  return (
    <FormularioContexto.Provider value={ctxValue}>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-8"
        aria-busy={enviando ? "true" : undefined}
      >
        <header className="flex flex-col gap-3">
          {eyebrow ? (
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-dourado">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-h2 font-titulo text-oxford">{titulo}</h2>
          {descricao ? (
            <p className="max-w-[60ch] font-corpo text-corpo text-grafite">{descricao}</p>
          ) : null}
        </header>

        <div className="flex flex-col gap-6">{children}</div>

        {resposta && !resposta.ok ? (
          <p
            role="alert"
            className="border-l-2 border-vermelho-erro pl-4 font-corpo text-pequeno text-vermelho-erro"
          >
            {resposta.message}
          </p>
        ) : null}

        <div>
          <BotaoSoberano variante="primario" type="submit" carregando={enviando}>
            {textoBotao}
          </BotaoSoberano>
        </div>
      </form>
    </FormularioContexto.Provider>
  );
}
