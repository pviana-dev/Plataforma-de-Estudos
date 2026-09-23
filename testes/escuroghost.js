/* No tema escuro o texto escuro é só do botão CHEIO. Valendo para o ghost
   (fundo de campo, escuro), ele ganhava por especificidade e o texto sumia —
   os botões do filtro das Anotações só apareciam com o mouse em cima. */
const fs=require("fs");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const regras=[...html.matchAll(/html\[data-tema="escuro"\]\s*\.btn([^{]*)\{[^}]*color:#1b2224/g)].map(m=>".btn"+m[1].trim());
ok("o texto escuro do tema escuro não pega o botão ghost",
   regras.length>0 && regras.every(r=>/:not\(\.ghost\)/.test(r) || !/^\.btn(\s|$)/.test(r+" ")), regras);
ok("e continua valendo para o botão cheio", regras.some(r=>/^\.btn:not\(\.ghost\)$/.test(r)), regras);
console.log(falhas?falhas+" FALHA(S)":"botão ghost legível no tema escuro");process.exit(falhas?1:0);
