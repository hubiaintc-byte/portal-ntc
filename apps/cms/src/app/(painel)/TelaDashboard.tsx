import type {
  EventoCmsResumo,
  LeadCmsResumo,
  PalestranteCmsResumo,
} from "@/lib/cms/painelCms";

interface TelaDashboardProps {
  eventos: EventoCmsResumo[];
  palestrantes: PalestranteCmsResumo[];
  leads: LeadCmsResumo[];
  erroLeitura: boolean;
}

/** Tela inicial do CMS — métricas e atividade derivadas dos dados reais. */
export function TelaDashboard({ eventos, palestrantes, leads, erroLeitura }: TelaDashboardProps) {
  const eventosPublicados = eventos.filter((e) => e.status === "publicado").length;
  const eventosAgendados = eventos.filter((e) => e.status === "agendado").length;
  const palestrantesComFoto = palestrantes.filter((p) => p.temFoto).length;
  const leadsNovos = leads.filter((l) => l.status === "novo").length;

  const metricas = [
    {
      rotulo: "Eventos no portal",
      valor: String(eventos.length),
      delta: `${eventosPublicados} publicados · ${eventosAgendados} agendados`,
      vertical: "gestao-publica" as const,
    },
    {
      rotulo: "Palestrantes",
      valor: String(palestrantes.length),
      delta: `${palestrantesComFoto} com foto vinculada`,
      vertical: "saude" as const,
    },
    {
      rotulo: "Fotos pendentes",
      valor: String(palestrantes.length - palestrantesComFoto),
      delta: "especialistas sem foto",
      vertical: "educacao" as const,
    },
    {
      rotulo: "Leads novos",
      valor: String(leadsNovos),
      delta:
        leads.length === 0
          ? "nenhum lead recebido"
          : `de ${leads.length} ${leads.length === 1 ? "lead" : "leads"} no total`,
      vertical: null,
    },
  ];

  // "Atividade recente" derivada dos eventos mais recentes (dados reais).
  const atividades = eventos.slice(0, 5);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Visão geral</p>
          <h1>Bom dia, equipe NTC</h1>
          <p>Inteligência institucional. Impacto real — o portal em um relance.</p>
        </div>
      </div>

      {erroLeitura && (
        <div className="pcms-vazio" style={{ marginBottom: 24 }}>
          Não foi possível ler o banco agora. Verifique a conexão com o banco de dados. O painel
          continua navegável.
        </div>
      )}

      <div className="pcms-metricas">
        {metricas.map((m) => (
          <div key={m.rotulo} className="pcms-metrica" data-vertical={m.vertical ?? undefined}>
            <div className="pcms-metrica__valor">{m.valor}</div>
            <div className="pcms-metrica__rotulo">{m.rotulo}</div>
            <div className="pcms-metrica__delta">{m.delta}</div>
          </div>
        ))}
      </div>

      <section className="pcms-painel">
        <div className="pcms-painel__head">Eventos recentes</div>
        {atividades.length === 0 ? (
          <div className="pcms-atividade">
            <span className="pcms-atividade__txt">Nenhum evento cadastrado ainda.</span>
          </div>
        ) : (
          atividades.map((e) => (
            <div key={e.id} className="pcms-atividade">
              <span className="pcms-atividade__dot" aria-hidden="true" />
              <span className="pcms-atividade__txt">
                <b>{e.titulo}</b> — {e.modalidade} · {e.local}
              </span>
              <span className="pcms-atividade__meta">{e.data}</span>
            </div>
          ))
        )}
      </section>
    </>
  );
}
