// Service worker do Painel NTC. Nunca cacheia resposta autenticada: guarda só
// a tela "Sem conexão" e o ícone. Só intercepta navegações.
const CACHE = "painel-ntc-v1";
const ARQUIVOS = ["/offline.html", "/icones/icone-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline.html")),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let aviso;
  try {
    aviso = event.data.json();
  } catch {
    return;
  }
  const { body, url, tag } = aviso;
  const title = aviso.title || "Painel NTC";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon: "/icones/icone-192.png",
      badge: "/icones/icone-192.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((j) => new URL(j.url).origin === self.location.origin);
      if (!aberta) return self.clients.openWindow(url);
      // navigate() pode faltar (alguns navegadores) ou rejeitar numa janela não controlada.
      const abrirNova = () => self.clients.openWindow(url);
      if (!("navigate" in aberta)) return aberta.focus().then(abrirNova, abrirNova);
      return aberta
        .focus()
        .then((foco) => (foco || aberta).navigate(url))
        .catch(abrirNova);
    }),
  );
});
