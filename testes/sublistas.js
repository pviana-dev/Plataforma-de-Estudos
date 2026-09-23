/* Sublistas nas anotações ("- ", "-- ", "--- ") e os botões de cor chamados
   pela cor, não pelo significado. Testa textoFormatado isolada: é uma função
   pura, e montar a tela inteira não diria nada a mais sobre o HTML dela. */
const fs=require("fs");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const fonte=html.slice(html.indexOf("function textoFormatado(txt){"), html.indexOf("/* A CAIXA CRESCE COM O TEXTO."));
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const textoFormatado=eval("("+fonte+")");
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};

let h=textoFormatado("- a\n-- b\n--- c\n- d");
ok("três níveis viram listas aninhadas", h==="<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>", h);
h=textoFormatado("- a\n-- b\n-- c\n- d");
ok("irmãos no segundo nível ficam na mesma sublista", h==="<ul><li>a<ul><li>b</li><li>c</li></ul></li><li>d</li></ul>", h);
h=textoFormatado("- a\n--- pulou");
ok("não desce dois níveis de uma vez (sem <li> vazio)", h==="<ul><li>a<ul><li>pulou</li></ul></li></ul>", h);
h=textoFormatado("-- sozinho");
ok("sublista sem pai vira item do primeiro nível", h==="<ul><li>sozinho</li></ul>", h);
h=textoFormatado("- a\n-- **b**\n\ntexto");
ok("formatação dentro do subitem, e o parágrafo depois", h==="<ul><li>a<ul><li><strong>b</strong></li></ul></li></ul><p>texto</p>", h);
h=textoFormatado("a -- b\n---- x");
ok("-- no meio da linha e quatro traços não viram lista", !/<ul>/.test(h), h);

const cores=(html.match(/CORES_TEXTO: \[([\s\S]*?)\]/)||[])[1]||"";
const rotulos=[...cores.matchAll(/rotulo:"([^"]+)"/g)].map(m=>m[1]);
ok("as cores se chamam pela cor", JSON.stringify(rotulos)===JSON.stringify(["grifar","vermelho","verde","azul"]), rotulos);
ok("sem atenção / regra / lei nos botões", !/atenção|regra|\blei\b/i.test(cores.replace(/id:"[^"]+"/g,"")), cores);

console.log(falhas?falhas+" FALHA(S)":"sublistas e nomes de cor ok");process.exit(falhas?1:0);
