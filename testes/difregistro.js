/* PEDIDO DE 29/09: na sessão, a dificuldade vem da aba Disciplinas.
   0. sem botão "+ adicionar": escolher na lista já põe o conteúdo na sessão;
   1. e já traz a dificuldade dele,
      mesmo com outra escolhida;
   2. conteúdo criado ali nasce na aba Disciplinas com a dificuldade escolhida na sessão. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const ficha=(nome,extra)=>Object.assign({id:"c"+nome,disciplina:"Legislação",nome,fase:"andamento",concluidoEm:null},extra||{});
const base=()=>({versao:1,tema:"claro",objetivo:"livre",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação"],
 grupos:[],lancamentos:[],fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
 conteudos:[],registros:[],revisoes:[],erros:[],cronometro:null});
function abrir(seed){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"registros",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const muda=(w,el,v)=>{ el.value=v; el.dispatchEvent(new w.Event("change",{bubbles:true})); };
const clica=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));

(async()=>{try{
  const s=base(); s.conteudos=[ficha("LAI",{dificuldade:3}),ficha("LGPD",{dificuldade:1})];
  let w=abrir(s); await espera(450);
  clica(w,w.document.querySelector('[data-acao="toggle-form-registro"]')); await espera(250);
  let f=w.document.querySelector("#formRegistro");
  muda(w,f.querySelector("select.sel-disciplina"),"Legislação"); await espera(250);
  const dif=()=>w.document.querySelector('#formRegistro [name="dificuldade"]').value;
  muda(w,w.document.querySelector("#formRegistro [name=dificuldade]"),"2");
  muda(w,w.document.querySelector("#campoAssunto"),"LAI"); await espera(100);
  ok("0. não há mais botão '+ adicionar'", !w.document.querySelector('[data-acao="add-assunto"]'));
  ok("0. escolher LAI na lista já o põe na sessão", !!w.document.querySelector('#listaAssuntosForm [data-assunto="LAI"]'));
  ok("1. escolher LAI na lista já traz Difícil (da aba Disciplinas), trocando a Média escolhida", dif()==="3", dif());
  muda(w,w.document.querySelector("#campoAssunto"),"LGPD"); await espera(100);
  ok("1. LAI + LGPD na mesma sessão: vale a mais alta (Difícil)", dif()==="3", dif());

  /* ---- 2. conteúdo novo ---- */
  w=abrir(base()); await espera(450);
  clica(w,w.document.querySelector('[data-acao="toggle-form-registro"]')); await espera(250);
  f=w.document.querySelector("#formRegistro");
  muda(w,f.querySelector("select.sel-disciplina"),"Legislação"); await espera(250);
  muda(w,w.document.querySelector("#formRegistro [name=dificuldade]"),"3");
  muda(w,w.document.querySelector("#campoAssunto"),"__novo"); await espera(50);
  w.document.querySelector("#novoConteudoNome").value="Decreto 7.724";
  (()=>{const _c=w.document.querySelector("#campoAssunto"),_n=w.document.querySelector("#novoConteudoNome");if(_c.value==="__novo")_n.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));else _c.dispatchEvent(new w.Event("change",{bubbles:true}));})(); await espera(150);
  const fc=()=>db(w).conteudos.find(c=>c.nome==="Decreto 7.724");
  ok("2. o conteúdo criado já está no cadastro, com Difícil", fc() && fc().dificuldade===3, fc());
  muda(w,w.document.querySelector("#formRegistro [name=dificuldade]"),"1");
  w.document.querySelector("#formRegistro [name=minutos]").value="30";
  w.document.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("2. salvando com Fácil, a ficha fica com Fácil", fc() && fc().dificuldade===1, fc());
  clica(w,w.document.querySelector('[data-aba="conteudos"]')); await espera(300);
  const sel=w.document.querySelector('.sel-dif-cont[data-cont="Decreto 7.724"]');
  ok("2. e a aba Disciplinas mostra Fácil", sel && sel.value==="1", sel && sel.value);
}catch(e){ console.log("ERRO",e); falhas++; }
console.log(falhas ? falhas+" falha(s)" : "tudo ok"); process.exit(falhas?1:0);})();
