/* REMARCAR O CARD DE HOJE E A JANELA DO CONTEÚDO (pedido do Pedro, 03/10).
   - O card de hoje (Hoje e Agenda) tem "remarcar": a data anda e as revisões
     seguintes do conteúdo andam junto, mantendo a distância.
   - O ✎ editar do conteúdo (aba Disciplinas) mostra a situação, a chave das
     revisões automáticas DELE (só concluído) e o atalho das revisões até a prova.
   - Desligar: pergunta Manter/Desabilitar as automáticas pendentes; a escada não renasce.
   - Religar: pergunta a partir de quando; nada automático nasce antes desse dia.
   - Reabrir o conteúdo religa. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const responderDialogos=require("./_dialogo.cjs");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const sess=(id,extra)=>Object.assign({id,data:dia(-20),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:1},extra||{});
const ficha=(nome,extra)=>Object.assign({id:"c-"+nome,disciplina:"Legislação",nome,fase:"concluido",concluidoEm:dia(-20),criadoEm:1},extra||{});
const rev=(id,data,extra)=>Object.assign({id,registroId:"s1",assuntos:["LAI"],data,feita:false,feitaEm:null,minutos:null,questoes:null,
  acertos:null,dificuldade:null,atividade:"",nota:"",manual:false},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"concurso",dataProva:dia(40),revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[ficha("LAI"),ficha("Crase",{fase:"andamento",concluidoEm:null})],
  registros:[sess("s1"),sess("s2",{assuntos:["Crase"],assunto:"Crase",criadoEm:2})],
  revisoes:[rev("r1",hoje,{degrau:2,passo:5}),rev("r2",dia(5),{degrau:3,passo:5}),rev("r3",dia(12),{degrau:4,passo:7}),
            rev("rm",dia(8),{manual:true,degrau:3,passo:3})],
  erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba,responder){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"revisoes",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; w.alert=()=>{};
     if (responder) responderDialogos(w, responder); }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const pend=w=>db(w).revisoes.filter(r=>!r.feita && !r.retomada).sort((a,b)=>a.data.localeCompare(b.data));
const achar=(w,id)=>db(w).revisoes.find(r=>r.id===id);
/* abre a janela do conteúdo e devolve o corpo dela (sem responder: quem chama decide) */
async function janela(w, nome){
  click(w,[...w.document.querySelectorAll('[data-acao="renomear-conteudo"]')].find(b=>b.dataset.cont===nome));
  await espera(80);
  return w.document.getElementById("dialogo");
}
const salvar=(w)=>w.document.querySelector("#formDialogo").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));

