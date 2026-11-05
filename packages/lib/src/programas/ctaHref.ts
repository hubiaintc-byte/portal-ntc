const PREFIXOS_CTA = ["/", "#", "http://", "https://", "mailto:"];

/** Link de botão vindo do painel: vazio (o site usa "#"), caminho interno, âncora, http(s) ou e-mail. */
export function ctaHrefPermitido(href: string): boolean {
  const h = href.trim().toLowerCase();
  return h === "" || PREFIXOS_CTA.some((p) => h.startsWith(p));
}
