/* O SERVICE WORKER DO PWA (26/09). Guarda o app no aparelho para ele abrir sem
   internet. Nada de dado passa por aqui: os dados moram no navegador e na nuvem.

   · A página (index.html): REDE PRIMEIRO. Com internet, vem sempre a versão
     publicada mais nova — ninguém fica preso numa versão velha — e a cópia
     guardada é atualizada. Sem internet (ou rede lenta demais), abre a cópia.
   · Ícones e manifest: a cópia guardada primeiro; mudam quase nunca.
   · Outros endereços (Supabase): não passam por aqui. Dado da nuvem nunca vem
     de cópia guardada.

   Mudou a lista de arquivos ou um ícone? Suba a VERSAO: a instalação nova
   guarda tudo de novo e apaga as cópias antigas. */
const VERSAO = "estudos-v1";
const ARQUIVOS = [
  "./",
  "manifest.webmanifest",
  "icones/icone.svg",
  "icones/icone-64.png",
  "icones/icone-192.png",
  "icones/icone-512.png",
  "icones/icone-mascara-512.png",
  "icones/apple-touch-icon.png"
];
const ESPERA_REDE_MS = 4000;          // rede mais lenta que isso: abre a cópia

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

function paginaPelaRede(req){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("rede lenta")), ESPERA_REDE_MS);
    fetch(req).then(resp => {
      clearTimeout(t);
      if (resp.ok){
        const copia = resp.clone();
        caches.open(VERSAO).then(c => c.put("./", copia));
      }
      resolve(resp);
    }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Supabase e afins: direto na rede

  if (req.mode === "navigate"){
    ev.respondWith(paginaPelaRede(req).catch(() =>
      caches.match("./").then(r => r || Response.error())));
    return;
  }
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
