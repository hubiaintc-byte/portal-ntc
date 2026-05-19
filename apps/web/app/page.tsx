export default function HomePage() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-screen max-w-[var(--container-editorial)] flex-col justify-center gap-8 px-[var(--spacing-margem-editorial)] py-[var(--spacing-secao-vertical)]"
    >
      <p className="text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
        Sprint F · Janela A · Fundação
      </p>
      <h1 className="text-h1 max-w-[min(20ch,100%)] text-balance">
        Inteligência institucional. <em className="text-cardeal">Impacto real.</em>
      </h1>
      <p className="max-w-[min(60ch,100%)] text-grafite text-pretty">
        Esta página é o checkpoint visual da fundação técnica do Portal Grupo NTC.
        Confirma que os tokens da paleta Soberana 2026, a tipografia Cormorant Garamond
        para títulos e Barlow para corpo, e o foco editorial em Oxford estão aplicados.
        Componentes do Inventário, navegação, rodapé e conteúdo institucional serão
        construídos nas próximas janelas, a partir dos protótipos HTML aprovados.
      </p>
      <p>
        <a
          href="https://gruponctc.org.br"
          className="border-b border-oxford pb-0.5 text-oxford transition-colors hover:text-cardeal"
        >
          Voltar ao Instituto NTC do Brasil
        </a>
      </p>
    </main>
  );
}