(async()=>{try{
  /* ---- 1. remarcar o card de hoje, na Agenda ---- */
  {
    const w=abrir(base(),"revisoes",()=>dia(3)); await espera(300);
    const doc=w.document;
    const btn=doc.querySelector('.card-hoje [data-acao="remarcar-revisao"][data-id="r1"]');
    ok("Agenda: o card de hoje tem remarcar", !!btn);
    click(w,btn); await espera(200);
    ok("a revisão de hoje foi para o dia escolhido", achar(w,"r1").data===dia(3), achar(w,"r1").data);
    ok("guardou a data original", achar(w,"r1").dataOriginal===hoje, achar(w,"r1").dataOriginal);
    ok("a seguinte andou junto, mantendo a distância (+5)", achar(w,"r2").data===dia(8), achar(w,"r2").data);
    ok("a manual que vinha depois também anda (manuais andam junto)", achar(w,"rm").data>=dia(8), achar(w,"rm").data);
    ok("e a última também anda", achar(w,"r3").data>dia(12), achar(w,"r3").data);
  }
  /* ---- 2. na aba Hoje também; feito não tem remarcar ---- */
  {
    const s=base(); s.revisoes.push(rev("rf",hoje,{assuntos:["LAI"],feita:true,feitaEm:hoje}));
    const w=abrir(s,"hoje"); await espera(300);
    const doc=w.document;
    ok("Hoje: o card de hoje tem remarcar", !!doc.querySelector('[data-acao="remarcar-revisao"][data-id="r1"]'));
    ok("o que já foi feito não tem", !doc.querySelector('[data-acao="remarcar-revisao"][data-id="rf"]'));
  }
  /* ---- 3. remarcar recusa a mesma data ---- */
  {
    let erro="";
    const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
     beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(base()));
       w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"revisoes",gravadoEm:hoje}));
       responderDialogos(w, ()=>hoje, m=>{erro=m;}); }});
    const w=dom.window; await espera(300);
    click(w,w.document.querySelector('.card-hoje [data-acao="remarcar-revisao"][data-id="r1"]')); await espera(200);
    ok("remarcar para o mesmo dia é recusado", /Já está marcada/.test(erro) && achar(w,"r1").data===hoje, erro);
  }
  /* ---- 4. a janela do conteúdo: concluído ---- */
  {
    const w=abrir(base(),"conteudos"); await espera(300);
    const d=await janela(w,"LAI");
    const t=d.textContent.replace(/\s+/g," ");
    ok("janela: título Editar conteúdo", /Editar conteúdo/.test(t), t.slice(0,80));
    ok("mostra que está concluído", /concluído em/.test(t), t.slice(0,200));
    ok("tem a chave das automáticas, ligada", !!d.querySelector('[name="autoConteudo"]') && d.querySelector('[name="autoConteudo"]').checked);
    ok("tem o atalho das revisões até a prova", !!d.querySelector('[data-dialogo="ate-prova"]'));
    ok("o Excluir continua no canto", !!d.querySelector('[data-dialogo="extra"]'));
    // o atalho abre a janela das revisões até a prova, já no conteúdo
    click(w,d.querySelector('[data-dialogo="ate-prova"]')); await espera(100);
    ok("o atalho abre Revisões até a prova", !w.document.getElementById("overlay").hidden &&
       /Revisões até a prova/.test(w.document.getElementById("modalTitulo").textContent) &&
       /LAI/.test(w.document.getElementById("modalCorpo").textContent));
  }
  /* ---- 5. em andamento: diz que é só para concluído ---- */
  {
    const w=abrir(base(),"conteudos"); await espera(300);
    const d=await janela(w,"Crase");
    const t=d.textContent.replace(/\s+/g," ");
    ok("em andamento: mostra a situação", /em andamento/.test(t), t.slice(0,200));
    ok("sem a chave e sem o atalho", !d.querySelector('[name="autoConteudo"]') && !d.querySelector('[data-dialogo="ate-prova"]'));
    ok("e explica que libera ao concluir", /quando o conteúdo for concluído/.test(t));
  }
  /* ---- 6. desligar mantendo: as pendentes viram suas, nada renasce ---- */
  {
    const w=abrir(base(),"conteudos"); await espera(300);
    const nAntes=pend(w).length;
    const d=await janela(w,"LAI");
    const chave=d.querySelector('[name="autoConteudo"]');
    chave.checked=false; chave.dispatchEvent(new w.Event("change",{bubbles:true}));
    ok("desmarcar mostra a pergunta Manter/Desabilitar", d.querySelector("#painelAutoConteudo").classList.contains("aberto"));
    salvar(w); await espera(200);
    const f=db(w).conteudos.find(c=>c.nome==="LAI");
    ok("o conteúdo ficou com o automático desligado", f.semAutomaticas===true);
    const p=pend(w);
    ok("as pendentes ficaram todas", p.length===nAntes && nAntes>=4, [nAntes,p.map(r=>r.id)]);
    ok("e todas viraram manuais", p.every(r=>r.manual), p.map(r=>[r.id,r.manual]));
    ok("a linha da aba Disciplinas avisa", /revisões automáticas desligadas/.test(w.document.getElementById("view").textContent));
    // recarregar roda a garantia de revisão: nada novo pode nascer
    const salvo=db(w), w2=abrir(salvo,"revisoes"); await espera(300);
    ok("a garantia de revisão não recria a escada", pend(w2).length===nAntes && pend(w2).every(r=>r.manual), pend(w2).map(r=>[r.id,r.manual]));
    ok("e o atalho da Agenda some (não há conteúdo para personalizar)", !w2.document.querySelector('[data-acao="revisoes-prova"]'));
  }
  /* ---- 7. desligar desabilitando: saem as automáticas, fica a manual ---- */
  {
    const w=abrir(base(),"conteudos"); await espera(300);
    const d=await janela(w,"LAI");
    const chave=d.querySelector('[name="autoConteudo"]');
    chave.checked=false; chave.dispatchEvent(new w.Event("change",{bubbles:true}));
    d.querySelector('[name="jaNaAgendaConteudo"][value="desabilitar"]').checked=true;
    salvar(w); await espera(200);
    ok("só a manual ficou", JSON.stringify(pend(w).map(r=>r.id))==='["rm"]', pend(w).map(r=>r.id));
    // religar pela janela: a escada volta, depois da manual
    const d2=await janela(w,"LAI");
    const ch2=d2.querySelector('[name="autoConteudo"]');
    ok("a chave aparece desligada", ch2 && !ch2.checked);
    ch2.checked=true; ch2.dispatchEvent(new w.Event("change",{bubbles:true}));
    salvar(w); await espera(200);
    const f=db(w).conteudos.find(c=>c.nome==="LAI");
    ok("religou", !f.semAutomaticas);
    ok("a escada voltou depois da manual", pend(w).some(r=>!r.manual && r.data>dia(8)), pend(w).map(r=>[r.id,r.data,r.manual]));
  }
  /* ---- 8. reabrir religa ---- */
  {
    const s=base(); s.conteudos[0].semAutomaticas=true;
    const w=abrir(s,"conteudos"); await espera(300);
    click(w,[...w.document.querySelectorAll('[data-acao="reabrir-conteudo"]')].find(b=>b.dataset.conts==="LAI")); await espera(200);
    ok("reabrir apaga a escolha", !db(w).conteudos.find(c=>c.nome==="LAI").semAutomaticas);
  }
  /* ---- 9. desligar um conteúdo não mexe no outro do mesmo item ---- */
  {
    const s=base(); s.conteudos.push(ficha("LGPD"));
    s.revisoes=[rev("rj",dia(4),{assuntos:["LAI","LGPD"]})];
    const w=abrir(s,"conteudos"); await espera(300);
    const d=await janela(w,"LAI");
    const chave=d.querySelector('[name="autoConteudo"]');
    chave.checked=false; chave.dispatchEvent(new w.Event("change",{bubbles:true}));
    salvar(w); await espera(200);
    const rj=achar(w,"rj"), copia=db(w).revisoes.find(r=>r.id!=="rj" && r.data===dia(4) && (r.assuntos||[]).join()==="LAI");
    ok("o item compartilhado ficou só com LGPD, automático", rj.assuntos.join()==="LGPD" && !rj.manual, rj);
    ok("e a parte de LAI virou item próprio, manual", !!copia && copia.manual && copia.data===dia(4), copia);
  }
  /* ---- 10. religar a partir de um dia: nada automático antes dele ---- */
  {
    const s=base(); s.revisoes=s.revisoes.filter(r=>r.id!=="rm");
    const w=abrir(s,"conteudos"); await espera(300);
    const d=await janela(w,"LAI");
    const chave=d.querySelector('[name="autoConteudo"]');
    chave.checked=false; chave.dispatchEvent(new w.Event("change",{bubbles:true}));
    d.querySelector('[name="jaNaAgendaConteudo"][value="desabilitar"]').checked=true;
    salvar(w); await espera(200);
    ok("desabilitar tira as automáticas da agenda", pend(w).length===0, pend(w).map(r=>r.id));
    const d2=await janela(w,"LAI");
    const ch2=d2.querySelector('[name="autoConteudo"]'), painel=d2.querySelector("#painelAutoConteudo");
    ok("desligada, o painel não aparece antes de mexer", !painel.classList.contains("aberto"));
    ch2.checked=true; ch2.dispatchEvent(new w.Event("change",{bubbles:true}));
    const desde=d2.querySelector('[name="religarDesde"]');
    ok("religar pergunta a partir de quando (hoje por padrão)", painel.classList.contains("aberto") && desde && desde.value===hoje, desde && desde.value);
    desde.value=dia(20);
    salvar(w); await espera(200);
    const f=db(w).conteudos.find(c=>c.nome==="LAI");
    ok("religou guardando o dia", !f.semAutomaticas && f.automaticasDesde===dia(20), f);
    const p=pend(w);
    ok("a primeira automática nasce no dia escolhido", p.length && p[0].data===dia(20) && !p[0].manual, p.map(r=>[r.data,r.degrau]));
    ok("e nenhuma antes dele", p.every(r=>r.data>=dia(20)));
    ok("a aba Disciplinas avisa quando voltam", /revisões automáticas voltam em/.test(w.document.getElementById("view").textContent));
    const w2=abrir(db(w),"revisoes"); await espera(300);
    ok("recarregar não cria nada antes do dia", pend(w2).every(r=>r.data>=dia(20)) && pend(w2).length===p.length, pend(w2).map(r=>r.data));
  }
  /* ---- 11. religar deixando hoje: volta já, sem guardar dia ---- */
  {
    const s=base(); s.revisoes=[]; s.conteudos[0].semAutomaticas=true;
    const w=abrir(s,"conteudos"); await espera(300);
    const d=await janela(w,"LAI");
    const ch=d.querySelector('[name="autoConteudo"]');
    ch.checked=true; ch.dispatchEvent(new w.Event("change",{bubbles:true}));
    salvar(w); await espera(200);
    const f=db(w).conteudos.find(c=>c.nome==="LAI");
    ok("religou sem dia guardado", !f.semAutomaticas && !("automaticasDesde" in f), f);
    ok("a escada volta já", pend(w).length>0 && pend(w)[0].data===hoje, pend(w).map(r=>r.data));
  }
}catch(e){console.log("ERRO",e.stack);falhas++;}
console.log(falhas?"\n"+falhas+" FALHA(S)":"\nremarcar e janela do conteúdo funcionando");
process.exit(falhas?1:0);})();
