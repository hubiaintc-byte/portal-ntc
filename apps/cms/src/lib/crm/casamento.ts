import type { CollectionAfterChangeHook, RequiredDataFromCollectionSlug } from "payload";

import { casarCliente, type ClienteCandidato } from "@ntc/lib";
import type { ClienteCrm, Lead } from "@ntc/types";

/**
 * Casamento automático lead → cliente na criação (spec 2026-09-15 §5.1).
 * O hook carrega os candidatos, chama a regra pura de @ntc/lib e escreve o
 * vínculo (ou cria o cliente). A escrita do vínculo é um `update` do próprio
 * lead com `context.casamentoAutomatico`, que a linha do tempo (Task 6) lê
 * para registrar "Lead recebido pelo site · vinculado por …".
 */

type ClienteCrmData = RequiredDataFromCollectionSlug<"clientes-crm">;

export function candidatoDeCliente(doc: ClienteCrm): ClienteCandidato {
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    cnpj: doc.cnpj ?? null,
    email: doc.email ?? null,
    emailsContatos: (doc.contatos ?? [])
      .map((c) => c.email ?? null)
      .filter((e): e is string => e !== null && e !== ""),
  };
}

/**
 * `Lead.esfera` usa ESFERA_INSTITUCIONAL (municipal · estadual · federal ·
 * privada · terceiro-setor); `ClienteCrm.esfera` usa ESFERAS_CRM (municipal ·
 * estadual · federal · consorcio · autarquia · fundacao · escola-de-governo ·
 * tribunal · camara · assembleia · outros). Só os três primeiros coincidem;
 * `privada`/`terceiro-setor` (e qualquer outro valor) não têm correspondente
 * no CRM e viram `null` — o cliente nasce sem esfera definida, não com um
 * valor incorreto.
 */
export const ESFERA_LEAD_PARA_CLIENTE: Record<string, ClienteCrmData["esfera"]> = {
  municipal: "municipal",
  estadual: "estadual",
  federal: "federal",
};

export function dadosDoClienteNovo(lead: Lead): ClienteCrmData {
  const orgao = lead.instituicao?.trim() ? lead.instituicao.trim() : `${lead.nome} (órgão a confirmar)`;
  return {
    orgao,
    esfera: lead.esfera ? (ESFERA_LEAD_PARA_CLIENTE[lead.esfera] ?? null) : null,
    email: null,
    origem: "lead-site",
    contatos: [
      {
        nome: lead.nome,
        cargo: lead.cargo ?? null,
        setor: null,
        email: lead.email,
        whatsapp: lead.telefone ?? null,
        principal: true,
        decisor: false,
      },
    ],
  };
}

export const casarClienteDoLead: CollectionAfterChangeHook<Lead> = async ({ doc, operation, req }) => {
  if (operation !== "create" || doc.tipo !== "proposta" || doc.cliente) return doc;

  const clientes = await req.payload.find({ collection: "clientes-crm", limit: 1000, depth: 0, req });
  const casado = casarCliente(
    { instituicao: doc.instituicao ?? null, email: doc.email, cnpj: null },
    clientes.docs.map(candidatoDeCliente),
  );

  let clienteId: number;
  let por: NonNullable<Lead["clienteCasadoPor"]>;
  if (casado !== null) {
    clienteId = Number(casado.clienteId);
    por = casado.por;
  } else {
    const novo = await req.payload.create({ collection: "clientes-crm", data: dadosDoClienteNovo(doc), req });
    clienteId = Number(novo.id);
    por = "criado";
  }

  // Grava o motivo em `req.context` ANTES do update aninhado (e não só no
  // `context` passado a ele): o update roda o `afterChange` de `leads` de
  // novo, na mesma transação, e devolve o controle para o segundo hook do
  // `afterChange` externo do `create` (`registrarLeadNaLinhaDoTempo`) —
  // que precisa enxergar `casamentoAutomatico` para não duplicar o item da
  // linha do tempo (fix round 1, achado Critical da revisão). `req.context`
  // é o mesmo objeto em toda a operação (Payload o mutila via
  // `createLocalReq`), então esta escrita é o jeito garantido de o hook
  // externo ver o valor, independente de qual `context` o Payload repassa
  // a cada chamada de hook.
  // ATENÇÃO: a flag fica viva no `req` até o fim da operação. Uma importação
  // em lote que reutilize um mesmo `req` para criar vários leads precisa
  // zerar `req.context.casamentoAutomatico` antes de cada `create`, senão o
  // segundo lead herda o valor do primeiro e a linha do tempo dele sai errada.
  req.context.casamentoAutomatico = por;

  await req.payload.update({
    collection: "leads",
    id: doc.id,
    data: { cliente: clienteId, clienteCasadoPor: por },
    req,
    context: { casamentoAutomatico: por },
  });
  return { ...doc, cliente: clienteId, clienteCasadoPor: por };
};
