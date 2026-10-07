// Service worker da Roleta CG LUB: deixa o app funcionando offline.
// Ao publicar uma versão nova, mude o número abaixo.
const VERSAO = 'roleta-cglub-v2';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png',
  './assets/logo-cglub-cor.png',
  './assets/simbolo-cor.png',
  './assets/simbolo-amarelo.png',
  './assets/simbolo-verde.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Página: tenta a internet primeiro (pega atualizações), sem internet usa a cópia salva
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(VERSAO).then(c => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Fontes do Google e arquivos do app: usa a cópia salva, busca na internet se não tiver
  if (url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(req, cp)); }
        return r;
      }))
    );
  }
});
