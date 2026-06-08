import type { EventoCmsDetalhe } from "@/lib/cms/prototipoCms";

const ROTULO_STATUS: Record<EventoCmsDetalhe["status"], string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  agendado: "Agendado",
};

interface DetalheEventoProps {
  evento: EventoCmsDetalhe;
  onVoltar: () => void;
}

/** Tela cheia de detalhe de um evento — somente leitura, layout documento. */
export function DetalheEvento({ evento, onVoltar }: DetalheEventoProps) {
  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Eventos <span>/ {evento.titulo}</span>
      </button>

      {evento.capaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pcms-det-capa" src={evento.capaUrl} alt={`Capa do evento ${evento.titulo}`} />
      )}

      <div className="pcms-det-head">
        <div>
          {evento.eyebrow && <p className="pcms-pagehead__eyebrow">{evento.eyebrow}</p>}
          <h1>{evento.titulo}</h1>
        </div>
        <span className={`pcms-selo pcms-selo--${evento.status}`}>
          {ROTULO_STATUS[evento.status]}
        </span>
      </div>

      <div className="pcms-det-meta">
        <div>
          <span className="pcms-det-meta__rot">Data</span>
          {evento.data}
        </div>
        <div>
          <span className="pcms-det-meta__rot">Modalidade</span>
          {evento.modalidade}
        </div>
        <div>
          <span className="pcms-det-meta__rot">Local</span>
          {evento.local}
        </div>
        {evento.cargaHoraria && (
          <div>
            <span className="pcms-det-meta__rot">Carga horária</span>
            {evento.cargaHoraria}
          </div>
        )}
        {evento.programa && (
          <div>
            <span className="pcms-det-meta__rot">Programa</span>
            {evento.programa}
          </div>
        )}
        {evento.area && (
          <div>
            <span className="pcms-det-meta__rot">Área</span>
            {evento.area}
          </div>
        )}
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          {evento.resumo && (
            <section className="pcms-det-bloco">
              <h2>Resumo</h2>
              <p>{evento.resumo}</p>
            </section>
          )}
          {evento.objetivosHtml && (
            <section className="pcms-det-bloco">
              <h2>Objetivos</h2>
              <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: evento.objetivosHtml }} />
            </section>
          )}
          {evento.conteudoProgramaticoHtml && (
            <section className="pcms-det-bloco">
              <h2>Conteúdo programático</h2>
              <div
                className="pcms-rich"
                dangerouslySetInnerHTML={{ __html: evento.conteudoProgramaticoHtml }}
              />
            </section>
          )}
          {evento.faq.length > 0 && (
            <section className="pcms-det-bloco">
              <h2>Perguntas frequentes</h2>
              {evento.faq.map((f, i) => (
                <div key={i} className="pcms-faq-item">
                  <strong>{f.pergunta}</strong>
                  <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: f.respostaHtml }} />
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="pcms-det-aside">
          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Inscrição</div>
            <div className="pcms-det-card__body">
              <p>
                <span className="pcms-det-meta__rot">Valor</span>
                {evento.valor ?? "—"}
              </p>
              <p>
                <span className="pcms-det-meta__rot">Status</span>
                {evento.inscricaoAberta ? "Aberta" : "Encerrada"}
              </p>
              {evento.linkInscricao && (
                <p className="pcms-det-link">{evento.linkInscricao}</p>
              )}
            </div>
          </div>

          {evento.palestrantes.length > 0 && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Palestrantes</div>
              <div className="pcms-det-card__body">
                {evento.palestrantes.map((p) => (
                  <div key={p.id} className="pcms-det-pessoa">
                    <span className="pcms-avatar" aria-hidden="true">
                      {p.iniciais}
                    </span>
                    <span>
                      <strong>{p.nome}</strong>
                      <small>{p.titulacao}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
