import { Fragment } from "react";

export interface ItemBreadcrumb {
  rotulo: string;
  href?: string;
}

export interface BreadcrumbsProps {
  itens: ItemBreadcrumb[];
  className?: string;
  baseUrl?: string;
}

export function Breadcrumbs({ itens, className, baseUrl }: BreadcrumbsProps) {
  if (itens.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.rotulo,
      ...(item.href
        ? { item: baseUrl ? new URL(item.href, baseUrl).toString() : item.href }
        : {}),
    })),
  };

  const classes = [
    "font-corpo text-pequeno text-grafite-suave",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav aria-label="Caminho editorial" className={classes}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {itens.map((item, index) => {
          const ehUltimo = index === itens.length - 1;
          return (
            <Fragment key={`${item.rotulo}-${index}`}>
              <li className="flex items-center">
                {ehUltimo || !item.href ? (
                  <span
                    aria-current={ehUltimo ? "page" : undefined}
                    className="text-oxford"
                  >
                    {item.rotulo}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="text-grafite-suave transition-colors hover:text-oxford focus-visible:text-oxford"
                  >
                    {item.rotulo}
                  </a>
                )}
              </li>
              {!ehUltimo && (
                <li aria-hidden="true" className="text-linha-sutil">
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
