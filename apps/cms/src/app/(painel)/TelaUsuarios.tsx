"use client";

import { Fragment, useState, useTransition } from "react";

import type { UsuarioGestaoResumo } from "@/lib/cms/painelCmsUsuarios";
import { TELAS, type ModuloPainel, type TelaPainel } from "@/lib/cms/telas";

import {
  criarUsuarioCms,
  editarUsuarioCms,
  listarPasskeysDeUsuarioCms,
  reenviarConviteUsuarioCms,
  removerPasskeyAdminCms,
  removerUsuarioCms,
} from "./acoes";
import { AvisoForm, BarraForm, CampoCheck, CampoTexto } from "./crm/CamposCrm";

/**
 * Gestão de usuários do painel (só administrador — item da sidebar já é
 * gated). Tela client autossuficiente: os dados chegam vazios da page.tsx
 * (evita mandar a lista a quem não é administrador) e são carregados aqui via
 * `carregarUsuarios()` ao montar (ShellCms dispara a primeira carga).
 */

const GRUPOS_TELAS: { modulo: ModuloPainel; rotulo: string }[] = [
  { modulo: "site", rotulo: "Site" },
  { modulo: "crm", rotulo: "CRM" },
];

interface DadosForm {
  nome: string;
  email: string;
  administrador: boolean;
  telas: TelaPainel[];
}

const FORM_VAZIO: DadosForm = { nome: "", email: "", administrador: false, telas: [] };

function resumoAcesso(u: UsuarioGestaoResumo): string {
  if (u.administrador) return "Administrador";
  return `${u.telas.length} ${u.telas.length === 1 ? "tela" : "telas"}`;
}

interface TelaUsuariosProps {
  usuarios: UsuarioGestaoResumo[];
  usuarioAtualId: string;
  carregando: boolean;
  onUsuariosAtualizados: (usuarios: UsuarioGestaoResumo[]) => void;
}

