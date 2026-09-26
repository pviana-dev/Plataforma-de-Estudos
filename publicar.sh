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
npx --yes wrangler@latest pages deploy "$pasta" --project-name=plataforma-de-estudos --branch=main \
  --commit-hash="$(git rev-parse HEAD)" --commit-message="$(git log -1 --format=%s)"
