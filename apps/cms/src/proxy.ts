import { NextResponse, type NextRequest } from "next/server";

import { rotaDeApiBloqueada } from "./lib/cms/rotasApiBloqueadas";

/** Fecha a REST de `users` e o GraphQL do Payload — ver `rotasApiBloqueadas.ts`. */
export function proxy(req: NextRequest) {
  if (rotaDeApiBloqueada(req.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/users", "/api/users/:path*", "/api/graphql", "/api/graphql-playground"],
};
