"use client";

interface TelaEmBreveProps {
  eyebrow: string;
  titulo: string;
  descricao: string;
}

/** Placeholder navegável para telas da Fase B (Propostas/Versões/Envios/Condições). */
export function TelaEmBreve({ eyebrow, titulo, descricao }: TelaEmBreveProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">{eyebrow}</p>
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </div>
      <div className="pcms-vazio">
        <span className="pcms-selo pcms-selo--atencao">Em breve</span>
        <p>Esta área faz parte da Fase B do CRM e será liberada em uma próxima entrega.</p>
      </div>
    </>
  );
}
