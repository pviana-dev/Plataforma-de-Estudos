const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:6,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"prazo de 20 dias",
   categoria:"",refeita:false,importante:false,criadoEm:Date.now()}],
 cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const val=(el,prop)=>w.getComputedStyle(el).getPropertyValue(prop).trim();
const token=t=>w.getComputedStyle(doc.documentElement).getPropertyValue(t).trim();

(async()=>{try{
  await espera(300);
  /* ---- B: as superfícies secundárias ganharam corpo ---- */
  ok("surface-2 saiu do tom apagado", token("--surface-2")==="#e9e5d9", token("--surface-2"));
  ok("surface-3 acompanhou para não colar em surface-2", token("--surface-3")==="#ded9c9", token("--surface-3"));

  /* ---- A: o texto sobre elas deixou de ser cinza-frio ---- */
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  // o jsdom não resolve var() no computed style: comparamos o valor declarado
  const sub=$(".apr-origem span");
  ok("o subtítulo do card de anotação usa text-2", val(sub,"color")==="var(--text-2)", val(sub,"color"));
  const rot=$(".filtros .campo > span");
  ok("os rótulos dos filtros também", val(rot,"color")==="var(--text-2)", val(rot,"color"));
  ok("e não é mais o cinza de desabilitado", val(sub,"color")!=="var(--muted)", val(sub,"color"));

  /* ---- o que é inerte de propósito continua apagado ---- */
  click(doc.querySelector('[data-aba="painel"]')); await espera(300);
  ok("o dia vazio segue com o cinza de inerte (é o sentido dele)",
     /\.dia-info\.vazia \.dia-rot\{color:var\(--muted\)\}/.test(html));

  /* ---- as telas de criação/edição ----
     (o jsdom descarta shorthand com var(), então a conferência é na folha) ---- */
  click(doc.querySelector('[data-aba="registros"]')); await espera(300);
  ok("o formulário abre numa tela sobreposta", !!$(".modal") || !!$("#formRegistro"));
  ok("os campos têm fundo e aro próprios, não o tom do fundo da página",
     /\.campo input,\.campo select,\.campo textarea\{\s*border:1px solid var\(--campo-borda\);background:var\(--campo-fundo\)/.test(html));
  ok("o foco mantém o mesmo fundo, mudando só o aro",
     /:focus\{border-color:var\(--accent\);background:var\(--campo-fundo\)/.test(html));
  ok("as pílulas de opção acompanham",
     /\.opcao\{[^}]*?border:1px solid var\(--campo-borda\);background:var\(--campo-fundo\)/s.test(html));
  ok("a caixa de marcar da revisão também",
     /\.check\{[^}]*?border:1\.5px solid var\(--campo-borda\);\s*background:var\(--campo-fundo\)/s.test(html));
  ok("os botões secundários da tela de edição também",
     /\.btn\.ghost\{background:var\(--campo-fundo\);color:var\(--text-2\);border-color:var\(--campo-borda\)/.test(html));
  ok("e a barra de formatação da anotação",
     /\.fmt \.act\{[^}]*?border:1px solid var\(--campo-borda\);background:var\(--campo-fundo\)/s.test(html));
  ok("o token do campo existe nos dois temas",
     /--campo-fundo:#fdfcfa/.test(html) && /--campo-fundo:#2a3133/.test(html));

  /* ---- C: chrome ativo em verde claro, cinza só para o inerte ---- */
  ok("a barra de filtros usa o verde do chrome",
     /\.filtros\{[^}]*?background:var\(--chrome\);border:1px solid var\(--chrome-borda\)/s.test(html));
  ok("o cabeçalho do card de anotação também",
     /\.apr-cab\{[^}]*?background:var\(--chrome\);\s*border-bottom:1px solid var\(--chrome-borda\)/s.test(html));
  ok("a etiqueta neutra do cabeçalho inverte para não sumir",
     /\.apr-cab \.badge\{background:var\(--campo-fundo\)\}/.test(html));
  ok("e a etiqueta 'filtro ativo' também", /\.filtros \.marca-filtro\{background:var\(--campo-fundo\)\}/.test(html));
  ok("anotação em edição passa a usar o tom de estado ativo",
     /\.apr-item\.em-edicao\{padding:11px 13px;background:var\(--accent-soft\)\}/.test(html));
  ok("o chrome é token, definido nos dois temas",
     (html.match(/--chrome:var\(--accent-soft\)/g)||[]).length>=2);
  ok("o cinza-areia sobrou só para o inerte e para molduras neutras",
     !/\.filtros\{[^}]*?background:var\(--surface-2\)/s.test(html) &&
     !/\.apr-cab\{[^}]*?background:var\(--surface-2\)/s.test(html) &&
     /\.dia-info\.vazia\{border-left-color:var\(--border\);background:var\(--surface-2\)\}/.test(html));

  /* ---- ROLLBACK: um atributo devolve tudo ---- */
  doc.documentElement.setAttribute("data-tons","classico");
  await espera(60);
  ok("com data-tons=classico, surface-2 volta ao valor antigo", token("--surface-2")==="#eceae2",
     token("--surface-2"));
  ok("e surface-3 também", token("--surface-3")==="#e3e0d6", token("--surface-3"));
  ok("os campos voltam ao fundo da página", token("--campo-fundo")==="var(--bg)", token("--campo-fundo"));
  ok("e ao aro antigo", token("--campo-borda")==="var(--border)", token("--campo-borda"));
  ok("o chrome volta ao cinza-areia", token("--chrome")==="var(--surface-2)", token("--chrome"));
  click(doc.querySelector('[data-aba="erros"]')); await espera(300);
  const sub2=$(".apr-origem span");
  ok("o texto volta a ser --muted no rollback", val(sub2,"color")==="var(--muted)", val(sub2,"color"));
  ok("o rollback também cobre o tema escuro",
     /html\[data-tons="classico"\]\[data-tema="escuro"\]\{ --surface-2:#2c3335/.test(html));
  ok("e está documentado no próprio arquivo", /PARA VOLTAR AO ANTERIOR/.test(html));

  /* ---- tirando o atributo, volta ao novo ---- */
  doc.documentElement.removeAttribute("data-tons"); await espera(60);
  ok("tirar o atributo devolve os tons novos", token("--surface-2")==="#e9e5d9", token("--surface-2"));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntons novos e rollback funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
