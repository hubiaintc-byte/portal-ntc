import { custoPrevisto, nomeCentro } from "@ntc/lib";

import { Icone } from "../ui/Icone";
import { TagValidar } from "../ui/Selo";
import { moeda } from "../ui/formato";
import { competenciaDoCusto, type EstruturaCompartilhada as Dados } from "./dadosPagar";

/**
 * Bloco "Estrutura compartilhada" de Pagar (`Views.pagar`): as despesas
 * compartilhadas do recorte (as 12 mais recentes), com o total de todas e a
 * nota "Nenhum rateio é aplicado". Só aparece quando há alguma.
 */
export function EstruturaCompartilhada({ dados }: { dados: Dados }) {
  if (!dados.quantidade) return null;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head" style={{ paddingBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 18 }}>Estrutura compartilhada</h3>
          <div className="ch-sub">Identificada separadamente · sem rateio automático</div>
        </div>
        <div className="ch-right muted" style={{ fontSize: 12.5 }}>
          {dados.quantidade} lançamento(s)
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <caption className="sr-only">Despesas de estrutura compartilhada no recorte</caption>
          <thead>
            <tr>
              <th scope="col">Despesa</th>
              <th scope="col">Centro</th>
              <th scope="col">Competência</th>
              <th scope="col" className="r">
                Previsto
              </th>
              <th scope="col" className="r">
                Incorrido
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.linhas.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="strong">{c.descricao}</div>
                  <div className="sub">{c.categoria}</div>
                </td>
                <td>{nomeCentro(c.centroCusto)}</td>
                <td className="num">{competenciaDoCusto(c)}</td>
                <td className="r num">{moeda(custoPrevisto(c))}</td>
                <td className="r num strong">{moeda(c.valorRealizado)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>
                Total de estrutura compartilhada ({dados.quantidade} lançamento(s))
              </td>
              <td className="r num">{moeda(dados.incorrido)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="ctx-note gold" style={{ margin: "0 18px 18px" }}>
        <Icone nome="scale" tamanho="sm" />
        <div>
          <b>Nenhum rateio é aplicado.</b> Estas despesas sustentam mais de uma área e não são
          distribuídas entre eventos, programas ou centros, porque não há critério institucional
          aprovado. Elas aparecem integralmente no resultado corporativo e nunca são somadas ao
          custo de um evento. Critério de apropriação: <TagValidar texto="A VALIDAR · DIRETORIA" />.
        </div>
      </div>
    </div>
  );
}
