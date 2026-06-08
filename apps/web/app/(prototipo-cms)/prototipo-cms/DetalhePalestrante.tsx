import type { PalestranteCmsDetalhe } from "@/lib/cms/prototipoCms";

function vertAttr(vertical: string | null): string | undefined {
  if (!vertical) return undefined;
  const v = vertical.toLowerCase();
  if (v.includes("gest")) return "gestao-publica";
  if (v.includes("saúd") || v.includes("saud")) return "saude";
  if (v.includes("educ")) return "educacao";
  return undefined;
}

interface DetalhePalestranteProps {
  palestrante: PalestranteCmsDetalhe;
  onVoltar: () => void;
}

/** Tela cheia de detalhe de um palestrante — somente leitura. */
export function DetalhePalestrante({ palestrante: p, onVoltar }: DetalhePalestranteProps) {
  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Palestrantes <span>/ {p.nome}</span>
      </button>

      <div className="pcms-perfil-head">
        {p.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pcms-perfil-foto" src={p.fotoUrl} alt={`Foto de ${p.nome}`} />
        ) : (
          <span className="pcms-perfil-foto pcms-perfil-foto--vazia" data-vertical={vertAttr(p.vertical)}>
            {p.iniciais}
          </span>
        )}
        <div className="pcms-perfil-id">
          <p className="pcms-pagehead__eyebrow">{p.titulacao}</p>
          <h1>{p.nome}</h1>
          <p className="pcms-perfil-cargo">
            {[p.cargoAtual, p.instituicao].filter(Boolean).join(" · ")}
          </p>
          {p.vertical && <span className="pcms-selo-vert">{p.vertical}</span>}
        </div>
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          {p.curriculoCurtoHtml && (
            <section className="pcms-det-bloco">
              <h2>Currículo</h2>
              <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: p.curriculoCurtoHtml }} />
            </section>
          )}
          {p.curriculoCompletoHtml && (
            <section className="pcms-det-bloco">
              <h2>Currículo completo</h2>
              <div
                className="pcms-rich"
                dangerouslySetInnerHTML={{ __html: p.curriculoCompletoHtml }}
              />
            </section>
          )}
        </div>

        <aside className="pcms-det-aside">
          {p.linhasAtuacao.length > 0 && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Linhas de atuação</div>
              <div className="pcms-det-card__body">
                <div className="pcms-tags">
                  {p.linhasAtuacao.map((l) => (
                    <span key={l} className="pcms-chip pcms-chip--ativo">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(p.linkLattes || p.linkLinkedin) && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Links</div>
              <div className="pcms-det-card__body">
                {p.linkLattes && <p className="pcms-det-link">{p.linkLattes}</p>}
                {p.linkLinkedin && <p className="pcms-det-link">{p.linkLinkedin}</p>}
              </div>
            </div>
          )}

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Foto</div>
            <div className="pcms-det-card__body">
              <span className={`pcms-selo pcms-selo--${p.temFoto ? "publicado" : "rascunho"}`}>
                {p.temFoto ? "Vinculada" : "Pendente"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
