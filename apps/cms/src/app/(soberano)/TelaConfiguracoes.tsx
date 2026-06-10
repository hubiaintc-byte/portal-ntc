/** Tela de configurações — puramente visual (sem persistência). */
export function TelaConfiguracoes() {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Sistema</p>
          <h1>Configurações</h1>
          <p>Identidade do portal, e-mail transacional e integrações.</p>
        </div>
        <button type="button" className="pcms-btn">
          Salvar alterações
        </button>
      </div>

      <div className="pcms-config-grid">
        <section className="pcms-config-card">
          <h3>Identidade do portal</h3>
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
          <h3>E-mail transacional</h3>
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
          <h3>Segurança e acesso</h3>
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
          <h3>Integrações</h3>
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
        <b>Protótipo visual.</b> Esta tela é apenas demonstrativa — nada aqui é salvo nem afeta o
        admin real do Payload. Serve para avaliar a direção de um CMS próprio com a identidade
        Soberana.
      </p>
    </>
  );
}
