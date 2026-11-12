import { readFile } from "node:fs/promises";
import path from "node:path";

// Central de Acesso NTC (link da bio do Instagram). Serve em /central a
// página estática homologada que fica em public/central/index.html.
// Gerada no build (estática): não consulta banco nem CMS.
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const html = await readFile(path.join(process.cwd(), "public", "central", "index.html"), "utf8");
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
