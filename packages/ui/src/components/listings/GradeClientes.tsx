import { CardCliente, type CardClienteProps } from "../cards/CardCliente";

/**
 * `<GradeClientes>` — grade de logos institucionais (doc 13 §2.2).
 *
 * Usada em /o-grupo e potencialmente em /solucoes-estrategicas para
 * mostrar redes públicas atendidas. Sem agrupamento e sem filtro
 * cliente — listagem direta.
 *
 * Variante "mosaico" (padrão) renderiza só os logos. Variante "lista"
 * mostra logo + nome + esfera/estado.
 */

export interface ClienteItem extends CardClienteProps {
  id: string;
}

export interface GradeClientesProps {
  clientes: ClienteItem[];
  variante?: "mosaico" | "lista";
  colunas?: 4 | 5 | 6;
}

const COLUNAS: Record<NonNullable<GradeClientesProps["colunas"]>, string> = {
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

export function GradeClientes({
  clientes,
  variante = "mosaico",
  colunas = 5,
}: GradeClientesProps) {
  if (clientes.length === 0) return null;

  if (variante === "lista") {
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clientes.map((c) => (
          <li key={c.id}>
            <CardCliente {...c} variante="lista" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`grid gap-4 ${COLUNAS[colunas]}`}>
      {clientes.map((c) => (
        <li key={c.id}>
          <CardCliente {...c} variante="mosaico" />
        </li>
      ))}
    </ul>
  );
}