export function TelaUsuarios({
  usuarios,
  usuarioAtualId,
  carregando,
  onUsuariosAtualizados,
}: TelaUsuariosProps) {
  const [modo, setModo] = useState<"lista" | "novo" | string>("lista");
  const [dados, setDados] = useState<DadosForm>(FORM_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<string | null>(null);
  const [reenviando, setReenviando] = useState<string | null>(null);
  // Feedback inline por linha — cobre tanto o reenvio de convite quanto uma
  // falha ao remover (ex.: "não é possível remover o último administrador").
  const [feedbackLinha, setFeedbackLinha] = useState<{ id: string; ok: boolean; texto: string } | null>(
    null,
  );
  const [salvando, iniciarSalvar] = useTransition();
  const [removendo, iniciarRemover] = useTransition();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [passkeysPorUsuario, setPasskeysPorUsuario] = useState<
    Record<string, { id: string; apelido: string; criadoEm: string; ultimoUsoEm: string | null }[]>
  >({});

  const editando =
    modo !== "lista" && modo !== "novo" ? (usuarios.find((u) => u.id === modo) ?? null) : null;
  const formAberto = modo === "novo" || editando !== null;

  function abrirNovo() {
    setDados(FORM_VAZIO);
    setErro(null);
    setAviso(null);
    setModo("novo");
  }

  function abrirEdicao(u: UsuarioGestaoResumo) {
    setDados({ nome: u.nome, email: u.email, administrador: u.administrador, telas: u.telas });
    setErro(null);
    setAviso(null);
    setModo(u.id);
  }

  function fechar() {
    setModo("lista");
    setDados(FORM_VAZIO);
    setErro(null);
    setAviso(null);
  }

  const m = <K extends keyof DadosForm>(campo: K) => (v: DadosForm[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  function alternarTela(id: TelaPainel, marcada: boolean) {
    setDados((d) => ({
      ...d,
      telas: marcada ? [...d.telas, id] : d.telas.filter((t) => t !== id),
    }));
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    iniciarSalvar(async () => {
      if (modo === "novo") {
        const { resultado, usuarios: atualizados } = await criarUsuarioCms(dados);
        if (resultado.ok) {
          onUsuariosAtualizados(atualizados);
          if (resultado.aviso) {
            setAviso(resultado.aviso);
          } else {
            fechar();
          }
        } else {
          setErro(resultado.erro ?? "Não foi possível salvar.");
        }
      } else if (editando) {
        const { resultado, usuarios: atualizados } = await editarUsuarioCms(editando.id, {
          nome: dados.nome,
          administrador: dados.administrador,
          telas: dados.telas,
        });
        if (resultado.ok) {
          onUsuariosAtualizados(atualizados);
          fechar();
        } else {
          setErro(resultado.erro ?? "Não foi possível salvar.");
        }
      }
    });
  }

  function remover(id: string) {
    iniciarRemover(async () => {
      const { resultado, usuarios: atualizados } = await removerUsuarioCms(id);
      setConfirmandoRemocao(null);
      if (resultado.ok) {
        onUsuariosAtualizados(atualizados);
      } else {
        setFeedbackLinha({ id, ok: false, texto: resultado.erro ?? "Não foi possível remover." });
      }
    });
  }

  function reenviarConvite(id: string) {
    setReenviando(id);
    setFeedbackLinha(null);
    reenviarConviteUsuarioCms(id)
      .then((resultado) => {
        setFeedbackLinha({
          id,
          ok: resultado.ok,
          texto: resultado.ok ? "Convite reenviado." : (resultado.erro ?? "Falha ao reenviar convite."),
        });
      })
      .finally(() => setReenviando(null));
  }

  async function alternarExpandido(usuarioId: string) {
    if (expandido === usuarioId) {
      setExpandido(null);
      return;
    }
    setExpandido(usuarioId);
    if (!passkeysPorUsuario[usuarioId]) {
      const lista = await listarPasskeysDeUsuarioCms(usuarioId);
      setPasskeysPorUsuario((atual) => ({ ...atual, [usuarioId]: lista }));
    }
  }

  // Mesma lição da tela Configurações (Task 6): resultado.ok === false ou uma
  // exceção não podem passar em silêncio — reaproveita o feedbackLinha já
  // usado por remover()/reenviarConvite() nesta mesma linha.
  async function removerPasskeyDeUsuario(usuarioId: string, passkeyId: string) {
    setFeedbackLinha(null);
    try {
      const resultado = await removerPasskeyAdminCms(passkeyId);
      if (resultado.ok) {
        const lista = await listarPasskeysDeUsuarioCms(usuarioId);
        setPasskeysPorUsuario((atual) => ({ ...atual, [usuarioId]: lista }));
      } else {
        setFeedbackLinha({
          id: usuarioId,
          ok: false,
          texto: resultado.erro ?? "Não foi possível remover o passkey.",
        });
      }
    } catch {
      setFeedbackLinha({
        id: usuarioId,
        ok: false,
        texto: "Não foi possível remover o passkey. Tente novamente.",
      });
    }
  }

  if (formAberto) {
    return (
      <form onSubmit={enviar}>
        <BarraForm
          titulo={modo === "novo" ? "Novo usuário" : `Editar · ${editando?.nome}`}
          salvando={salvando}
          onCancelar={fechar}
          eyebrow="Sistema"
        />
        <AvisoForm erro={erro} />
        {aviso && (
          <p className="pcms-form-aviso" role="status">
            {aviso}
          </p>
        )}
        <CampoTexto rotulo="Nome" valor={dados.nome} onMudar={m("nome")} obrigatorio />
        <div className="pcms-editor__grid">
          {modo === "novo" ? (
            <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} obrigatorio curto />
          ) : (
            <div className="pcms-field pcms-field--curto">
              <label>E-mail</label>
              <p>{dados.email}</p>
            </div>
          )}
        </div>
        <CampoCheck
          rotulo="Administrador (acesso total)"
          marcado={dados.administrador}
          onMudar={m("administrador")}
        />
        {GRUPOS_TELAS.map((g) => (
          <fieldset key={g.modulo} className="pcms-conteudo__item">
            <legend>Telas · {g.rotulo}</legend>
            {TELAS.filter((t) => t.modulo === g.modulo).map((t) => (
              <CampoCheck
                key={t.id}
                rotulo={t.rotulo}
                marcado={dados.administrador || dados.telas.includes(t.id)}
                desabilitado={dados.administrador}
                onMudar={(v) => alternarTela(t.id, v)}
              />
            ))}
          </fieldset>
        ))}
        <p className="pcms-editor__hint">
          {modo === "novo"
            ? "Um convite será enviado por e-mail para o usuário definir a própria senha."
            : "O e-mail não pode ser alterado após a criação."}
        </p>
      </form>
    );
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Sistema</p>
          <h1>Usuários</h1>
          <p>
            {carregando
              ? "Carregando usuários…"
              : usuarios.length === 0
                ? "Nenhum usuário cadastrado ainda."
                : `${usuarios.length} ${usuarios.length === 1 ? "usuário" : "usuários"} com acesso ao painel.`}
          </p>
        </div>
        <button type="button" className="pcms-btn" onClick={abrirNovo}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo usuário
        </button>
      </div>

      {carregando ? (
        <div className="pcms-vazio">Carregando usuários…</div>
      ) : usuarios.length === 0 ? (
        <div className="pcms-vazio">Nenhum usuário cadastrado ainda.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Acesso</th>
              <th>Atualizado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <Fragment key={u.id}>
                <tr>
                  <td>
                    <strong>{u.nome}</strong>
                    {u.id === usuarioAtualId && <> · <small>você</small></>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="pcms-selo pcms-selo--info">{resumoAcesso(u)}</span>
                  </td>
                  <td>{new Date(u.atualizadoEm).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <div className="pcms-home-row__acoes">
                      <button
                        type="button"
                        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                        onClick={() => abrirEdicao(u)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                        onClick={() => reenviarConvite(u.id)}
                        disabled={reenviando === u.id}
                      >
                        {reenviando === u.id ? "Enviando…" : "Reenviar convite"}
                      </button>
                      <button
                        type="button"
                        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                        onClick={() => alternarExpandido(u.id)}
                      >
                        {expandido === u.id ? "Ocultar passkeys" : "Passkeys"}
                      </button>
                      {confirmandoRemocao === u.id ? (
                        <>
                          <button
                            type="button"
                            className="pcms-btn pcms-btn--mini"
                            onClick={() => remover(u.id)}
                            disabled={removendo}
                          >
                            {removendo ? "Removendo…" : "Confirmar remoção?"}
                          </button>
                          <button
                            type="button"
                            className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                            onClick={() => setConfirmandoRemocao(null)}
                            disabled={removendo}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                          onClick={() => setConfirmandoRemocao(u.id)}
                          disabled={u.id === usuarioAtualId}
                          title={u.id === usuarioAtualId ? "Você não pode remover a si mesmo." : undefined}
                        >
                          Remover
                        </button>
                      )}
                      {feedbackLinha?.id === u.id && (
                        <span
                          role={feedbackLinha.ok ? "status" : "alert"}
                          className={`pcms-selo pcms-selo--${feedbackLinha.ok ? "ok" : "erro"}`}
                        >
                          {feedbackLinha.texto}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {expandido === u.id && (
                  <tr>
                    <td colSpan={5}>
                      {(() => {
                        const passkeysDoUsuario = passkeysPorUsuario[u.id];
                        if (!passkeysDoUsuario) return <p>Carregando…</p>;
                        if (passkeysDoUsuario.length === 0) return <p>Nenhum passkey cadastrado.</p>;
                        return (
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {passkeysDoUsuario.map((p) => (
                              <li
                                key={p.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span>
                                  <strong>{p.apelido}</strong> · cadastrado em{" "}
                                  {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                                </span>
                                <button
                                  type="button"
                                  className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                                  onClick={() => removerPasskeyDeUsuario(u.id, p.id)}
                                >
                                  Remover
                                </button>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
