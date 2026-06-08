import type { PalestranteCmsResumo } from "@/lib/cms/prototipoCms";

/** Mapeia a vertical do especialista para o data-attr de cor do avatar. */
function vertAttr(vertical: string | null): string | undefined {
  if (!vertical) return undefined;
  const v = vertical.toLowerCase();
  if (v.includes("gest")) return "gestao-publica";
  if (v.includes("saúd") || v.includes("saud")) return "saude";
  if (v.includes("educ")) return "educacao";
  return undefined;
}

/** Listagem de palestrantes/especialistas — dados reais do banco (leitura). */
export function TelaPalestrantes({ palestrantes }: { palestrantes: PalestranteCmsResumo[] }) {
  const comFoto = palestrantes.filter((p) => p.temFoto).length;

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Corpo docente</p>
          <h1>Palestrantes</h1>
          <p>
            {palestrantes.length === 0
              ? "Nenhum especialista cadastrado ainda."
              : `${palestrantes.length} especialistas — ${comFoto} com foto vinculada.`}
          </p>
        </div>
        <button type="button" className="pcms-btn" disabled title="Protótipo de leitura">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo palestrante
        </button>
      </div>

      <div className="pcms-toolbar">
        <div className="pcms-filtros">
          <button type="button" className="pcms-chip pcms-chip--ativo">
            Todos
          </button>
          <button type="button" className="pcms-chip">
            Educação
          </button>
          <button type="button" className="pcms-chip">
            Gestão Pública
          </button>
          <button type="button" className="pcms-chip">
            Saúde
          </button>
        </div>
      </div>

      {palestrantes.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum especialista encontrado no banco. Cadastre palestrantes no admin do Payload — eles
          aparecem aqui automaticamente.
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Palestrante</th>
              <th>Instituição</th>
              <th>Vertical</th>
              <th>Foto</th>
            </tr>
          </thead>
          <tbody>
            {palestrantes.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="pcms-cel-nome">
                    <span className="pcms-avatar" data-vertical={vertAttr(p.vertical)} aria-hidden="true">
                      {p.iniciais}
                    </span>
                    <span>
                      <strong>{p.nome}</strong>
                      <small>{p.titulacao}</small>
                    </span>
                  </div>
                </td>
                <td>{p.instituicao}</td>
                <td>
                  <span className="pcms-selo-vert">{p.vertical ?? "—"}</span>
                </td>
                <td>
                  <span className={`pcms-selo pcms-selo--${p.temFoto ? "publicado" : "rascunho"}`}>
                    {p.temFoto ? "Vinculada" : "Pendente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
