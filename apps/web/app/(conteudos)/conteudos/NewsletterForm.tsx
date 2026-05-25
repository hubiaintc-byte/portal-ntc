"use client";

import { useRef, useState } from "react";

import { NEWSLETTER_FORM } from "./conteudoConteudos";

/**
 * Newsletter form da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2652-2681 de 28_Pagina_Conteudos_v1.html):
 *
 * - 4 campos (nome, email, vertical select, orgão opcional) + checkbox consent.
 * - Validação inline: nome obrigatório, email regex, consent obrigatório.
 * - Submit é MOCK — não chama API real. Apenas exibe mensagem ok/err.
 * - Mensagem `is-visible` controlada por estado.
 *
 * TODO: futuro CMS — POSTar para endpoint de newsletter (Resend, p.ex.).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

type Status = "idle" | "ok" | "err";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const nome = String(data.get("nome") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const vertical = String(data.get("vertical") ?? "");
    const orgao = String(data.get("orgao") ?? "").trim();
    const consent = data.get("consent") === "on";

    const validEmail = EMAIL_REGEX.test(email);

    if (!nome || !validEmail || !consent) {
      setStatus("err");
      track("cont_newsletter_error", { hasName: !!nome, validEmail, consent });
      return;
    }

    setStatus("ok");
    track("cont_newsletter_subscribe", { vertical, hasOrg: !!orgao });
    form.reset();
  };

  return (
    <form
      ref={formRef}
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
      <button type="submit" className="btn btn--gold">
        {NEWSLETTER_FORM.botaoTexto} <span className="btn-arrow">→</span>
      </button>
      <div
        className={`cont-newsletter-msg success${status === "ok" ? " is-visible" : ""}`}
        id="contNewsletterMsgOk"
      >
        {NEWSLETTER_FORM.msgOk}
      </div>
      <div
        className={`cont-newsletter-msg error${status === "err" ? " is-visible" : ""}`}
        id="contNewsletterMsgErr"
      >
        {NEWSLETTER_FORM.msgErr}
      </div>
    </form>
  );
}
