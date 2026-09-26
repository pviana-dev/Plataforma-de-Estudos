/* PWA (pedido do Pedro, 26/09): manifest com o nome "Estudos", ícones em arquivo,
   service worker registrado só em https, e o sw.js — página pela rede primeiro
   (cópia guardada sem internet), Supabase nunca passa por ele. */
const fs=require("fs"),path=require("path"),vm=require("vm"),{JSDOM}=require("jsdom");
const raiz=path.join(__dirname,"..");
const html=fs.readFileSync(raiz+"/index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const seed={versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",metaDiariaMin:120,disciplinas:[],grupos:[],
  lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  conteudos:[],registros:[],revisoes:[],erros:[],cronometro:null};
function abrir(url, tema){
  const dom=new JSDOM(html,{runScripts:"dangerously",url,pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true;
     w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(Object.assign({},seed,{tema:tema||"claro"})));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"hoje",gravadoEm:hoje}));
     w.__registrou=[];
     Object.defineProperty(w.navigator,"serviceWorker",{value:{register:u=>{w.__registrou.push(u);return Promise.resolve();}}});
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}

(async()=>{try{
  /* ---- 1. manifest e arquivos ---- */
  const man=JSON.parse(fs.readFileSync(raiz+"/manifest.webmanifest","utf8"));
  ok("manifest: nome embaixo do ícone é Estudos", man.short_name==="Estudos", man.short_name);
  ok("manifest: abre em janela própria", man.display==="standalone" && man.start_url==="./", man);
  ok("manifest: ícone 192, 512 e o de máscara", ["192x192","512x512"].every(s=>man.icons.some(i=>i.sizes===s&&i.purpose==="any"))
     && man.icons.some(i=>i.purpose==="maskable"), man.icons);
  const faltando=man.icons.map(i=>i.src).filter(s=>!fs.existsSync(raiz+"/"+s));
  ok("todos os ícones do manifest existem", !faltando.length, faltando);

  /* ---- 2. o index.html ---- */
  let w=abrir("https://t.local/"); await espera(500);
  const doc=w.document;
  ok("liga o manifest", !!doc.querySelector('link[rel="manifest"][href="manifest.webmanifest"]'));
  const icones=[...doc.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]')].map(l=>l.getAttribute("href"));
  ok("ícones em arquivo, nenhum embutido", icones.length===3 && icones.every(h=>!h.startsWith("data:") && fs.existsSync(raiz+"/"+h)), icones);
  ok("nome no iPhone: Estudos", doc.querySelector('meta[name="apple-mobile-web-app-title"]').content==="Estudos");
  ok("em https, registra o sw.js", JSON.stringify(w.__registrou)==='["sw.js"]', w.__registrou);
  ok("barra do sistema na cor do fundo claro", doc.querySelector('meta[name="theme-color"]').content==="#f2f1ec");
  w=abrir("https://t.local/","escuro"); await espera(500);
  ok("…e do fundo escuro no tema escuro", w.document.querySelector('meta[name="theme-color"]').content==="#1c2123");
  w=abrir("http://t.local/"); await espera(500);
  ok("fora de https (e fora do localhost), não registra", w.__registrou.length===0, w.__registrou);

  /* ---- 3. o sw.js, com a rede e o cache de mentira ---- */
  const guardado=new Map(); let rede="ok"; const ouvintes={};
  const resp=(corpo,okk=true)=>({ok:okk,corpo,clone(){return resp(corpo,okk);}});
  const cacheFalso={ addAll:async l=>l.forEach(u=>guardado.set(u,resp("cópia de "+u))),
                     put:async(k,r)=>guardado.set(k,r) };
  const ctx={ self:{ location:{origin:"https://t.local"}, addEventListener:(t,f)=>ouvintes[t]=f,
                     skipWaiting:()=>{}, clients:{claim:()=>{}} },
    caches:{ open:async()=>cacheFalso, keys:async()=>["estudos-v0","estudos-v1"], delete:async n=>{ctx.__apagou=n;},
             match:async(req)=>guardado.get(typeof req==="string"?req:new URL(req.url).pathname.replace(/^\//,"")) },
    fetch:async()=>{ if(rede==="fora") throw new Error("sem rede"); if(rede==="lenta") await espera(6000); return resp("nova"); },
    URL, Promise, setTimeout, clearTimeout, Response:{error:()=>"erro"} };
  vm.runInNewContext(fs.readFileSync(raiz+"/sw.js","utf8"),ctx);
  const disparar=async(tipo,ev)=>{ let p; ev.waitUntil=x=>p=x; ev.respondWith=x=>p=x; ouvintes[tipo](ev); return p===undefined?"não respondeu":await p; };
  await disparar("install",{});
  ok("instalar guarda a página e os ícones", guardado.has("./") && guardado.has("icones/icone-192.png"), [...guardado.keys()]);
  await disparar("activate",{});
  ok("ativar apaga a versão antiga do cache", ctx.__apagou==="estudos-v0", ctx.__apagou);
  const pagina={request:{method:"GET",mode:"navigate",url:"https://t.local/"}};
  let r=await disparar("fetch",pagina);
  ok("com internet, a página vem da rede", r.corpo==="nova", r);
  await espera(20);
  ok("…e a cópia guardada é atualizada", guardado.get("./").corpo==="nova", guardado.get("./"));
  rede="fora"; guardado.set("./",resp("cópia"));
  r=await disparar("fetch",{request:{method:"GET",mode:"navigate",url:"https://t.local/"}});
  ok("sem internet, abre a cópia guardada", r.corpo==="cópia", r);
  r=await disparar("fetch",{request:{method:"GET",mode:"no-cors",url:"https://t.local/icones/icone-192.png"}});
  ok("ícone vem da cópia", /cópia de icones\/icone-192.png/.test(r.corpo), r);
  r=await disparar("fetch",{request:{method:"GET",mode:"cors",url:"https://x.supabase.co/rest/v1/dados"}});
  ok("Supabase não passa pelo service worker", r==="não respondeu", r);
  r=await disparar("fetch",{request:{method:"POST",mode:"cors",url:"https://t.local/"}});
  ok("gravação (POST) também não", r==="não respondeu", r);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nPWA pronto: manifest, ícones e service worker");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
