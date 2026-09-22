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
 * Opcionalmente, `{ "escopo": "layout" }` revalida o layout inteiro daquele
 * path — usado pela edição de Contatos institucionais (Painel Admin →
 * Configurações), porque o rodapé aparece em TODOS os route groups do site
 * (home, institucional, o-grupo, programas, capacitação, conteúdos,
 * soluções, vertical); revalidar só "/" não invalidaria o layout de
 * `/contato`, `/agenda/[slug]` etc., que renderizam o próprio rodapé a
 * partir do layout raiz compartilhado.
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
  let escopo: unknown;
  try {
    const body = (await request.json()) as { path?: unknown; escopo?: unknown };
    path = body.path;
    escopo = body.escopo;
  } catch {
    return NextResponse.json({ revalidated: false, error: "Body JSON inválido." }, { status: 400 });
  }

  if (typeof path !== "string" || !path.startsWith("/")) {
    return NextResponse.json(
      { revalidated: false, error: "Campo 'path' ausente ou inválido (deve começar com '/')." },
      { status: 400 },
    );
  }

  if (escopo === undefined) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  }

  if (escopo !== "layout") {
    return NextResponse.json({ revalidated: false, error: "Escopo inválido." }, { status: 400 });
  }

  revalidatePath(path, "layout");
  return NextResponse.json({ revalidated: true, path, escopo });
}
