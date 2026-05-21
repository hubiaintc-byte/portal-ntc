import type { Metadata } from "next";

/**
 * Placeholder da Home v3 Premium — esta página ainda está sendo
 * portada do 02_Prototipo_Home_GrupoNTC_v3_Premium.html.
 *
 * Próximas etapas:
 * - C3: hero slider literal.
 * - C4: eventos, programas, especialistas, EventOn, Contratação, citação.
 * - C5: conexão com o CMS para popular slides, cards e fotos.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Grupo NTC · Inteligência institucional. Impacto real.",
  description:
    "O novo padrão da formação institucional para a Administração Pública brasileira.",
};

export default function HomePage() {
  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="eyebrow gold">Sessão em andamento</p>
          <h1 className="lede">
            A Home v3 Premium está sendo portada do protótipo HTML aprovado. As
            próximas etapas adicionam o hero slider, as seções editoriais e a
            conexão com o CMS.
          </h1>
        </div>
      </section>
    </main>
  );
}
