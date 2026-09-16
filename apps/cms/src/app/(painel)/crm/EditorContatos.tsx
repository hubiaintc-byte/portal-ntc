"use client";

import { useId } from "react";

import type { DadosContato } from "@/lib/cms/painelCrmEscrita";

interface EditorContatosProps {
  contatos: DadosContato[];
  onMudar: (contatos: DadosContato[]) => void;
}

const VAZIO: DadosContato = { nome: "", cargo: "", setor: "", email: "", whatsapp: "", principal: false, decisor: false };

/** Array de contatos do cliente, inline. Marcar um como principal desmarca os outros. */
export function EditorContatos({ contatos, onMudar }: EditorContatosProps) {
  const nomeGrupo = useId();

  const mudar = (i: number, campo: keyof DadosContato, v: string | boolean) =>
    onMudar(
      contatos.map((c, j) => {
        if (campo === "principal" && v === true) return { ...c, principal: j === i };
        return j === i ? { ...c, [campo]: v } : c;
      }),
    );

  return (
    <div className="pcms-contatos">
      <div className="pcms-editor__head--sub">Contatos</div>
      {contatos.length === 0 && <p className="pcms-vazio">Nenhum contato. Adicione a pessoa com quem vocês falam no órgão.</p>}
      {contatos.map((c, i) => (
        <fieldset key={i} className="pcms-contatos__linha">
          <legend className="pcms-sr-only">Contato {i + 1}</legend>
          <input aria-label="Nome" placeholder="Nome" value={c.nome} onChange={(e) => mudar(i, "nome", e.target.value)} required />
          <input aria-label="Cargo" placeholder="Cargo" value={c.cargo} onChange={(e) => mudar(i, "cargo", e.target.value)} />
          <input aria-label="Setor" placeholder="Setor" value={c.setor} onChange={(e) => mudar(i, "setor", e.target.value)} />
          <input aria-label="E-mail" type="email" placeholder="E-mail" value={c.email} onChange={(e) => mudar(i, "email", e.target.value)} />
          <input aria-label="WhatsApp" placeholder="WhatsApp" value={c.whatsapp} onChange={(e) => mudar(i, "whatsapp", e.target.value)} />
          <label>
            <input type="radio" name={nomeGrupo} checked={c.principal} onChange={() => mudar(i, "principal", true)} /> Principal
          </label>
          <label>
            <input type="checkbox" checked={c.decisor} onChange={(e) => mudar(i, "decisor", e.target.checked)} /> Decisor
          </label>
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost pcms-btn--mini"
            aria-label={`Remover contato ${c.nome || i + 1}`}
            onClick={() => onMudar(contatos.filter((_, j) => j !== i))}
          >
            Remover
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
        onClick={() => onMudar([...contatos, { ...VAZIO, principal: contatos.length === 0 }])}
      >
        Adicionar contato
      </button>
    </div>
  );
}
