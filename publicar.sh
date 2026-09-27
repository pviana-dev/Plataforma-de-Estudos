#!/bin/bash
# Publica o app em https://plataforma-de-estudos.pages.dev (Cloudflare Pages).
# Sobe SÓ o que o navegador usa — o app, o manifest, o service worker e os ícones;
# testes, SQL e anotações ficam de fora. Rodar depois do commit:  ./publicar.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -z "$(git status --porcelain -- index.html manifest.webmanifest sw.js icones)" ] ||
  { echo "Há alterações sem commit no que vai ser publicado — faça o commit antes."; exit 1; }
pasta=$(mktemp -d)
trap 'rm -rf "$pasta"' EXIT
cp index.html manifest.webmanifest sw.js "$pasta"/
cp -R icones "$pasta"/

# CABEÇALHOS DE SEGURANÇA (checagem de 27/09), no arquivo _headers do Cloudflare.
# A CSP só deixa rodar o script do próprio app — identificado pelo hash do conteúdo,
# recalculado aqui a cada publicação — e só deixa conversar com o Supabase do bloco
# NUVEM. Assim, mesmo um código injetado não roda nem manda dado para outro lugar.
python3 - "$pasta/_headers" <<'PY'
import base64, hashlib, re, sys
html = open("index.html", encoding="utf-8").read()
scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
if len(scripts) != 1 or html.count("<script") != 1:
    sys.exit("publicar.sh: esperava exatamente um <script> embutido no index.html — ajuste a CSP.")
hash_ = base64.b64encode(hashlib.sha256(scripts[0].encode("utf-8")).digest()).decode()
nuvem = re.search(r'url:\s*"(https://[a-z0-9]+\.supabase\.co)"', html)
if not nuvem:
    sys.exit("publicar.sh: não achei a URL do Supabase no bloco NUVEM.")
csp = "; ".join([
    "default-src 'self'",
    f"script-src 'self' 'sha256-{hash_}'",
    "style-src 'self' 'unsafe-inline'",           # o app usa style="…" nos elementos
    "img-src 'self' data: blob:",
    f"connect-src 'self' {nuvem.group(1)}",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
])
open(sys.argv[1], "w").write(
    "/*\n"
    f"  Content-Security-Policy: {csp}\n"
    "  X-Frame-Options: DENY\n"
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()\n")
print("CSP com o hash do script:", hash_[:12] + "…")
PY

npx --yes wrangler@latest pages deploy "$pasta" --project-name=plataforma-de-estudos --branch=main \
  --commit-hash="$(git rev-parse HEAD)" --commit-message="$(git log -1 --format=%s)"
