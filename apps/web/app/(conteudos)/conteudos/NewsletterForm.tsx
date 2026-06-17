"use client";

import { useState } from "react";

import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";

import { NEWSLETTER_FORM } from "./conteudoConteudos";

/**
 * Newsletter form da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2652-2681 de 28_Pagina_Conteudos_v1.html):
 *
 * - 4 campos (nome, email, vertical select, orgão opcional) + checkbox consent.
 * - Validação inline: nome obrigatório, email regex, consent obrigatório.
 * - Submit POSTa para `/api/forms/newsletter`, que persiste um Lead
 *   { tipo: 'newsletter' } no Payload (CLAUDE.md §19.1). O servidor resolve
 *   versão da política, timestamp e IP (CLAUDE.md §12).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

type Status = "idle" | "sending" | "ok" | "err";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function montarOrigem() {
  const params = new URLSearchParams(window.location.search);
  return {
    pagina: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_term: params.get("utm_term") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
}

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const nome = String(data.get("nome") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const vertical = String(data.get("vertical") ?? "");
    const orgao = String(data.get("orgao") ?? "").trim();
    const consent = data.get("consent") !== null;

    const validEmail = EMAIL_REGEX.test(email);

    if (!nome || !validEmail || !consent) {
      setStatus("err");
      track("cont_newsletter_error", { hasName: !!nome, validEmail, consent });
      return;
    }

    setStatus("sending");
    void fetch("/api/forms/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        vertical,
        instituicao: orgao || undefined,
        origem: montarOrigem(),
        consentimentoLgpd: { aceito: true, politicaVersao: POLITICA_VERSAO_ATUAL },
      }),
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
        if (json.ok) {
          setStatus("ok");
          track("cont_newsletter_subscribe", { vertical, hasOrg: !!orgao });
          form.reset();
        } else {
          setStatus("err");
        }
      })
      .catch(() => setStatus("err"));
  };

  return (
    <form
      className="cont-newsletter-form"
      id="contNewsletterForm"
      noValidate
      onSubmit={onSubmit}
    >
      <div>
        <label htmlFor="newsletter-nome">{NEWSLETTER_FORM.labels.nome}</label>
        <input
          id="newsletter-nome"
          name="nome"
          type="text"
          placeholder={NEWSLETTER_FORM.placeholders.nome}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label htmlFor="newsletter-email">{NEWSLETTER_FORM.labels.email}</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder={NEWSLETTER_FORM.placeholders.email}
          autoComplete="email"
          required
        />
      </div>
      <div className="cont-newsletter-form-row">
        <div>
          <label htmlFor="newsletter-vertical">{NEWSLETTER_FORM.labels.vertical}</label>
          <select id="newsletter-vertical" name="vertical" defaultValue="todas">
            {NEWSLETTER_FORM.verticais.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="newsletter-org">{NEWSLETTER_FORM.labels.orgao}</label>
          <input
            id="newsletter-org"
            name="orgao"
            type="text"
            placeholder={NEWSLETTER_FORM.placeholders.orgao}
          />
        </div>
      </div>
      <label className="cont-newsletter-consent">
        <input type="checkbox" name="consent" required />
        <span dangerouslySetInnerHTML={{ __html: NEWSLETTER_FORM.consentHtml }} />
      </label>
      <button type="submit" className="btn btn--gold" disabled={status === "sending"}>
        {NEWSLETTER_FORM.botaoTexto} <span className="btn-arrow">→</span>
      </button>
      <div
        className={`cont-newsletter-msg success${status === "ok" ? " is-visible" : ""}`}
        id="contNewsletterMsgOk"
        role="status"
        aria-live="polite"
      >
        {NEWSLETTER_FORM.msgOk}
      </div>
      <div
        className={`cont-newsletter-msg error${status === "err" ? " is-visible" : ""}`}
        id="contNewsletterMsgErr"
        role="alert"
        aria-live="assertive"
      >
        {NEWSLETTER_FORM.msgErr}
      </div>
    </form>
  );
}
