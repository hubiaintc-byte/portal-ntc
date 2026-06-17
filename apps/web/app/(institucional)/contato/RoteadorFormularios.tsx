"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  type ReactNode,
} from "react";

import {
  BULK_INSCRITOS_RANGES,
  FORMS_ASIDES,
  OPTION_PROGRAMA_CUSTOMIZADO,
  OPTIONS_ASSUNTO_ATENDIMENTO,
  OPTIONS_FATURAMENTO,
  OPTIONS_INSCRITOS_EQUIPE,
  OPTIONS_MODALIDADE,
  OPTIONS_NATUREZA_JURIDICA,
  OPTIONS_ORCAMENTO,
  OPTIONS_PARTICIPANTES,
  OPTIONS_PRAZO,
  OPTIONS_PROGRAMA_PROP,
  OPTIONS_TIPO_IMPRENSA,
  OPTIONS_VERTICAL_PROP,
  TABS,
  type FormAsideConfig,
  type TabId,
} from "./conteudoContato";
import { enviarLead } from "./enviarLead";

/* ============================================================
 * Constantes
 * ============================================================ */

const TAB_IDS: readonly TabId[] = ["atendimento", "proposta", "equipe", "imprensa"];
const TAB_HASH_MAP: Record<string, TabId> = {
  "#tab-atendimento": "atendimento",
  "#tab-proposta": "proposta",
  "#tab-equipe": "equipe",
  "#tab-imprensa": "imprensa",
};
// Modalidades vindas dos CTAs de programa → value do <select name="modalidade">.
// O select tem incompany-presencial/online/hibrido; o link manda só "incompany".
const MODALIDADE_LINK_PARA_SELECT: Record<string, string> = {
  incompany: "incompany-presencial",
  "sob-medida": "sob-medida",
  trilha: "trilha",
};

// Assuntos vindos dos CTAs → texto funcional pré-preenchido no contexto.
const ASSUNTO_LINK_PARA_TEXTO: Record<string, string> = {
  folder: "Gostaria de receber o folder do programa.",
  detalhes: "Gostaria de receber mais detalhes sobre o programa.",
  inscricao: "Tenho interesse em inscrição para este programa.",
};

const HEADER_OFFSET = 88;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCEPTED_BULK_EXT = ["xlsx", "xls", "csv"] as const;
const MAX_BULK_FILE_SIZE = 5 * 1024 * 1024;

const ASIDE_POR_TAB: Record<TabId, FormAsideConfig> = Object.fromEntries(
  FORMS_ASIDES.map((f) => [f.tab, f]),
) as Record<TabId, FormAsideConfig>;

/* ============================================================
 * Helpers de validação (compartilhados pelos 4 forms)
 * ============================================================ */

function setError(wrap: Element | null, hasError: boolean) {
  if (wrap) wrap.classList.toggle("has-error", hasError);
}

function validarCampo(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): boolean {
  const wrap = input.closest(".form-field") ?? input.closest(".file-field");
  let ok = true;

  if (input instanceof HTMLInputElement && input.type === "file") {
    if (input.hasAttribute("required") && (!input.files || input.files.length === 0)) {
      ok = false;
    }
  } else {
    if (input.hasAttribute("required") && !String(input.value || "").trim()) {
      ok = false;
    }
    if (
      ok &&
      input instanceof HTMLInputElement &&
      input.type === "email" &&
      input.value &&
      !RE_EMAIL.test(input.value.trim())
    ) {
      ok = false;
    }
    if (ok && input instanceof HTMLTextAreaElement && input.hasAttribute("minlength")) {
      const min = Number(input.getAttribute("minlength")) || 0;
      if (String(input.value || "").trim().length < min) ok = false;
    }
  }

  setError(wrap, !ok);
  return ok;
}

type StatusKind = "idle" | "sending" | "ok" | "error";
interface FormStatusState {
  kind: StatusKind;
  mensagem: string;
}
const STATUS_INICIAL: FormStatusState = { kind: "idle", mensagem: "" };

/* ============================================================
 * RoteadorFormularios — entrada do componente
 * ============================================================ */

