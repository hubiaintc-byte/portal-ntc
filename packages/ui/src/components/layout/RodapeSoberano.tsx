import type { RodapeData } from "@ntc/types";

/**
 * `<RodapeSoberano>` — rodapé institucional (doc 12 §11.1).
 *
 * Server Component. Recebe `dados` do Global `Rodape` do Payload e
 * monta 4 colunas (mapa do site, soluções, conteúdos, contato),
 * linha cerimonial com a assinatura institucional em Cormorant italic
 * dourado, e barra final com razão social, CNPJ e links legais (LGPD).
 *
 * Os links das colunas 1-3 são hardcoded a partir de docs/13 (rotas
 * canônicas do portal). Coluna 4 e barra final consomem `dados`.
 */

interface RodapeSoberanoProps {
  dados: RodapeData;
  className?: string;
}

const COLUNA_SITE = [
  { rotulo: "Home", link: "/" },
  { rotulo: "O Grupo NTC", link: "/o-grupo" },
  { rotulo: "Programas", link: "/programas" },
  { rotulo: "Eventos", link: "/agenda" },
  { rotulo: "Especialistas", link: "/o-grupo/corpo-docente" },
  { rotulo: "Conteúdos", link: "/conteudos" },
  { rotulo: "Contato", link: "/contato" },
];

const COLUNA_SOLUCOES = [
  { rotulo: "NTC Educação", link: "/solucoes-estrategicas/educacao" },
  { rotulo: "NTC Gestão Pública", link: "/solucoes-estrategicas/gestao-publica" },
  { rotulo: "NTC Saúde", link: "/solucoes-estrategicas/saude" },
];

const COLUNA_CONTEUDOS = [
  { rotulo: "Artigos", link: "/conteudos/artigo" },
  { rotulo: "Pesquisas Aplicadas", link: "/conteudos/publicacao" },
  { rotulo: "Notas Técnicas", link: "/conteudos/insight" },
];

const LABEL_REDE: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
};

export function RodapeSoberano({ dados, className }: RodapeSoberanoProps) {
  const ano = new Date().getFullYear();

  return (
    <footer
      className={[
        "border-t border-linha-sutil bg-pergaminho text-grafite",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-[var(--container-editorial)] px-[var(--spacing-margem-editorial)] py-[var(--spacing-secao-vertical)]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <ColunaLinks titulo="Mapa do site" itens={COLUNA_SITE} />
          <ColunaLinks titulo="Soluções estratégicas" itens={COLUNA_SOLUCOES} />
          <ColunaLinks titulo="Conteúdos" itens={COLUNA_CONTEUDOS} />
          <ColunaContato dados={dados} />
        </div>

        {dados.assinaturaInstitucional ? (
          <p className="mt-16 text-center font-titulo italic text-h4 text-dourado">
            {dados.assinaturaInstitucional}
          </p>
        ) : null}

        <BarraInstitucional dados={dados} ano={ano} />
      </div>
    </footer>
  );
}

interface ColunaProps {
  titulo: string;
  itens: { rotulo: string; link: string }[];
}

function ColunaLinks({ titulo, itens }: ColunaProps) {
  return (
    <nav aria-label={titulo}>
      <h2 className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-oxford">
        {titulo}
      </h2>
      <ul className="mt-4 flex flex-col gap-2 font-corpo text-corpo">
        {itens.map((it) => (
          <li key={it.link}>
            <a
              href={it.link}
              className="text-grafite underline-offset-4 hover:text-oxford hover:underline"
            >
              {it.rotulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ColunaContato({ dados }: { dados: RodapeData }) {
  return (
    <div>
      <h2 className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-oxford">
        Contato
      </h2>
      <ul className="mt-4 flex flex-col gap-2 font-corpo text-corpo">
        {dados.emailInstitucional ? (
          <li>
            <a
              href={`mailto:${dados.emailInstitucional}`}
              className="text-grafite hover:text-oxford"
            >
              {dados.emailInstitucional}
            </a>
          </li>
        ) : null}
        {dados.telefoneInstitucional ? (
          <li>
            <a
              href={`tel:${dados.telefoneInstitucional.replace(/\D/g, "")}`}
              className="text-grafite hover:text-oxford"
            >
              {dados.telefoneInstitucional}
            </a>
          </li>
        ) : null}
        {dados.whatsappInstitucional ? (
          <li>
            <a
              href={`https://wa.me/${dados.whatsappInstitucional.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-grafite hover:text-oxford"
            >
              WhatsApp: {dados.whatsappInstitucional}
            </a>
          </li>
        ) : null}
        {dados.enderecoCompleto ? (
          <li className="text-pequeno text-grafite-suave whitespace-pre-line">
            {dados.enderecoCompleto}
          </li>
        ) : null}
      </ul>

      {dados.redesSociais && dados.redesSociais.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-4">
          {dados.redesSociais.map((r, idx) => (
            <li key={r.id ?? idx}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-corpo text-pequeno uppercase tracking-[0.12em] text-oxford underline-offset-4 hover:underline"
              >
                {LABEL_REDE[r.rede ?? ""] ?? r.rede ?? "Link"}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

interface BarraProps {
  dados: RodapeData;
  ano: number;
}

function BarraInstitucional({ dados, ano }: BarraProps) {
  const razao = dados.razaoSocial ?? "Instituto NTC do Brasil";
  const cnpj = dados.cnpj;
  return (
    <div className="mt-16 flex flex-col gap-4 border-t border-linha-sutil pt-6 md:flex-row md:items-center md:justify-between">
      <p className="font-corpo text-pequeno text-grafite-suave">
        © {ano} {razao}
        {cnpj ? ` · CNPJ ${cnpj}` : null}
      </p>
      {dados.linksLegais && dados.linksLegais.length > 0 ? (
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {dados.linksLegais.map((l, idx) => (
            <li key={l.id ?? idx}>
              <a
                href={l.link}
                className="font-corpo text-pequeno text-grafite-suave underline-offset-4 hover:text-oxford hover:underline"
              >
                {l.rotulo}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
