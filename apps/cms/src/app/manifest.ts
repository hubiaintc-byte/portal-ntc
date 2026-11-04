import type { MetadataRoute } from "next";

/** Manifest do app "Painel NTC" (PWA instalável). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Painel NTC",
    short_name: "Painel NTC",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#11365E",
    background_color: "#11365E",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
