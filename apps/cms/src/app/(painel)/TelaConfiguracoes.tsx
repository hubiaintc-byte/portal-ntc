"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";

import { SENHA_MINIMO } from "@/lib/validarNovaSenha";

import {
  listarMinhasPasskeysCms,
  obterOpcoesCadastroPasskeyCms,
  removerPasskeyProprioCms,
  trocarMinhaSenha,
  verificarCadastroPasskeyCms,
} from "./acoesAuth";
import { AvisoForm, CampoSenha } from "./crm/CamposCrm";

interface TelaConfiguracoesProps {
  /** Usuário logado — usado só para exibir o e-mail da conta na seção real. */
  usuario: { id: string; nome: string; email: string };
}

/**
 * Tela de configurações. A seção "Minha conta" é REAL (troca a própria
 * senha via Server Action). O restante da tela segue demonstrativo — nada
 * mais aqui é salvo ainda.
 */
export function TelaConfiguracoes({ usuario }: TelaConfiguracoesProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [passkeys, setPasskeys] = useState<
    { id: string; apelido: string; criadoEm: string; ultimoUsoEm: string | null }[]
  >([]);
  const [carregandoPasskeys, setCarregandoPasskeys] = useState(true);
  const [cadastrandoPasskey, setCadastrandoPasskey] = useState(false);
  const [erroPasskey, setErroPasskey] = useState<string | null>(null);
  const suportaWebAuthn = typeof window !== "undefined" && browserSupportsWebAuthn();

  useEffect(() => {
    listarMinhasPasskeysCms()
      .then(setPasskeys)
      .finally(() => setCarregandoPasskeys(false));
  }, []);

  async function cadastrarPasskey() {
    const apelido = window.prompt("Como quer chamar este dispositivo? (ex.: MacBook do Jotta)");
    if (!apelido) return;
    setErroPasskey(null);
    setCadastrandoPasskey(true);
    try {
      const preparo = await obterOpcoesCadastroPasskeyCms();
      if (!preparo.ok) {
        setErroPasskey(preparo.erro);
        return;
      }
      const resposta = await startRegistration({ optionsJSON: preparo.opcoes });
      const resultado = await verificarCadastroPasskeyCms(resposta, preparo.tokenDesafio, apelido);
      if (!resultado.ok) {
        setErroPasskey(resultado.erro ?? "Não foi possível cadastrar o passkey.");
        return;
      }
      setPasskeys(await listarMinhasPasskeysCms());
    } catch {
      setErroPasskey("Não foi possível cadastrar o passkey. Tente novamente.");
    } finally {
      setCadastrandoPasskey(false);
    }
  }

  async function removerPasskeyProprio(id: string) {
    const resultado = await removerPasskeyProprioCms(id);
    if (resultado.ok) setPasskeys(await listarMinhasPasskeysCms());
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (salvando) return;
    setErro(null);
    setSucesso(null);
    iniciarSalvar(async () => {
      const fd = new FormData();
      fd.set("senhaAtual", senhaAtual);
      fd.set("senha", senha);
      fd.set("confirmacao", confirmacao);
      const resultado = await trocarMinhaSenha(null, fd);
      if (resultado.ok) {
        setSenhaAtual("");
        setSenha("");
        setConfirmacao("");
        setSucesso(resultado.ok);
        formRef.current?.reset();
      } else {
        setErro(resultado.erro ?? "Não foi possível alterar a senha.");
      }
    });
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Sistema</p>
          <h1>Configurações</h1>
          <p>Identidade do portal, e-mail transacional e integrações.</p>
        </div>
        <button type="button" className="pcms-btn" disabled>
          Salvar alterações
        </button>
      </div>

      <div className="pcms-config-grid">
        <section className="pcms-config-card pcms-config-card--ativa">
          <h3>
            Minha conta
            <span className="pcms-selo pcms-selo--ok">Funcional</span>
          </h3>
          <p>
            Trocar a senha de <strong>{usuario.email}</strong> — a senha é alterada de imediato.
          </p>
          <form ref={formRef} onSubmit={enviar}>
            <AvisoForm erro={erro} />
            {sucesso && (
              <p className="pcms-form-aviso" role="status">
                {sucesso}
              </p>
            )}
            <CampoSenha
              rotulo="Senha atual"
              valor={senhaAtual}
              onMudar={setSenhaAtual}
              autoComplete="current-password"
              obrigatorio
              desabilitado={salvando}
            />
            <CampoSenha
              rotulo="Nova senha"
              valor={senha}
              onMudar={setSenha}
              autoComplete="new-password"
              obrigatorio
              minimo={SENHA_MINIMO}
              desabilitado={salvando}
            />
            <CampoSenha
              rotulo="Confirmar nova senha"
              valor={confirmacao}
              onMudar={setConfirmacao}
              autoComplete="new-password"
              obrigatorio
              minimo={SENHA_MINIMO}
              desabilitado={salvando}
            />
            <p className="pcms-editor__hint">Mínimo de {SENHA_MINIMO} caracteres.</p>
            <button type="submit" className="pcms-btn" disabled={salvando}>
              {salvando ? "Salvando…" : "Alterar senha"}
            </button>
          </form>

          <hr className="pcms-editor__hr" />
          <h4>Passkeys</h4>
          <p>Segundo fator de login neste painel — opcional, um por dispositivo.</p>
          {!suportaWebAuthn ? (
            <p className="pcms-form-aviso">Este navegador não tem suporte a passkeys.</p>
          ) : (
            <>
              {erroPasskey ? (
                <p className="pcms-login__erro" role="alert">
                  {erroPasskey}
                </p>
              ) : null}
              {carregandoPasskeys ? (
                <p>Carregando…</p>
              ) : passkeys.length === 0 ? (
                <p>Nenhum passkey cadastrado ainda.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {passkeys.map((p) => (
                    <li
                      key={p.id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                    >
                      <span>
                        <strong>{p.apelido}</strong> · cadastrado em {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                        {p.ultimoUsoEm ? ` · usado em ${new Date(p.ultimoUsoEm).toLocaleDateString("pt-BR")}` : ""}
                      </span>
                      <button
                        type="button"
                        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                        onClick={() => removerPasskeyProprio(p.id)}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="pcms-btn" onClick={cadastrarPasskey} disabled={cadastrandoPasskey}>
                {cadastrandoPasskey ? "Cadastrando…" : "Adicionar passkey"}
              </button>
            </>
          )}
        </section>

        <section className="pcms-config-card">
          <h3>
            Identidade do portal
            <span className="pcms-selo pcms-selo--atencao">Demonstrativo</span>
          </h3>
          <p>Como o Grupo NTC se apresenta nas páginas públicas.</p>
          <div className="pcms-field">
            <label htmlFor="cfg-nome">Nome institucional</label>
            <input id="cfg-nome" type="text" defaultValue="Grupo NTC — Núcleo de Tecnologia e Conhecimento" />
          </div>
          <div className="pcms-field">
            <label htmlFor="cfg-slogan">Assinatura institucional</label>
            <input id="cfg-slogan" type="text" defaultValue="Inteligência institucional. Impacto real." />
          </div>
          <div className="pcms-field">
            <label htmlFor="cfg-dominio">Domínio</label>
            <input id="cfg-dominio" type="text" defaultValue="gruponctc.org.br" />
          </div>
        </section>

        <section className="pcms-config-card">
          <h3>
            E-mail transacional
            <span className="pcms-selo pcms-selo--atencao">Demonstrativo</span>
          </h3>
          <p>Notificações de leads e confirmações de formulário (Resend).</p>
          <div className="pcms-field">
            <label htmlFor="cfg-remetente">Remetente</label>
            <input id="cfg-remetente" type="text" defaultValue="contato@institutontc.com.br" />
          </div>
          <div className="pcms-field">
            <label htmlFor="cfg-dpo">E-mail do DPO (LGPD)</label>
            <input id="cfg-dpo" type="text" defaultValue="dpo@gruponctc.org.br" />
          </div>
          <div className="pcms-field">
            <label htmlFor="cfg-idioma">Idioma do painel</label>
            <select id="cfg-idioma" defaultValue="pt-BR">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>

        <section className="pcms-config-card">
          <h3>
            Segurança e acesso
            <span className="pcms-selo pcms-selo--atencao">Demonstrativo</span>
          </h3>
          <p>Defesas do painel administrativo.</p>
          <div className="pcms-toggle-row">
            <span>
              Autenticação em duas etapas (2FA)
              <small>TOTP obrigatório para super-admins</small>
            </span>
            <span className="pcms-switch pcms-switch--on" aria-hidden="true" />
          </div>
          <div className="pcms-toggle-row">
            <span>
              Expiração de sessão
              <small>Logout automático após 8 h de inatividade</small>
            </span>
            <span className="pcms-switch pcms-switch--on" aria-hidden="true" />
          </div>
          <div className="pcms-toggle-row">
            <span>
              Registro de auditoria
              <small>Gravar todas as edições de conteúdo</small>
            </span>
            <span className="pcms-switch pcms-switch--on" aria-hidden="true" />
          </div>
        </section>

        <section className="pcms-config-card">
          <h3>
            Integrações
            <span className="pcms-selo pcms-selo--atencao">Demonstrativo</span>
          </h3>
          <p>Serviços conectados ao portal.</p>
          <div className="pcms-toggle-row">
            <span>
              Supabase Storage
              <small>Mídias do portal · bucket ntc-portal-media</small>
            </span>
            <span className="pcms-switch pcms-switch--on" aria-hidden="true" />
          </div>
          <div className="pcms-toggle-row">
            <span>
              Sentry
              <small>Observabilidade de erros em produção</small>
            </span>
            <span className="pcms-switch pcms-switch--on" aria-hidden="true" />
          </div>
          <div className="pcms-toggle-row">
            <span>
              hCaptcha
              <small>Proteção dos formulários públicos</small>
            </span>
            <span className="pcms-switch" aria-hidden="true" />
          </div>
        </section>
      </div>

      <p className="pcms-aviso">
        <b>Tela parcialmente demonstrativa.</b> Só a seção &ldquo;Minha conta&rdquo; salva de fato. As
        demais opções serão ligadas aos poucos, conforme o painel evoluir.
      </p>
    </>
  );
}
