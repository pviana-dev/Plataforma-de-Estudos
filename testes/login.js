/* A TELA DE ACESSO (pedido do Pedro, 25/09): o app exige a conta. Entrar com
   e-mail e senha; primeiro acesso = código por e-mail + criar a senha; esqueci
   a senha = código + senha nova; conta antiga sem senha = pede para criar.
   Sem internet, quem já entrou continua usando; sessão recusada pelo Supabase
   volta para a tela de acesso. Tudo contra o Supabase falso (_nuvemfalsa.cjs). */
const fs=require("fs"),{JSDOM}=require("jsdom");
const servidorFalso=require("./_nuvemfalsa.cjs");
const html=fs.readFileSync(__dirname + "/../index.html","utf8")
  .replace(/(\n  url:\s*)"[^"]*"/, '$1"https://proj.supabase.co"').replace(/(\n  chave:\s*)"[^"]*"/, '$1"chave-falsa"');
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date());
const dados={versao:1,tema:"claro",objetivo:"livre",dataProva:"",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,planosManuaisMigrados:true,
  conteudos:[{id:"c1",disciplina:"Legislação",nome:"LAI",fase:"andamento"}],
  registros:[{id:"r1",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:30,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1}],
  revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(srv, sessao, fetchQuebrado){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(dados));
      if (sessao) w.localStorage.setItem("plataforma-estudos:sessao",JSON.stringify(sessao));
      w.fetch=fetchQuebrado ? (async()=>{ throw new TypeError("Load failed"); }) : srv.fetch; w.confirm=()=>true; }});
  const w=dom.window, doc=w.document;
  const $=s=>doc.querySelector(s);
  return { w, doc, $,
    tela:()=>doc.getElementById("acesso"),
    texto:()=>doc.getElementById("acesso").textContent,
    campo:(n,v)=>{ doc.querySelector('#formAcesso [name="'+n+'"]').value=v; },
    enviar:async(ms)=>{ doc.getElementById("formAcesso").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(ms||300); },
    ir:async a=>{ doc.querySelector('[data-acesso="'+a+'"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(120); },
    sessao:()=>JSON.parse(w.localStorage.getItem("plataforma-estudos:sessao")||"null") };
}
(async()=>{try{
  /* ---- 1. sem conta: só a tela de acesso ---- */
  let srv=servidorFalso(); srv.conta("ana@exemplo.com","senhaboa1");
  let t=abrir(srv); await espera(400);
  ok("sem conta, só aparece a tela de acesso", !t.tela().hidden && t.doc.body.classList.contains("sem-acesso") &&
     !t.$("#view").innerHTML.trim(), t.$("#view").innerHTML.slice(0,80));
  ok("com e-mail, senha e os dois caminhos (primeiro acesso, esqueci)",
     !!t.$('#formAcesso [name="email"]') && t.$('#formAcesso [name="senha"]').type==="password" &&
     /Primeiro acesso/.test(t.texto()) && /Esqueci minha senha/.test(t.texto()));
  ok("nenhuma chamada à nuvem antes de entrar", !srv.chamadas.length, srv.chamadas.map(c=>c.url));

  /* ---- 2. entrar com senha ---- */
  t.campo("email","ana@exemplo.com"); t.campo("senha","errada99"); await t.enviar();
  ok("senha errada: aviso claro, sem entrar", /E-mail ou senha incorretos/.test(t.texto()) && !t.sessao(), t.texto().slice(0,160));
  t.campo("senha","senhaboa1"); await t.enviar(500);
  ok("senha certa: entra, e o app aparece", t.tela().hidden && !t.doc.body.classList.contains("sem-acesso") &&
     /Estudo de hoje/.test(t.$("#view").textContent));
  ok("a sessão fica guardada, marcada como conta com senha", t.sessao() && t.sessao().senha===true, t.sessao());
  ok("e os dados sobem para a conta", !!srv.linha && srv.linha.conteudo.registros.length===1);

  /* ---- 3. sair ---- */
  t.w.document.querySelector('[data-acao="painel-nuvem"]').dispatchEvent(new t.w.MouseEvent("click",{bubbles:true})); await espera(150);
  t.$('[data-acao="nuvem-sair"]').dispatchEvent(new t.w.MouseEvent("click",{bubbles:true})); await espera(250);
  ok("sair volta para a tela de acesso, com o e-mail já preenchido", !t.tela().hidden && !t.sessao() &&
     t.$('#formAcesso [name="email"]').value==="ana@exemplo.com");
  ok("e encerra a sessão no Supabase também", srv.chamadas.some(c=>/logout/.test(c.url)));
  ok("os dados do navegador continuam lá", JSON.parse(t.w.localStorage.getItem("plataforma-estudos:v1")).registros.length===1);

  /* ---- 4. primeiro acesso ---- */
  srv=servidorFalso(); t=abrir(srv); await espera(400);
  await t.ir("primeiro");
  t.campo("email","nao-e-email"); await t.enviar();
  ok("e-mail inválido é recusado antes de ir ao servidor", /e-mail válido/.test(t.texto()) && !srv.chamadas.length);
  t.campo("email","Bia@Exemplo.com"); await t.enviar();
  ok("pede o código ao Supabase (e-mail em minúsculas, podendo criar a conta)",
     srv.chamadas.some(c=>/otp/.test(c.url) && c.corpo.email==="bia@exemplo.com" && c.corpo.create_user===true));
  ok("e passa a pedir o código", !!t.$('#formAcesso [name="codigo"]') && /bia@exemplo\.com/.test(t.texto()));
  await t.ir("reenviar");
  ok("dá para reenviar o código", srv.chamadas.filter(c=>/otp/.test(c.url)).length===2 && /reenviado/.test(t.texto()));
  t.campo("codigo","123456"); await t.enviar();
  ok("código certo: pede para criar a senha", !!t.$('#formAcesso [name="senha2"]') && /E-mail confirmado/.test(t.texto()));
  ok("ainda sem sincronizar nada (a senha vem antes)", !srv.chamadas.some(c=>/rest/.test(c.url)));
  t.campo("senha","curta"); t.campo("senha2","curta"); await t.enviar();
  ok("senha curta é recusada", /pelo menos 8/.test(t.texto()));
  t.campo("senha","boasenha1"); t.campo("senha2","outrasenha"); await t.enviar();
  ok("senhas diferentes são recusadas", /não são iguais/.test(t.texto()));
  t.campo("senha","boasenha1"); t.campo("senha2","boasenha1"); await t.enviar(600);
  ok("senha criada: grava no Supabase, marcando senha_criada",
     srv.chamadas.some(c=>/auth\/v1\/user/.test(c.url) && c.metodo==="PUT" && c.corpo.password==="boasenha1" && c.corpo.data.senha_criada===true));
  ok("e entra no app", t.tela().hidden && t.sessao().senha===true);
  // a mesma pessoa depois entra com a senha
  srv.chamadas.length=0; t=abrir(srv); await espera(400);
  t.campo("email","bia@exemplo.com"); t.campo("senha","boasenha1"); await t.enviar(500);
  ok("depois, entra com o e-mail e a senha criada", t.tela().hidden);

  /* ---- 5. primeiro acesso num e-mail que JÁ tem senha: não vale ---- */
  srv=servidorFalso(); srv.conta("ana@exemplo.com","senhaboa1"); t=abrir(srv); await espera(400);
  await t.ir("primeiro"); t.campo("email","ana@exemplo.com"); await t.enviar();
  t.campo("codigo","123456"); await t.enviar();
  ok("conta com senha não entra só pelo código", !t.tela().hidden && !t.sessao() && /já tem senha/.test(t.texto()), t.texto().slice(0,200));

  /* ---- 6. esqueci a senha ---- */
  await t.ir("esqueci"); t.campo("email","ana@exemplo.com"); await t.enviar();
  ok("pede a redefinição ao Supabase", srv.chamadas.some(c=>/recover/.test(c.url) && c.corpo.email==="ana@exemplo.com"));
  t.campo("codigo","000000"); await t.enviar();
  ok("código errado é recusado", /inválido ou vencido/.test(t.texto()));
  t.campo("codigo","123456"); await t.enviar();
  ok("código certo: pede a senha nova", /Crie a senha nova/.test(t.texto()));
  t.campo("senha","novasenha9"); t.campo("senha2","novasenha9"); await t.enviar(600);
  ok("senha nova salva, e entra", t.tela().hidden && srv.usuarios["ana@exemplo.com"].senha==="novasenha9");
  srv.chamadas.length=0; t=abrir(srv); await espera(400);
  t.campo("email","ana@exemplo.com"); t.campo("senha","senhaboa1"); await t.enviar();
  ok("a senha antiga deixa de valer", /incorretos/.test(t.texto()));
  t.campo("senha","novasenha9"); await t.enviar(500);
  ok("a nova vale", t.tela().hidden);

  /* ---- 7. conta que entrou ANTES das senhas ---- */
  srv=servidorFalso(); const pedro=srv.conta("pedro@exemplo.com");     // sem senha
  t=abrir(srv,{access_token:"tok-"+pedro.id,refresh_token:"r",email:"pedro@exemplo.com",uid:pedro.id}); await espera(500);
  ok("a sessão antiga sem senha abre a tela 'crie a sua senha'", !t.tela().hidden && /ainda não tem senha/.test(t.texto()), t.texto().slice(0,200));
  ok("e não sincroniza nada antes disso", !srv.chamadas.some(c=>/rest/.test(c.url)), srv.chamadas.map(c=>c.url));
  t.campo("senha","senhapedro1"); t.campo("senha2","senhapedro1"); await t.enviar(600);
  ok("criada a senha, entra e sincroniza", t.tela().hidden && srv.chamadas.some(c=>/rest/.test(c.url)));

  /* ---- 8. sem internet, quem já entrou continua usando ---- */
  t=abrir(null,{access_token:"tok",refresh_token:"r",email:"x@exemplo.com",uid:"u9",senha:true},true); await espera(500);
  ok("sem internet, o app abre normalmente para quem já entrou", t.tela().hidden && /Estudo de hoje/.test(t.$("#view").textContent));
  ok("e a sessão não é apagada", !!t.sessao());

  /* ---- 9. sessão recusada pelo Supabase: volta para a tela de acesso ---- */
  srv=servidorFalso(); srv.expirado=true;
  t=abrir(srv,{access_token:"tok-velho",refresh_token:"r",email:"x@exemplo.com",uid:"u9",senha:true}); await espera(600);
  ok("sessão vencida e recusada: sai da conta e mostra a tela de acesso", !t.sessao() && !t.tela().hidden);

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\ntela de acesso: senha, primeiro acesso e redefinição funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
