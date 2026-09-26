const fs=require("fs"),{JSDOM}=require("jsdom");
const arquivo=__dirname + "/../index.html";
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};

const servidorFalso=require("./_nuvemfalsa.cjs");   // o Supabase falso, compartilhado com login.js
function abrir(html, srv, sessao){
  return new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){
      w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
      if (sessao) w.localStorage.setItem("plataforma-estudos:sessao",JSON.stringify(sessao));
      w.fetch=srv.fetch; w.__confirmarNativo=true; w.confirm=()=>true;
    }});
}
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  /* O app de verdade já vem com o projeto preenchido (25/09). O teste esvazia o
     NUVEM para ver o "sem configurar" e depois põe um endereço FALSO — nenhuma
     chamada sai para o Supabase real: o fetch é o servidor falso daqui. */
  const original=fs.readFileSync(arquivo,"utf8")
    .replace(/(\n  url:\s*)"[^"]*"/, '$1""').replace(/(\n  chave:\s*)"[^"]*"/, '$1""');

  /* ---- 1. sem configurar: nada muda ---- */
  const srv0=servidorFalso(), d0=abrir(original,srv0);
  await espera(300);
  ok("sem configurar, o chip da nuvem fica escondido", d0.window.document.getElementById("chipNuvem").hidden);
  ok("e nenhuma chamada de rede é feita", srv0.chamadas.length===0, srv0.chamadas);
  ok("a plataforma segue funcionando", /Estudo de hoje/.test(d0.window.document.getElementById("view").textContent));

  /* ---- 2. configurado: login por código ---- */
  const configurado=original.replace(/(\n  url:\s*)""/, '$1"https://proj.supabase.co"')
                            .replace(/(\n  chave:\s*)""/, '$1"chave-anon"');
  const srv=servidorFalso(), dom=abrir(configurado,srv);
  const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
  const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await espera(300);
  const chip=doc.getElementById("chipNuvem");
  const tela=()=>doc.getElementById("acesso");
  const enviar=()=>$("#formAcesso").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  ok("configurado e sem conta, abre a tela de acesso (e o app fica escondido)",
     !tela().hidden && doc.body.classList.contains("sem-acesso") && /Entrar/.test(tela().textContent));
  click(tela().querySelector('[data-acesso="primeiro"]')); await espera(150);
  $('#formAcesso [name="email"]').value="pessoa@exemplo.com"; enviar(); await espera(200);
  ok("o código foi pedido ao servidor", srv.chamadas.some(c=>/otp/.test(c.url)&&c.corpo.email==="pessoa@exemplo.com"),
     srv.chamadas.map(c=>c.url));
  ok("a tela passa a pedir o código", !!$('#formAcesso [name="codigo"]'));
  // código errado
  $('#formAcesso [name="codigo"]').value="000000"; enviar(); await espera(200);
  ok("código errado é recusado com aviso", /inválido ou vencido/i.test(tela().textContent), tela().textContent.slice(0,200));
  $('#formAcesso [name="codigo"]').value="123456"; enviar(); await espera(300);
  ok("com o código certo, pede para criar a senha", !!$('#formAcesso [name="senha2"]'));
  $('#formAcesso [name="nome"]').value="Pessoa Teste";
  $('#formAcesso [name="senha"]').value="segredo123"; $('#formAcesso [name="senha2"]').value="segredo123"; enviar();
  await espera(500);
  ok("com o código certo, entra (o menu do perfil mostra a conta, e 'Conta e sincronização' está em dia)",
     /Conta e sincronização/.test(doc.getElementById("chipNuvem").textContent) && /Sincronizado/.test(doc.getElementById("chipNuvem").title) &&
     !doc.querySelector("#chipNuvem .menu-aviso") && /pessoa@exemplo\.com/.test(doc.getElementById("menuEmail").textContent),
     [doc.getElementById("chipNuvem").textContent, doc.getElementById("chipNuvem").title, doc.getElementById("menuEmail").textContent]);
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
  ok("sem conexão, 'Conta e sincronização' avisa", /sem conexão/i.test(c3.textContent), c3.textContent);

  /* a gravação que dá certo não pode aparecer como erro (201 vazio — 25/09, Safari) */
  ok("gravar com sucesso (201 sem corpo) deixa o chip 'sincronizado', não 'sem conexão'",
     !/sem conexão/i.test(chip.textContent) && !/sem conexão/i.test(doc.getElementById("chipNuvem").textContent),
     doc.getElementById("chipNuvem").textContent);
  ok("e os dados locais continuam intactos",
     JSON.parse(dom3.window.localStorage.getItem("plataforma-estudos:v1")).registros.length===1);
  /* a conexão volta: a conferência com a conta é refeita sozinha (dados mais novos da nuvem chegam) */
  srv3.linha={conteudo:{...seed,registros:[...seed.registros,{id:"rN",data:hoje,disciplina:"Legislação",assuntos:["Da volta"],assunto:"Da volta",minutos:10,questoes:0,acertos:0,dificuldade:2,anotacoes:"",criadoEm:5}],atualizadoEm:Date.now()+60000},
              atualizado_em:new Date(Date.now()+120000).toISOString()};
  srv3.fetch=servidorFalso().fetch; const certo=servidorFalso(); certo.linha=srv3.linha; dom3.window.fetch=certo.fetch;
  dom3.window.dispatchEvent(new dom3.window.Event("online")); await espera(600);
  ok("voltando a conexão, o app refaz a conferência sozinho e traz o que é mais novo",
     JSON.parse(dom3.window.localStorage.getItem("plataforma-estudos:v1")).registros.some(r=>r.assunto==="Da volta") &&
     !/sem conexão/i.test(dom3.window.document.getElementById("chipNuvem").textContent),
     dom3.window.document.getElementById("chipNuvem").textContent);

  /* ---- 6. OUTRA CONTA no mesmo navegador: não mistura os dados ---- */
  const abrirCom=(srvX,sessao,dados,resposta)=>new JSDOM(configurado,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(dados));
      w.localStorage.setItem("plataforma-estudos:sessao",JSON.stringify(sessao)); w.fetch=srvX.fetch;
      w.__perguntas=[]; w.__confirmarNativo=true; w.confirm=m=>{ w.__perguntas.push(m); return resposta; }; }});
  const deA={...seed,contaNuvem:"uA",contaNuvemEmail:"a@exemplo.com",atualizadoEm:Date.now(),
    registros:[{...seed.registros[0],id:"rDeA",assuntos:["Só de A"],assunto:"Só de A"}]};
  const sessB={access_token:"tok",refresh_token:"ref",email:"b@exemplo.com",uid:"uB"};
  // B ainda sem nada na nuvem, e a pessoa aceita a troca
  const srvB=servidorFalso(), domB=abrirCom(srvB,sessB,deA,true);
  await espera(600);
  const dbB=JSON.parse(domB.window.localStorage.getItem("plataforma-estudos:v1"));
  ok("entrando com outra conta, a plataforma pergunta antes de trocar",
     domB.window.__perguntas.some(m=>/são da conta a@exemplo\.com/.test(m)), domB.window.__perguntas);
  ok("os dados de A NÃO sobem para a conta de B",
     !srvB.chamadas.some(c=>c.metodo==="POST" && JSON.stringify(c.corpo).includes("Só de A")),
     srvB.chamadas.map(c=>c.metodo+" "+c.url));
  ok("e o navegador passa a ter os dados de B (vazio, que B ainda não tinha nada)",
     !dbB.registros.some(r=>r.assunto==="Só de A") && dbB.contaNuvem==="uB", {regs:dbB.registros.length, dono:dbB.contaNuvem});
  // B já tem dados na nuvem: chegam os de B
  const srvB2=servidorFalso();
  srvB2.linha={conteudo:{...seed,contaNuvem:"uB",registros:[{...seed.registros[0],id:"rDeB",assuntos:["Só de B"],assunto:"Só de B"}]},
               atualizado_em:new Date(Date.now()-86400000).toISOString()};   // mais VELHO que o de A — mesmo assim não é de A
  const domB2=abrirCom(srvB2,sessB,deA,true); await espera(600);
  const dbB2=JSON.parse(domB2.window.localStorage.getItem("plataforma-estudos:v1"));
  ok("se B já tem dados, chegam os de B — mesmo que os de A pareçam mais novos",
     dbB2.registros.some(r=>r.assunto==="Só de B") && !dbB2.registros.some(r=>r.assunto==="Só de A"),
     dbB2.registros.map(r=>r.assunto));
  ok("e a nuvem de B não recebe nada de A",
     !srvB2.chamadas.some(c=>c.metodo==="POST" && JSON.stringify(c.corpo).includes("Só de A")));
  // recusou: não entra e nada muda
  const srvB3=servidorFalso(), domB3=abrirCom(srvB3,sessB,deA,false); await espera(600);
  const dbB3=JSON.parse(domB3.window.localStorage.getItem("plataforma-estudos:v1"));
  ok("cancelando, não entra na conta e os dados daqui ficam como estavam",
     !domB3.window.localStorage.getItem("plataforma-estudos:sessao") && dbB3.registros.some(r=>r.assunto==="Só de A") &&
     !srvB3.chamadas.some(c=>c.metodo==="POST"), srvB3.chamadas.map(c=>c.metodo));
  // primeira vez numa conta, com dados locais sem dono: eles passam a ser da conta (como antes)
  const srvC=servidorFalso(), domC=abrirCom(srvC,{...sessB,uid:"uC",email:"c@exemplo.com"},{...seed},true); await espera(600);
  ok("dados sem dono entram na primeira conta, sem perguntar",
     !domC.window.__perguntas.length && JSON.parse(domC.window.localStorage.getItem("plataforma-estudos:v1")).contaNuvem==="uC" &&
     srvC.linha && srvC.linha.conteudo.registros.length===1);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nsincronização com a nuvem funcionando");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
