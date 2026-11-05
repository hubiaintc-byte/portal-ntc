"use client";

import { useEffect, useRef, useState } from "react";

import type { EventoFin } from "@ntc/lib";

import { salvarEventoFinAcao } from "../../acoesFinanceiro";
import { Gaveta } from "../ui/Gaveta";
import { Icone } from "../ui/Icone";
import { EtapaWizard } from "./EtapasWizard";
import {
  campoVisivel,
  camposSoLeitura,
  dadosDoForm,
  formDoEvento,
  passoDoCampo,
  PASSOS_WIZARD,
  SUBTITULOS_WIZARD,
  validarForm,
  type FormEvento,
} from "./dadosEventos";

/**
 * Cadastro/edição de evento em 4 etapas (`openEventWizard` + `eventSchemas`
 * do protótipo FIN-05, mapa §1.2), num modal dentro do `.fin05`.
 *
 * - `evento: null` cria evento próprio do financeiro; evento existente edita;
 *   evento do CRM com cadastro pendente (`id "crm-<n>"`) cria o registro
 *   financeiro ligado a ele (a action decide pelo id).
 * - Evento do CRM: nome, datas, modalidade, local e cliente que o CRM já tem
 *   aparecem só leitura, com "Editar no CRM"; vazios no CRM ficam editáveis
 *   (spec §3.2).
 * - Validação no cliente com `validarEvento` (feedback imediato, mesmas
 *   regras de avanço do protótipo); a action valida de novo.
 * - Sem o campo "Referência CRM": o vínculo é o próprio relacionamento.
 */

export interface WizardEventoProps {
  evento: EventoFin | null;
  aoSalvar: (id: string) => void;
  aoFechar: () => void;
}

