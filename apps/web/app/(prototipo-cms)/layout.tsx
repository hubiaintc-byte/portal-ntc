import type { ReactNode } from "react";

/**
 * Layout do route group (prototipo-cms).
 *
 * Tela cheia de aplicação — sem o header/footer do site. O CSS dedicado
 * (prototipo-cms.css) é importado no root layout (apps/web/app/layout.tsx),
 * seguindo o padrão das demais páginas portadas: o Next 15 entrega CSS pelo
 * path do componente importador, e route groups com parênteses causam 404 se
 * o import partir daqui. As classes são prefixadas `pcms-`, sem colisão.
 */
export default function PrototipoCmsLayout({ children }: { children: ReactNode }) {
  return children;
}
