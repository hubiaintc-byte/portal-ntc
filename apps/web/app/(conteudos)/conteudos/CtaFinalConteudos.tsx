import { CTA_FINAL_HEAD, CTA_FINAL_PONTES } from "./conteudoConteudos";

/**
 * CTA final de 3 pontes — seção 12 de `/conteudos`, extraída aqui para ser
 * compartilhada com a página de leitura `/conteudos/[categoria]/[slug]`
 * (spec §7.3 item 6: "CTA final de 3 pontes, igual ao de /conteudos").
 *
 * Markup literal de 28_Pagina_Conteudos_v1.html; textos de
 * `conteudoConteudos.ts`. Server Component — nenhum JS novo.
 */
export function CtaFinalConteudos() {
  return (
    <section
      className="cont-cta-final"
      id="cta-final"
      aria-label="CTA institucional final"
    >
      <div className="container cont-cta-final-inner fade-in">
        <p className="eyebrow gold">{CTA_FINAL_HEAD.eyebrow}</p>
        <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL_HEAD.tituloHtml }} />
        <p>{CTA_FINAL_HEAD.intro}</p>

        <div className="cont-cta-final-grid">
          {CTA_FINAL_PONTES.map((p) => (
            <div key={p.ponte} className="cont-cta-final-card" data-ponte={p.ponte}>
              <p className="eyebrow">{p.eyebrow}</p>
              <h4>{p.titulo}</h4>
              <p>{p.descricao}</p>
              <a
                className="link-arrow light"
                href={p.link.href}
                data-cms-link={p.link.cmsLink}
                data-track={p.link.track}
              >
                {p.link.texto}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
