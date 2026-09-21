#!/bin/bash
# Roda todas as suítes. Uso:  ./rodar.sh          (todas)
#                             ./rodar.sh fases    (só as que casam com "fases")
cd "$(dirname "$0")"
[ -d node_modules ] || { echo "instalando jsdom…"; npm install --silent --no-audit --no-fund; }
filtro="$1"; falhas=""; n=0
for f in *.js; do
  nome="${f%.js}"
  [ "$nome" = "rodar" ] && continue
  [ -n "$filtro" ] && [[ "$nome" != *"$filtro"* ]] && continue
  n=$((n+1))
  if out=$(node "$f" 2>&1); then
    printf "%-13s %s\n" "$nome" "$(echo "$out" | tail -1)"
  else
    falhas="$falhas $nome"
    printf "%-13s FALHOU\n" "$nome"
    echo "$out" | grep -E "FALHA|ERRO|Error" | head -4
  fi
done
echo "----------------------------------------"
[ -z "$falhas" ] && echo "$n suítes · todas verdes" || { echo "$n suítes · falham:$falhas"; exit 1; }