export function RoteadorFormularios() {
  const [tabAtiva, setTabAtiva] = useState<TabId>("atendimento");
  const [bulkAtivo, setBulkAtivo] = useState(false);
  const [statusAtendimento, setStatusAtendimento] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusProposta, setStatusProposta] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusEquipe, setStatusEquipe] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusImprensa, setStatusImprensa] = useState<FormStatusState>(STATUS_INICIAL);
  const [nomeArquivoBulk, setNomeArquivoBulk] = useState(
    "Selecionar arquivo .xlsx / .xls / .csv",
  );

  const refTabAtendimento = useRef<HTMLButtonElement>(null);
  const refTabProposta = useRef<HTMLButtonElement>(null);
  const refTabEquipe = useRef<HTMLButtonElement>(null);
  const refTabImprensa = useRef<HTMLButtonElement>(null);
  const refsTabs: Record<TabId, RefObject<HTMLButtonElement | null>> = {
    atendimento: refTabAtendimento,
    proposta: refTabProposta,
    equipe: refTabEquipe,
    imprensa: refTabImprensa,
  };
  const refSecaoForms = useRef<HTMLElement>(null);
  const refSelectVerticalProp = useRef<HTMLSelectElement>(null);
  const refSelectInscritosEq = useRef<HTMLSelectElement>(null);
  const refInputEvento = useRef<HTMLInputElement>(null);
  const refInputEventoUrl = useRef<HTMLInputElement>(null);
  const refInputPlanilha = useRef<HTMLInputElement>(null);
  const refConsentLote = useRef<HTMLInputElement>(null);

  const scrollToForms = useCallback(() => {
    const el = refSecaoForms.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const prefillVertical = useCallback((verticalKey: string) => {
    const select = refSelectVerticalProp.current;
    if (!select) return;
    const has = Array.from(select.options).some((o) => o.value === verticalKey);
    if (!has) return;
    select.value = verticalKey;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const wrap = select.closest<HTMLElement>(".form-field");
    if (wrap) {
      wrap.style.transition = "box-shadow 320ms";
      wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
      setTimeout(() => {
        wrap.style.boxShadow = "";
      }, 1400);
    }
    // TODO: analytics quando dataLayer estiver configurado
  }, []);

  const prefillSelectPorId = useCallback((id: string, value: string) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLSelectElement)) return;
    const has = Array.from(el.options).some((o) => o.value === value);
    if (!has) return;
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    const wrap = el.closest<HTMLElement>(".form-field");
    if (wrap) {
      wrap.style.transition = "box-shadow 320ms";
      wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
      setTimeout(() => {
        wrap.style.boxShadow = "";
      }, 1400);
    }
  }, []);

  const ativarTab = useCallback(
    (id: TabId, options?: { scroll?: boolean; prefillVerticalKey?: string }) => {
      setTabAtiva(id);
      if (options?.scroll) {
        // setTimeout porque o painel só fica visível após o setState aplicar
        setTimeout(() => scrollToForms(), 0);
      }
      if (options?.prefillVerticalKey && id === "proposta") {
        const key = options.prefillVerticalKey;
        setTimeout(() => prefillVertical(key), 0);
      }
      // TODO: analytics quando dataLayer estiver configurado
    },
    [prefillVertical, scrollToForms],
  );

  /* ── Effect: hash inicial + querystring autofill (mount only) ── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && TAB_HASH_MAP[hash]) {
      ativarTab(TAB_HASH_MAP[hash], { scroll: true });
    }

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const evento = params.get("evento");
      const eventoUrl = params.get("evento_url");
      if (evento || eventoUrl) {
        if (refInputEvento.current && evento) {
          refInputEvento.current.value = eventoUrl ? `${evento} — ${eventoUrl}` : evento;
        }
        if (refInputEventoUrl.current && eventoUrl) {
          refInputEventoUrl.current.value = eventoUrl;
        }
        const wrap = refInputEvento.current?.closest<HTMLElement>(".form-field");
        if (wrap) {
          wrap.style.transition = "box-shadow 320ms";
          wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
          setTimeout(() => {
            wrap.style.boxShadow = "";
          }, 1800);
        }
        // TODO: analytics quando dataLayer estiver configurado
      }

      const programa = params.get("programa");
      const modalidade = params.get("modalidade");
      const assunto = params.get("assunto");

      if (programa || modalidade || assunto) {
        ativarTab("proposta", { scroll: true });

        // setTimeout(0): o painel proposta só monta os campos após o setState da aba.
        setTimeout(() => {
          if (programa) {
            prefillSelectPorId("prop-programa", programa.toUpperCase());
          }
          if (modalidade) {
            const value = MODALIDADE_LINK_PARA_SELECT[modalidade];
            if (value) prefillSelectPorId("prop-modalidade", value);
          }
          if (assunto) {
            const texto = ASSUNTO_LINK_PARA_TEXTO[assunto];
            const ctx = document.getElementById("prop-contexto");
            if (texto && ctx instanceof HTMLTextAreaElement && !ctx.value.trim()) {
              ctx.value = texto;
            }
          }
        }, 0);
      }

      if (window.history?.replaceState) {
        const clean = window.location.pathname + (window.location.hash || "");
        window.history.replaceState(null, "", clean);
      }
    }
  }, [ativarTab, prefillSelectPorId]);

  /* ── Effect: handler global para <a href^="#tab-"> ── */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#tab-"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !TAB_HASH_MAP[href]) return;
      event.preventDefault();
      const preset = anchor.getAttribute("data-vertical-preset") ?? undefined;
      ativarTab(TAB_HASH_MAP[href], { scroll: true, prefillVerticalKey: preset });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [ativarTab]);

  const onKeyDownTab = (event: KeyboardEvent<HTMLButtonElement>, id: TabId) => {
    const idx = TAB_IDS.indexOf(id);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = TAB_IDS[(idx + 1) % TAB_IDS.length]!;
      refsTabs[next].current?.focus();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length]!;
      refsTabs[prev].current?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      refsTabs[TAB_IDS[0]!].current?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      refsTabs[TAB_IDS[TAB_IDS.length - 1]!].current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ativarTab(id);
    }
  };

  const onChangeInscritosEq = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    const ativo = BULK_INSCRITOS_RANGES.has(value);
    setBulkAtivo(ativo);
    if (!ativo) {
      if (refInputPlanilha.current) {
        refInputPlanilha.current.value = "";
        const fieldWrap = refInputPlanilha.current.closest<HTMLElement>(".file-field");
        if (fieldWrap) fieldWrap.classList.remove("has-error");
      }
      if (refConsentLote.current) refConsentLote.current.checked = false;
      setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
    }
    // TODO: analytics quando dataLayer estiver configurado
  };

  const onChangePlanilha = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const fieldWrap = input.closest<HTMLElement>(".file-field");
    const file = input.files?.[0];
    if (!file) {
      setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
      const wrap = document.getElementById("eq-planilha-wrap");
      if (wrap) wrap.classList.remove("has-file");
      return;
    }
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    let invalidReason = "";
    if (!ACCEPTED_BULK_EXT.includes(ext as (typeof ACCEPTED_BULK_EXT)[number])) {
      invalidReason = "Formato não suportado.";
    } else if (file.size > MAX_BULK_FILE_SIZE) {
      invalidReason = "Arquivo acima de 5 MB.";
    }
    const wrap = document.getElementById("eq-planilha-wrap");
    if (invalidReason) {
      setNomeArquivoBulk(`${invalidReason} Selecione outro arquivo.`);
      wrap?.classList.remove("has-file");
      if (fieldWrap) fieldWrap.classList.add("has-error");
      input.value = "";
      // TODO: analytics quando dataLayer estiver configurado
    } else {
      const kb = Math.round(file.size / 1024);
      const sizeStr = kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;
      setNomeArquivoBulk(`${file.name} · ${sizeStr}`);
      wrap?.classList.add("has-file");
      if (fieldWrap) fieldWrap.classList.remove("has-error");
      // TODO: analytics quando dataLayer estiver configurado
    }
  };

  const handleSubmit = useCallback(
    (
      kind: TabId,
      setStatus: (s: FormStatusState) => void,
      extra?: { exigirConsentLote?: boolean },
    ) =>
      (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        let allOk = true;
        form
          .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
            "input, select, textarea",
          )
          .forEach((field) => {
            if (!validarCampo(field)) allOk = false;
          });

        const consent = form.querySelector<HTMLInputElement>(
          'input[type="checkbox"][name="lgpd"]',
        );
        if (consent) {
          const wrap = consent.closest<HTMLElement>(".form-consent");
          if (!consent.checked) {
            allOk = false;
            if (wrap) wrap.style.outline = "2px solid var(--cardeal)";
            // TODO: analytics quando dataLayer estiver configurado
          } else if (wrap) {
            wrap.style.outline = "";
          }
        }

        if (extra?.exigirConsentLote) {
          const consentLote = form.querySelector<HTMLInputElement>(
            'input[type="checkbox"][name="lgpd_lote"]',
          );
          if (consentLote) {
            const wrap = consentLote.closest<HTMLElement>(".form-consent");
            if (!consentLote.checked) {
              allOk = false;
              if (wrap) wrap.style.outline = "2px solid var(--cardeal)";
              // TODO: analytics quando dataLayer estiver configurado
            } else if (wrap) {
              wrap.style.outline = "";
            }
          }
        }

        if (!allOk) {
          setStatus({ kind: "error", mensagem: "Verifique os campos destacados." });
          // TODO: analytics quando dataLayer estiver configurado
          const firstErr = form.querySelector<HTMLElement>(".has-error");
          firstErr
            ?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
              "input, select, textarea",
            )
            ?.focus();
          return;
        }

        setStatus({ kind: "sending", mensagem: "Enviando…" });
        void enviarLead(kind, form)
          .then((res) => {
            if (res.ok) {
              setStatus({
                kind: "ok",
                mensagem:
                  res.message ||
                  "Mensagem registrada · você receberá retorno em horário comercial.",
              });
              form.reset();
              if (kind === "equipe") {
                setBulkAtivo(false);
                setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
              }
            } else {
              setStatus({
                kind: "error",
                mensagem:
                  res.message || "Não foi possível enviar agora. Tente novamente em instantes.",
              });
            }
          })
          .catch(() => {
            setStatus({
              kind: "error",
              mensagem: "Falha de conexão. Verifique sua internet e tente novamente.",
            });
          });
      },
    [],
  );

  return (
    <>
      <section
        className="router"
        id="formularios"
        aria-label="Roteador de formulários institucionais"
      >
        <div className="container">
          <div className="router-head fade-in">
            <h2>Escolha o canal mais adequado à sua demanda</h2>
            <span className="eyebrow gold" style={{ margin: 0 }}>
              Cada solicitação é direcionada à equipe responsável, com atendimento humano e
              retorno em horário comercial.
            </span>
          </div>

          <div className="router-tabs" role="tablist" aria-label="Tipos de demanda">
            {TABS.map((tab) => {
              const isActive = tabAtiva === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={refsTabs[tab.id]}
                  type="button"
                  className={`router-tab${isActive ? " is-active" : ""}`}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  data-tab={tab.id}
                  data-cms-link={tab.cmsLink}
                  onClick={() => ativarTab(tab.id)}
                  onKeyDown={(e) => onKeyDownTab(e, tab.id)}
                >
                  <span className="tab-num">{tab.numero}</span>
                  <h3>{tab.titulo}</h3>
                  <p>{tab.descricao}</p>
                  <span className="tab-foot">{tab.ctaFooter}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="forms-wrap"
        aria-label="Formulários institucionais"
        ref={refSecaoForms}
      >
        <div className="container">
          <PainelAtendimento
            tabAtiva={tabAtiva}
            status={statusAtendimento}
            onSubmit={handleSubmit("atendimento", setStatusAtendimento)}
          />

          <PainelProposta
            tabAtiva={tabAtiva}
            status={statusProposta}
            refSelectVertical={refSelectVerticalProp}
            onSubmit={handleSubmit("proposta", setStatusProposta)}
          />

          <PainelEquipe
            tabAtiva={tabAtiva}
            status={statusEquipe}
            bulkAtivo={bulkAtivo}
            nomeArquivoBulk={nomeArquivoBulk}
            refInputEvento={refInputEvento}
            refInputEventoUrl={refInputEventoUrl}
            refSelectInscritos={refSelectInscritosEq}
            refInputPlanilha={refInputPlanilha}
            refConsentLote={refConsentLote}
            onChangeInscritos={onChangeInscritosEq}
            onChangePlanilha={onChangePlanilha}
            onSubmit={handleSubmit("equipe", setStatusEquipe, {
              exigirConsentLote: bulkAtivo,
            })}
          />

          <PainelImprensa
            tabAtiva={tabAtiva}
            status={statusImprensa}
            onSubmit={handleSubmit("imprensa", setStatusImprensa)}
          />
        </div>
      </section>
    </>
  );
}

/* ============================================================
 * Helpers de render compartilhados
 * ============================================================ */

interface PainelBaseProps {
  tabAtiva: TabId;
  status: FormStatusState;
}

function PanelShell({
  tab,
  ativa,
  children,
}: {
  tab: TabId;
  ativa: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`form-panel${ativa ? " is-active" : ""}`}
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      hidden={!ativa}
    >
      <div className="form-shell">{children}</div>
    </div>
  );
}

function FormStatus({ status, id }: { status: FormStatusState; id: string }) {
  const cls =
    status.kind === "ok"
      ? "form-status is-ok"
      : status.kind === "error"
        ? "form-status is-error"
        : "form-status";
  return (
    <span className={cls} id={id} aria-live="polite">
      {status.mensagem}
    </span>
  );
}

function AsideForm({ aside }: { aside: FormAsideConfig["aside"] }) {
  return (
    <aside className="form-aside">
      <p className="eyebrow">{aside.eyebrow}</p>
      <h3>{aside.titulo}</h3>
      <p dangerouslySetInnerHTML={{ __html: aside.descricaoHtml }} />
      <ul>
        {aside.bulletsHtml.map((b, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
        ))}
      </ul>
      <p
        className="aside-foot"
        dangerouslySetInnerHTML={{ __html: aside.rodapeHtml }}
      />
    </aside>
  );
}

/* ============================================================
 * PAINEL A · ATENDIMENTO GERAL
 * ============================================================ */

interface PainelAtendimentoProps extends PainelBaseProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelAtendimento({ tabAtiva, status, onSubmit }: PainelAtendimentoProps) {
  const cfg = ASIDE_POR_TAB.atendimento;
  return (
    <PanelShell tab="atendimento" ativa={tabAtiva === "atendimento"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-atendimento"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="atend-nome">
              Nome completo<span className="req">*</span>
            </label>
            <input type="text" id="atend-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome completo.</span>
          </div>

          <div className="form-field">
            <label htmlFor="atend-instituicao">Instituição / órgão</label>
            <input
              type="text"
              id="atend-instituicao"
              name="instituicao"
              autoComplete="organization"
            />
          </div>

          <div className="form-field">
            <label htmlFor="atend-email">
              E-mail<span className="req">*</span>
            </label>
            <input type="email" id="atend-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="atend-telefone">Telefone / WhatsApp</label>
            <input
              type="tel"
              id="atend-telefone"
              name="telefone"
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
          </div>

          <div className="form-field full">
            <label htmlFor="atend-assunto">
              Assunto<span className="req">*</span>
            </label>
            <select id="atend-assunto" name="assunto" required defaultValue="">
              <option value="">Selecione um assunto</option>
              {OPTIONS_ASSUNTO_ATENDIMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione um assunto.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="atend-mensagem">
              Mensagem<span className="req">*</span>
            </label>
            <textarea
              id="atend-mensagem"
              name="mensagem"
              required
              minLength={20}
              placeholder="Descreva sua demanda. Quanto mais contexto, mais preciso o retorno."
            />
            <span className="hint">Mínimo 20 caracteres.</span>
            <span className="err-msg">
              Descreva sua mensagem com pelo menos 20 caracteres.
            </span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="atend-lgpd" name="lgpd" required />
            <label htmlFor="atend-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para
              atendimento desta solicitação, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD (Lei 13.709/2018).
            </label>
          </div>

          <div className="form-actions full">
            <button
              type="submit"
              className="btn btn--primary"
              data-cms-link="enviar-atendimento"
              disabled={status.kind === "sending"}
            >
              Enviar mensagem <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-atendimento" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}

/* ============================================================
 * PAINEL B · PROPOSTA INSTITUCIONAL
 * ============================================================ */

interface PainelPropostaProps extends PainelBaseProps {
  refSelectVertical: RefObject<HTMLSelectElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelProposta({
  tabAtiva,
  status,
  refSelectVertical,
  onSubmit,
}: PainelPropostaProps) {
  const cfg = ASIDE_POR_TAB.proposta;
  return (
    <PanelShell tab="proposta" ativa={tabAtiva === "proposta"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-proposta"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="prop-nome">
              Nome do solicitante<span className="req">*</span>
            </label>
            <input type="text" id="prop-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-cargo">Cargo / função</label>
            <input
              type="text"
              id="prop-cargo"
              name="cargo"
              autoComplete="organization-title"
              placeholder="Ex.: Secretário, Diretor de RH, Coordenador"
            />
          </div>

          <div className="form-field">
            <label htmlFor="prop-instituicao">
              Instituição / órgão<span className="req">*</span>
            </label>
            <input
              type="text"
              id="prop-instituicao"
              name="instituicao"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe a instituição.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-natureza">
              Natureza jurídica<span className="req">*</span>
            </label>
            <select id="prop-natureza" name="natureza" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_NATUREZA_JURIDICA.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a natureza jurídica.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-email">
              E-mail institucional<span className="req">*</span>
            </label>
            <input type="email" id="prop-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-telefone">
              Telefone / WhatsApp<span className="req">*</span>
            </label>
            <input
              type="tel"
              id="prop-telefone"
              name="telefone"
              required
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
            <span className="err-msg">Informe um telefone para contato.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-vertical">
              Vertical de interesse<span className="req">*</span>
            </label>
            <select
              id="prop-vertical"
              name="vertical"
              required
              defaultValue=""
              ref={refSelectVertical}
            >
              <option value="">Selecione</option>
              {OPTIONS_VERTICAL_PROP.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a vertical.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-programa">Programa de interesse</label>
            <select id="prop-programa" name="programa" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PROGRAMA_PROP.map((og) => (
                <optgroup key={og.grupo} label={og.grupo}>
                  {og.opcoes.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={OPTION_PROGRAMA_CUSTOMIZADO.value}>
                {OPTION_PROGRAMA_CUSTOMIZADO.label}
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-modalidade">Modalidade preferencial</label>
            <select id="prop-modalidade" name="modalidade" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_MODALIDADE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-participantes">Nº estimado de participantes</label>
            <select id="prop-participantes" name="participantes" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PARTICIPANTES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-prazo">Prazo previsto para execução</label>
            <select id="prop-prazo" name="prazo" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PRAZO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-orcamento">Faixa orçamentária estimada</label>
            <select id="prop-orcamento" name="orcamento" defaultValue="">
              <option value="">Selecione (opcional · confidencial)</option>
              {OPTIONS_ORCAMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field full">
            <label htmlFor="prop-contexto">
              Contexto e objetivos institucionais<span className="req">*</span>
            </label>
            <textarea
              id="prop-contexto"
              name="contexto"
              required
              minLength={40}
              placeholder="Cenário institucional, objetivos formativos, público-alvo e marcos temporais relevantes (planejamento, ciclo fiscal, agenda de governo)."
            />
            <span className="hint">
              Mínimo 40 caracteres · quanto mais contexto, mais precisa a proposta.
            </span>
            <span className="err-msg">
              Descreva o contexto institucional com pelo menos 40 caracteres.
            </span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="prop-lgpd" name="lgpd" required />
            <label htmlFor="prop-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para
              elaboração da proposta solicitada, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD (Lei 13.709/2018).
            </label>
          </div>

          <div className="form-actions full">
            <button
              type="submit"
              className="btn btn--gold"
              data-cms-link="enviar-proposta"
              disabled={status.kind === "sending"}
            >
              Enviar solicitação de proposta <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-proposta" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}

/* ============================================================
 * PAINEL C · INSCRIÇÃO EM GRUPO
 * ============================================================ */

interface PainelEquipeProps extends PainelBaseProps {
  bulkAtivo: boolean;
  nomeArquivoBulk: string;
  refInputEvento: RefObject<HTMLInputElement | null>;
  refInputEventoUrl: RefObject<HTMLInputElement | null>;
  refSelectInscritos: RefObject<HTMLSelectElement | null>;
  refInputPlanilha: RefObject<HTMLInputElement | null>;
  refConsentLote: RefObject<HTMLInputElement | null>;
  onChangeInscritos: (event: FormEvent<HTMLSelectElement>) => void;
  onChangePlanilha: (event: FormEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelEquipe({
  tabAtiva,
  status,
  bulkAtivo,
  nomeArquivoBulk,
  refInputEvento,
  refInputEventoUrl,
  refSelectInscritos,
  refInputPlanilha,
  refConsentLote,
  onChangeInscritos,
  onChangePlanilha,
  onSubmit,
}: PainelEquipeProps) {
  const cfg = ASIDE_POR_TAB.equipe;
  return (
    <PanelShell tab="equipe" ativa={tabAtiva === "equipe"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-equipe"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="eq-nome">
              Nome do solicitante<span className="req">*</span>
            </label>
            <input type="text" id="eq-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-cargo">Cargo / função</label>
            <input
              type="text"
              id="eq-cargo"
              name="cargo"
              autoComplete="organization-title"
            />
          </div>

          <div className="form-field">
            <label htmlFor="eq-instituicao">
              Instituição / órgão<span className="req">*</span>
            </label>
            <input
              type="text"
              id="eq-instituicao"
              name="instituicao"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe a instituição.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-cnpj">CNPJ (faturamento)</label>
            <input
              type="text"
              id="eq-cnpj"
              name="cnpj"
              placeholder="00.000.000/0000-00"
            />
            <span className="hint">
              Opcional · solicitado posteriormente para emissão de NF.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-email">
              E-mail institucional<span className="req">*</span>
            </label>
            <input type="email" id="eq-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-telefone">
              Telefone / WhatsApp<span className="req">*</span>
            </label>
            <input
              type="tel"
              id="eq-telefone"
              name="telefone"
              required
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
            <span className="err-msg">Informe um telefone.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="eq-evento">
              Evento de interesse<span className="req">*</span>
            </label>
            <input
              type="text"
              id="eq-evento"
              name="evento"
              required
              placeholder="Título, sigla do programa, data ou link da Agenda."
              ref={refInputEvento}
            />
            <span className="hint">
              Aceita título, sigla do programa, data ou link.
            </span>
            <span className="err-msg">Informe o evento de interesse.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-inscritos">
              Nº de inscritos previstos<span className="req">*</span>
            </label>
            <select
              id="eq-inscritos"
              name="inscritos"
              required
              defaultValue=""
              ref={refSelectInscritos}
              onChange={onChangeInscritos}
            >
              <option value="">Selecione</option>
              {OPTIONS_INSCRITOS_EQUIPE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="hint">
              Acima de 50 participantes habilita upload de planilha de inscritos.
            </span>
            <span className="err-msg">Selecione a quantidade prevista.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-faturamento">
              Forma de faturamento prevista<span className="req">*</span>
            </label>
            <select id="eq-faturamento" name="faturamento" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_FATURAMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a forma de faturamento.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="eq-observacoes">Observações</label>
            <textarea
              id="eq-observacoes"
              name="observacoes"
              placeholder="Necessidades específicas: nominata, datas de empenho, requisitos de empenhamento, vagas reservadas, condições especiais."
            />
          </div>

          {/* Hidden field para preservar o link do evento de origem */}
          <input
            type="hidden"
            id="eq-evento-url"
            name="evento_url"
            defaultValue=""
            ref={refInputEventoUrl}
          />

          {/* Bloco condicional bulk */}
          <div
            className={`form-bulk${bulkAtivo ? " is-active" : ""}`}
            id="eq-bulk"
            aria-hidden={!bulkAtivo}
          >
            <div className="form-bulk-head">
              <p className="eyebrow gold">Inscrição em lote · grandes grupos</p>
              <h4>Envio de planilha de participantes</h4>
              <p>
                Para grupos acima de 50 participantes, recomendamos o envio de uma planilha
                com os dados dos inscritos. Baixe nosso modelo institucional, preencha e
                faça upload abaixo — a transmissão é criptografada (HTTPS/TLS).
              </p>
              <div className="bulk-actions">
                {/* TODO: hospedar XLSX em apps/web/public/assets/ */}
                <a
                  className="btn btn--secondary btn--mini"
                  href="./assets/modelo-inscricao-grupo-NTC.xlsx"
                  data-cms-link="modelo-planilha-grupo"
                  download
                >
                  Baixar modelo de planilha (XLSX) <span className="btn-arrow">↓</span>
                </a>
                <span className="meta">Modelo oficial · campos pré-definidos</span>
              </div>
            </div>

            <div className="file-field">
              <label htmlFor="eq-planilha">
                Upload da planilha de inscritos<span className="req">*</span>
              </label>
              <div className="file-input-wrap" id="eq-planilha-wrap">
                <input
                  type="file"
                  id="eq-planilha"
                  name="planilha"
                  accept=".xlsx,.xls,.csv"
                  aria-describedby="eq-planilha-hint"
                  ref={refInputPlanilha}
                  onChange={onChangePlanilha}
                  required={bulkAtivo}
                />
                <div className="file-display">
                  <span className="file-name">{nomeArquivoBulk}</span>
                  <span className="file-cta">Escolher arquivo</span>
                </div>
              </div>
              <span className="hint" id="eq-planilha-hint">
                Formatos: XLSX, XLS, CSV · tamanho máximo 5 MB · transmissão criptografada.
              </span>
              <span className="err-msg">
                Anexe a planilha de inscritos (XLSX, XLS ou CSV · até 5 MB).
              </span>
            </div>

            <div className="form-consent full">
              <input
                type="checkbox"
                id="eq-lgpd-lote"
                name="lgpd_lote"
                ref={refConsentLote}
                required={bulkAtivo}
              />
              <label htmlFor="eq-lgpd-lote">
                Declaro estar autorizado(a) a compartilhar os dados pessoais dos
                participantes listados na planilha, na qualidade de representante
                legítimo(a) da instituição demandante, e ciente de que o Instituto NTC do
                Brasil tratará esses dados{" "}
                <strong>exclusivamente para processamento da inscrição em lote</strong>,
                nos termos da LGPD (Lei 13.709/2018) e da nossa{" "}
                <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                  Política de Privacidade
                </a>
                .
              </label>
            </div>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="eq-lgpd" name="lgpd" required />
            <label htmlFor="eq-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para
              processamento da inscrição, proposta e faturamento, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD.
            </label>
          </div>

          <div className="form-actions full">
            <button
              type="submit"
              className="btn btn--primary"
              data-cms-link="enviar-equipe"
              disabled={status.kind === "sending"}
            >
              Solicitar inscrição da equipe <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-equipe" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}

/* ============================================================
 * PAINEL D · IMPRENSA
 * ============================================================ */

interface PainelImprensaProps extends PainelBaseProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelImprensa({ tabAtiva, status, onSubmit }: PainelImprensaProps) {
  const cfg = ASIDE_POR_TAB.imprensa;
  return (
    <PanelShell tab="imprensa" ativa={tabAtiva === "imprensa"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-imprensa"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="imp-nome">
              Nome do(a) jornalista<span className="req">*</span>
            </label>
            <input type="text" id="imp-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-veiculo">
              Veículo / assessoria<span className="req">*</span>
            </label>
            <input
              type="text"
              id="imp-veiculo"
              name="veiculo"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe o veículo ou assessoria.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-email">
              E-mail profissional<span className="req">*</span>
            </label>
            <input type="email" id="imp-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-telefone">Telefone / WhatsApp</label>
            <input
              type="tel"
              id="imp-telefone"
              name="telefone"
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
          </div>

          <div className="form-field">
            <label htmlFor="imp-tipo">
              Tipo de demanda<span className="req">*</span>
            </label>
            <select id="imp-tipo" name="tipo" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_TIPO_IMPRENSA.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione o tipo de demanda.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-deadline">Prazo de fechamento (deadline)</label>
            <input
              type="text"
              id="imp-deadline"
              name="deadline"
              placeholder="Ex.: 15/05 às 18h"
            />
            <span className="hint">
              Informe data e horário se houver fechamento próximo.
            </span>
          </div>

          <div className="form-field full">
            <label htmlFor="imp-pauta">
              Pauta / contexto editorial<span className="req">*</span>
            </label>
            <textarea
              id="imp-pauta"
              name="pauta"
              required
              minLength={30}
              placeholder="Pauta, ângulo editorial, veículo de publicação e público-alvo."
            />
            <span className="hint">Mínimo 30 caracteres.</span>
            <span className="err-msg">Descreva a pauta com pelo menos 30 caracteres.</span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="imp-lgpd" name="lgpd" required />
            <label htmlFor="imp-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para
              atendimento desta demanda editorial, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD.
            </label>
          </div>

          <div className="form-actions full">
            <button
              type="submit"
              className="btn btn--primary"
              data-cms-link="enviar-imprensa"
              disabled={status.kind === "sending"}
            >
              Enviar pauta <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-imprensa" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}
