"use client";

import { useState, useTransition } from "react";

import type { OpcaoLista } from "@ntc/lib";

import type { UsuarioGestaoResumo } from "@/lib/cms/painelCmsUsuarios";

import {
  criarUsuarioCms,
  editarUsuarioCms,
  reenviarConviteUsuarioCms,
  removerUsuarioCms,
} from "./acoes";
import { AvisoForm, BarraForm, CampoSelect, CampoTexto } from "./crm/CamposCrm";

/**
 * Gestão de usuários do painel (só super-admin — item da sidebar já é
 * gated). Tela client autossuficiente: os dados chegam vazios da page.tsx
 * (evita mandar a lista a quem não é super-admin) e são carregados aqui via
 * `carregarUsuarios()` ao montar (ShellCms dispara a primeira carga).
 */

const ROTULO_PERFIL: Record<string, string> = {
  "super-admin": "Super-administrador",
  "editor-institucional": "Editor institucional",
  "editor-eventos": "Editor de eventos",
  "atendimento-comercial": "Atendimento comercial",
};

const OPCOES_PERFIL: OpcaoLista[] = Object.entries(ROTULO_PERFIL).map(([value, label]) => ({
  value,
  label,
}));

interface DadosForm {
  nome: string;
  email: string;
  perfil: string;
}

const FORM_VAZIO: DadosForm = { nome: "", email: "", perfil: "" };

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
  // falha ao remover (ex.: "não é possível remover o último super-admin").
  const [feedbackLinha, setFeedbackLinha] = useState<{ id: string; ok: boolean; texto: string } | null>(
    null,
  );
  const [salvando, iniciarSalvar] = useTransition();
  const [removendo, iniciarRemover] = useTransition();

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
    setDados({ nome: u.nome, email: u.email, perfil: u.perfil });
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
          perfil: dados.perfil,
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

  if (formAberto) {
    return (
      <form onSubmit={enviar}>
        <BarraForm
          titulo={modo === "novo" ? "Novo usuário" : `Editar · ${editando?.nome}`}
          salvando={salvando}
          onCancelar={fechar}
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
          <CampoSelect rotulo="Perfil" valor={dados.perfil} onMudar={m("perfil")} opcoes={OPCOES_PERFIL} curto />
        </div>
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
              <th>Perfil</th>
              <th>Atualizado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.nome}</strong>
                  {u.id === usuarioAtualId && <> · <small>você</small></>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="pcms-selo pcms-selo--info">{ROTULO_PERFIL[u.perfil] ?? u.perfil}</span>
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
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
