import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Revalidação on-demand de páginas ISR. Chamado pelo hook `revalidatePage`
 * do Payload (apps/cms) após publicação de um documento, para que a edição
 * apareça no site em segundos sem aguardar o ISR (revalidate: 3600) nem um
 * novo deploy.
 *
 * Autenticação por segredo compartilhado no header `X-Revalidate-Secret`,
 * comparado a `REVALIDATE_SECRET`. Sem o segredo correto → 401.
 *
 * Body: `{ "path": "/o-grupo/corpo-docente" }` (path público a revalidar).
 *
 * Spec: docs/superpowers/specs/2026-06-01-cms-eventos-palestrantes-design.md
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, error: "REVALIDATE_SECRET não configurado no servidor." },
      { status: 500 },
    );
  }

  const enviado = request.headers.get("X-Revalidate-Secret");
  if (enviado !== secret) {
    return NextResponse.json({ revalidated: false, error: "Não autorizado." }, { status: 401 });
  }

  let path: unknown;
  try {
    const body = (await request.json()) as { path?: unknown };
    path = body.path;
  } catch {
    return NextResponse.json({ revalidated: false, error: "Body JSON inválido." }, { status: 400 });
  }

  if (typeof path !== "string" || !path.startsWith("/")) {
    return NextResponse.json(
      { revalidated: false, error: "Campo 'path' ausente ou inválido (deve começar com '/')." },
      { status: 400 },
    );
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
