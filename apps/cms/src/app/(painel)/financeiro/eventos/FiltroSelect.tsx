"use client";

/** Select de filtro da toolbar (`.fsel > .fcap + select` do protótipo), com a opção "todos" = `all`. */
export function FiltroSelect({
  id,
  rotulo,
  valor,
  todos,
  opcoes,
  aoMudar,
}: {
  id: string;
  rotulo: string;
  valor: string;
  todos: string;
  opcoes: readonly string[];
  aoMudar: (v: string) => void;
}) {
  return (
    <div className="fsel">
      <span className="fcap" aria-hidden="true">
        {rotulo}
      </span>
      <select id={id} aria-label={rotulo} value={valor} onChange={(e) => aoMudar(e.target.value)}>
        <option value="all">{todos}</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
