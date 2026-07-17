"use client";

import type { ProdutoCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaProdutosProps {
  produtos: ProdutoCrmResumo[];
}

export function TelaProdutos({ produtos }: TelaProdutosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Produtos / Eventos</h1>
          <p>Produtos comerciais e eventos do catálogo, com código e valor de referência.</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="pcms-vazio">Nenhum produto cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th>Valor ref.</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nome}</strong></td>
                <td>{p.codigo ?? "—"}</td>
                <td>{p.valor !== null ? formatarMoedaBRL(p.valor) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
