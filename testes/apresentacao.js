/* A APRESENTAÇÃO (pedido do Pedro, 04/11): o primeiro contato num aparelho novo
   mostra uma visão geral do sistema com os botões de cadastrar e de entrar.
   Escolhido um deles, da próxima vez a tela abre direto no Entrar. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const servidorFalso=require("./_nuvemfalsa.cjs");
const html=fs.readFileSync(__dirname + "/../index.html","utf8")
  .replace(/(\n  url:\s*)"[^"]*"/, '$1"https://proj.supabase.co"').replace(/(\n  chave:\s*)"[^"]*"/, '$1"chave-falsa"');
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(srv, guardado){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ for (const k in guardado||{}) w.localStorage.setItem(k, guardado[k]); w.fetch=srv.fetch; }});
  const w=dom.window, doc=w.document, tela=()=>doc.getElementById("acesso");
  return { w, doc, tela, texto:()=>tela().textContent,
    clicar:async a=>{ tela().querySelector('[data-acesso="'+a+'"]').dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await espera(120); } };
}
(async()=>{try{
  const srv=servidorFalso();
  let t=abrir(srv); await espera(400);
  ok("aparelho novo: abre na apresentação, sem formulário", !t.tela().hidden && t.tela().classList.contains("apresentando") &&
     !t.doc.getElementById("formAcesso") && !!t.tela().querySelector(".vis-previa"), t.texto().slice(0,100));
  ok("com o botão de cadastrar e o de entrar", !!t.tela().querySelector('[data-acesso="primeiro"]') &&
     !!t.tela().querySelector('[data-acesso="entrar"]') && /Criar minha conta/.test(t.texto()));
  ok("o app continua escondido e nada vai para a nuvem", t.doc.body.classList.contains("sem-acesso") &&
     !t.doc.getElementById("view").innerHTML.trim() && !srv.chamadas.length);
  await t.clicar("primeiro");
  ok("Criar minha conta leva ao cadastro (e-mail → código)", !!t.doc.querySelector('#formAcesso[data-etapa="primeiro"] [name="email"]') &&
     /Criar a sua conta/.test(t.texto()) && !t.tela().classList.contains("apresentando"));
  const vista=t.w.localStorage.getItem("plataforma-estudos:apresentacao-vista");
  ok("fica marcado que a apresentação já foi vista", vista==="1", vista);
  await t.clicar("entrar");
  ok("no Entrar: o botão Criar minha conta e o link para rever a apresentação",
     !!t.doc.querySelector('#formAcesso[data-etapa="entrar"]') && !!t.tela().querySelector('.acesso-novo [data-acesso="primeiro"]') &&
     !!t.tela().querySelector('[data-acesso="apresentacao"]'));
  await t.clicar("apresentacao");
  ok("Conhecer a plataforma traz a apresentação de volta", !!t.tela().querySelector(".vis-previa"));

  t=abrir(srv,{"plataforma-estudos:apresentacao-vista":"1"}); await espera(400);
  ok("já vista: abre direto no Entrar", !!t.doc.querySelector('#formAcesso[data-etapa="entrar"]'));
  t=abrir(srv,{"plataforma-estudos:v1":JSON.stringify({versao:1,registros:[],revisoes:[]})}); await espera(400);
  ok("aparelho que já usou o app (saiu da conta): abre direto no Entrar", !!t.doc.querySelector('#formAcesso[data-etapa="entrar"]'));
}catch(e){ console.log("ERRO", e); falhas++; }
console.log(falhas ? falhas+" FALHA(S)" : "apresentação: primeiro contato, cadastro e volta ao Entrar funcionando");
process.exit(falhas?1:0);
})();
