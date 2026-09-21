const fs=require("fs"),{JSDOM}=require("jsdom");
const arquivo=__dirname + "/../index.html";
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};

/* servidor Supabase falso: guarda as chamadas e devolve o que a API devolveria */
function servidorFalso(){
  const est={chamadas:[],linha:null,codigo:"123456"};
  est.fetch=async(url,op={})=>{
    const corpo=op.body?JSON.parse(op.body):null;
    est.chamadas.push({url,metodo:op.method||"GET",corpo});
    const resp=(status,dados)=>({ok:status<400,status,statusText:"",json:async()=>dados});
    if (/\/auth\/v1\/otp/.test(url))    return resp(200,{});
    if (/\/auth\/v1\/verify/.test(url)) return corpo.token===est.codigo
      ? resp(200,{access_token:"tok",refresh_token:"ref",user:{id:"u1",email:corpo.email}})
      : resp(400,{msg:"Token has expired or is invalid"});
    if (/\/rest\/v1\/dados/.test(url) && (op.method||"GET")==="GET")
      return resp(200, est.linha?[est.linha]:[]);
    if (/\/rest\/v1\/dados/.test(url))  { est.linha={conteudo:corpo[0].conteudo,atualizado_em:corpo[0].atualizado_em}; return resp(204,null); }
    return resp(404,{msg:"não encontrado"});
  };
  return est;
}
function abrir(html, srv, sessao){
  return new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){
      w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      if (sessao) w.localStorage.setItem("plataforma-estudos:sessao",JSON.stringify(sessao));
      w.fetch=srv.fetch; w.confirm=()=>true;
    }});
}
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  const original=fs.readFileSync(arquivo,"utf8");

  /* ---- 1. sem configurar: nada muda ---- */
  const srv0=servidorFalso(), d0=abrir(original,srv0);
  await espera(300);
  ok("sem configurar, o chip da nuvem fica escondido", d0.window.document.getElementById("chipNuvem").hidden);
  ok("e nenhuma chamada de rede é feita", srv0.chamadas.length===0, srv0.chamadas);
  ok("a plataforma segue funcionando", /Estudo de hoje/.test(d0.window.document.getElementById("view").textContent));

  /* ---- 2. configurado: login por código ---- */
  const configurado=original.replace('  url:   "",', '  url:   "https://proj.supabase.co",')
                            .replace(`  chave: ""`, `  chave: "chave-anon"`);
  const srv=servidorFalso(), dom=abrir(configurado,srv);
  const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  const chip=doc.getElementById("chipNuvem");
  ok("configurado, o chip convida a entrar", !chip.hidden && /Entrar na conta/.test(chip.textContent), chip.textContent);
  click(chip); await espera(150);
  ok("o painel pede o e-mail", !!$("#formEntrar"));
  $("#emailEntrar").value="pessoa@exemplo.com";
  $("#formEntrar").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("o código foi pedido ao servidor", srv.chamadas.some(c=>/otp/.test(c.url)&&c.corpo.email==="pessoa@exemplo.com"),
     srv.chamadas.map(c=>c.url));
  ok("a tela passa a pedir o código", !!$("#formCodigo"));
  // código errado
  $("#codigoEntrar").value="000000";
  $("#formCodigo").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(200);
  ok("código errado é recusado com aviso", /não aceito/i.test($("#erroNuvem").textContent), $("#erroNuvem").textContent);
  $("#codigoEntrar").value="123456";
  $("#formCodigo").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(400);
  ok("com o código certo, entra", /pessoa/.test(doc.getElementById("chipNuvem").textContent),
     doc.getElementById("chipNuvem").textContent);
  ok("a sessão ficou salva", !!JSON.parse(w.localStorage.getItem("plataforma-estudos:sessao")||"null"));
  ok("os dados locais subiram na primeira conexão", !!srv.linha && srv.linha.conteudo.registros.length===1,
     srv.linha && srv.linha.conteudo.registros.length);

  /* ---- 3. cada alteração sobe ---- */
  const antes=srv.chamadas.filter(c=>c.metodo==="POST"&&/rest/.test(c.url)).length;
  click(doc.querySelector('[data-aba="registros"]')); await espera(200);
  click(doc.querySelector('[data-acao="editar-registro"]')); await espera(200);
  $("#modalCorpo [name=minutos]").value="77";
  $("#modalCorpo #formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await espera(1200);
  const depois=srv.chamadas.filter(c=>c.metodo==="POST"&&/rest/.test(c.url)).length;
  ok("editar um registro sobe para a nuvem", depois>antes, {antes,depois});
  ok("a nuvem tem o dado novo", srv.linha.conteudo.registros.some(r=>r.minutos===77),
     srv.linha.conteudo.registros.map(r=>r.minutos));

  /* ---- 4. outro aparelho: mesma conta, dados vêm da nuvem ---- */
  const srv2=servidorFalso();
  srv2.linha={conteudo:{...seed,registros:[...seed.registros,{id:"rZ",data:hoje,disciplina:"Legislação",assuntos:["Vindo da nuvem"],assunto:"Vindo da nuvem",minutos:15,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:9}],atualizadoEm:Date.now()},
              atualizado_em:new Date(Date.now()+60000).toISOString()};
  const dom2=abrir(configurado,srv2,{access_token:"tok",refresh_token:"ref",email:"pessoa@exemplo.com",uid:"u1"});
  await espera(500);
  const db2=JSON.parse(dom2.window.localStorage.getItem("plataforma-estudos:v1"));
  ok("entrando em outro aparelho, os dados vêm da nuvem",
     db2.registros.some(r=>r.assunto==="Vindo da nuvem"), db2.registros.map(r=>r.assunto));

  /* ---- 5. sem conexão: não perde nada ---- */
  const srv3=servidorFalso();
  srv3.fetch=async()=>{ throw new Error("failed to fetch"); };
  const dom3=abrir(configurado,srv3,{access_token:"tok",refresh_token:"ref",email:"pessoa@exemplo.com",uid:"u1"});
  await espera(400);
  const c3=dom3.window.document.getElementById("chipNuvem");
  ok("sem conexão o chip avisa", /Sem conexão/.test(c3.textContent), c3.textContent);
  ok("e os dados locais continuam intactos",
     JSON.parse(dom3.window.localStorage.getItem("plataforma-estudos:v1")).registros.length===1);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nsincronização com a nuvem funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