export function WizardEvento({ evento, aoSalvar, aoFechar }: WizardEventoProps) {
  const edicao = evento !== null;
  const soLeitura = camposSoLeitura(evento);
  const [v, setV] = useState<FormEvento>(() => formDoEvento(evento));
  const [passo, setPasso] = useState(0);
  const [feitos, setFeitos] = useState<Set<number>>(() => new Set(edicao ? [0, 1, 2, 3] : []));
  const [comErro, setComErro] = useState<Set<number>>(() => new Set());
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  // Pede foco no campo inválido depois de renderizar (o `showError` do protótipo).
  const [pedidoFoco, setPedidoFoco] = useState(0);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pedidoFoco) return;
    const fl = painel.current?.querySelector<HTMLElement>(".fld.invalid");
    if (!fl) return;
    fl.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    fl.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [pedidoFoco]);

  const mudar = (campo: keyof FormEvento) => (valor: string) => {
    setV((x) => ({ ...x, [campo]: valor }));
    if (erros[campo]) {
      setErros((e) => {
        const resto = { ...e };
        delete resto[campo];
        return resto;
      });
    }
  };

  /** `show(i)`: troca de etapa e limpa os erros (o protótipo recria o formulário). */
  const mostrar = (i: number) => {
    setPasso(i);
    setErros({});
    setErroGeral("");
    if (painel.current) painel.current.scrollTop = 0;
  };

  /** `showError(err)` na etapa `st`: erro no campo, ou no topo se o campo não está à vista. */
  const mostrarErro = (st: number, erro: string, campo: string | undefined) => {
    mostrar(st);
    if (campo && campoVisivel(campo, v) && passoDoCampo(campo) === st) setErros({ [campo]: erro });
    else setErroGeral(erro);
    setPedidoFoco((n) => n + 1);
  };

  /** `checkStep(i)`: só barra o avanço se o erro é de uma etapa até `i`. */
  const conferirEtapa = (i: number): boolean => {
    const r = validarForm(v);
    if (!r.ok && r.campo && passoDoCampo(r.campo) >= 0 && passoDoCampo(r.campo) <= i) {
      const st = passoDoCampo(r.campo);
      mostrarErro(st, r.erro, r.campo);
      setComErro((s) => new Set(s).add(st));
      return false;
    }
    setComErro((s) => {
      const n = new Set(s);
      n.delete(i);
      return n;
    });
    return true;
  };

  const salvar = async () => {
    const r = validarForm(v);
    if (!r.ok) {
      const st = r.campo ? passoDoCampo(r.campo) : -1;
      mostrarErro(st < 0 ? passo : st, r.erro, r.campo);
      return;
    }
    setSalvando(true);
    try {
      const res = await salvarEventoFinAcao(evento?.id ?? null, dadosDoForm(v));
      if (res.ok) {
        aoSalvar(res.id);
        return;
      }
      const st = res.campo ? passoDoCampo(res.campo) : -1;
      mostrarErro(st < 0 ? passo : st, res.erro, res.campo);
    } catch {
      setErroGeral("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const avancar = () => {
    if (passo < 3) {
      if (conferirEtapa(passo)) {
        setFeitos((s) => new Set(s).add(passo));
        mostrar(passo + 1);
      }
      return;
    }
    void salvar();
  };

  const irParaEtapa = (k: number) => {
    if (k <= passo || edicao) {
      mostrar(k);
      return;
    }
    for (let s = passo; s < k; s++) {
      if (!conferirEtapa(s)) return;
      setFeitos((x) => new Set(x).add(s));
    }
    mostrar(k);
  };

  const etapa = (
    <EtapaWizard passo={passo} v={v} mudar={mudar} erros={erros} soLeitura={soLeitura} />
  );
  const eyebrow = !evento
    ? "Novo evento"
    : evento.cadastroPendente
      ? `Cadastro financeiro pendente · ${evento.id}`
      : `Editar cadastro · ${evento.id}`;

  return (
    <Gaveta
      forma="modal"
      semCorpo
      eyebrow={eyebrow}
      titulo={evento ? evento.nome : "Cadastrar evento"}
      aoFechar={aoFechar}
      rodape={
        <>
          <span className="hint">Etapa {passo + 1} de 4 · campos com * são obrigatórios</span>
          <span className="spacer" />
          <button
            type="button"
            className="btn btn-secondary"
            style={{ visibility: passo === 0 ? "hidden" : "visible" }}
            onClick={() => mostrar(Math.max(0, passo - 1))}
          >
            <Icone nome="chevL" tamanho="sm" />
            Voltar
          </button>
          <button type="button" className="btn btn-primary" disabled={salvando} onClick={avancar}>
            {passo < 3 ? (
              <>
                Avançar <Icone nome="chevR" tamanho="sm" />
              </>
            ) : (
              <>
                <Icone nome="check" tamanho="sm" /> {edicao ? "Salvar alterações" : "Criar evento"}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="wizard">
        <div className="wsteps" role="tablist" aria-label="Etapas do cadastro">
          {PASSOS_WIZARD.map(([t, d], k) => {
            const on = k === passo;
            const cls = on ? "on" : comErro.has(k) ? "err" : feitos.has(k) ? "done" : "";
            return (
              <button
                key={t}
                type="button"
                className={`wstep${cls ? ` ${cls}` : ""}`}
                role="tab"
                aria-selected={on}
                aria-controls="wPanel"
                onClick={() => irParaEtapa(k)}
              >
                <span className="wn">{k + 1}</span>
                <span>
                  <span className="wt" style={{ display: "block" }}>
                    {t}
                  </span>
                  <span className="wd" style={{ display: "block" }}>
                    {d}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="wpanel" id="wPanel" role="tabpanel" ref={painel}>
          <h4>
            {passo + 1}. {PASSOS_WIZARD[passo]![0]}
          </h4>
          <div className="wp-sub">{SUBTITULOS_WIZARD[passo]}</div>
          <div className="form">
            {erroGeral && (
              <div className="form-error" role="alert">
                <Icone nome="alert" tamanho="sm" />
                {erroGeral}
              </div>
            )}
            {etapa}
          </div>
        </div>
      </div>
    </Gaveta>
  );
}
