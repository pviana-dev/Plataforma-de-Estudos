/* A ESCADA É DO CONTEÚDO (decisões do Pedro, 23/09).
   - As revisões de conteúdo concluído crescem (D+1, 3, 7, 16…) e a dificuldade
     estica ou encurta a escada.
   - Contato com o conteúdo — revisão marcada à mão, revisão feita com atraso,
     sessão fora da agenda — empurra as seguintes, cada uma mantendo a distância
     que tinha da anterior. Ex.: 15, 17, 22; revisão extra no dia 20 → 22 vai a 25.
   - As revisões manuais andam junto, quantas forem.
   - Conteúdo concluído nunca fica sem revisão: havendo revisões, as próximas
     nascem depois delas; não havendo, a escada nasce.
   - "LAI, LGPD" é o mesmo que "LGPD, LAI". */
const responderDialogos=require("./_dialogo.cjs");
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
const off=d=>Math.round((new Date(d+"T12:00")-new Date(hoje+"T12:00"))/864e5);
const sess=(id,extra)=>Object.assign({id,data:dia(-20),disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",
  minutos:60,questoes:0,acertos:0,dificuldade:2,anotacoes:"",tipo:"estudo",criadoEm:Number(id.replace(/\D/g,""))||1},extra||{});
const rev=(id,reg,data,extra)=>Object.assign({id,registroId:reg,data,ordem:1,feita:false,feitaEm:null,manual:false,
  minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""},extra||{});
const ficha=(nome,extra)=>Object.assign({id:"c-"+nome,disciplina:"Legislação",nome,fase:"concluido",concluidoEm:dia(-20),criadoEm:1},extra||{});
const base=extra=>Object.assign({versao:1,tema:"claro",objetivo:"livre",dataProva:"",revisarAte:"",posProva:"",metaDiariaMin:120,
  fasesMigradas:true,dificuldadesMigradas:true,conteudosMigrados:true,disciplinas:["Legislação"],grupos:[],lancamentos:[],
  conteudos:[ficha("LAI")],registros:[],revisoes:[],erros:[],cronometro:null},extra||{});
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function abrir(seed,aba){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
   beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
     w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:aba||"revisoes",gravadoEm:hoje}));
     w.__confirmarNativo=true; w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
/** pendentes (não voltas) que falam do conteúdo, como "id@D+n" */
const escada=(w,nome)=>db(w).revisoes.filter(r=>!r.feita && !r.retomada && falaDe(w,r,nome||"LAI"))
  .sort((a,b)=>a.data.localeCompare(b.data));
function falaDe(w,r,nome){
  const d=db(w); const s=d.registros.find(x=>x.id===r.registroId);
  const lista=(r.assuntos&&r.assuntos.length)?r.assuntos:(s?s.assuntos:[]);
  return lista.includes(nome);
}
const mostra=l=>l.map(r=>r.id.slice(0,4)+"@"+off(r.data)+(r.manual?"M":""));
function porConteudo(doc, w, nome){
  const sel=doc.querySelector("#campoAssunto"); if (!sel) return false;
  const achada=[...sel.options].find(o=>o.value.toLowerCase()===nome.toLowerCase());
  if (achada) sel.value=achada.value;
  else { sel.value="__novo"; sel.dispatchEvent(new w.Event("change",{bubbles:true}));
         doc.querySelector("#novoConteudoNome").value=nome; }
  (()=>{const _c=doc.querySelector("#campoAssunto"),_n=doc.querySelector("#novoConteudoNome");if(_c.value==="__novo")_n.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Enter",bubbles:true}));else _c.dispatchEvent(new w.Event("change",{bubbles:true}));})();
  return true;
}
/** a pessoa marca uma revisão à mão, pela agenda */
async function novaRevisao(w, data, conteudos){
  click(w, w.document.querySelector('[data-aba="revisoes"]')); await espera(200);
  click(w, w.document.querySelector('[data-acao="nova-revisao"]')); await espera(250);
  const f=w.document.querySelector("#modalCorpo #formRevisao");
  f.querySelector("[name=data]").value=data;
  const sd=f.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(50);
  (conteudos||["LAI"]).forEach(c=>porConteudo(w.document, w, c));
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
}
/** a pessoa registra uma sessão nova (estudo) pelo formulário */
async function novaSessao(w, data, conteudos, dificuldade){
  click(w, w.document.querySelector('[data-aba="registros"]')); await espera(200);
  click(w, w.document.querySelector('[data-acao="toggle-form-registro"]')); await espera(250);
  const f=w.document.querySelector("#formRegistro");
  f.querySelector("[name=data]").value=data;
  const sd=f.querySelector("select.sel-disciplina"); sd.value="Legislação"; sd.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(50);
  (conteudos||["LAI"]).forEach(c=>porConteudo(w.document, w, c));
  const f2=w.document.querySelector("#formRegistro");
  if (f2.querySelector("[name=minutos]")) f2.querySelector("[name=minutos]").value="30";
  f2.querySelector("[name=dificuldade]").value=String(dificuldade||2);      // obrigatória, sem padrão
  f2.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  return (w.document.querySelector("#erroRegistro")||{}).textContent||"";
}

(async()=>{try{
  /* ---- 1. o exemplo do Pedro: 15, 17 e 22; extra no dia 20 → 22 vai a 25 ----
     Em dias relativos: feitas em -5 e -3; pendentes em +2 e +12. Revisão extra
     hoje (0): a de +2 (distância 5 da anterior) vai a +5, e a de +12 (distância
     10) vai a +15. */
  let w=abrir(base({revisarAte:dia(20),
    registros:[sess("r1")],
    revisoes:[rev("f1","r1",dia(-5),{feita:true,feitaEm:dia(-5)}), rev("f2","r1",dia(-3),{feita:true,feitaEm:dia(-3)}),
              rev("p1","r1",dia(2)), rev("p2","r1",dia(12))]}));
  await espera(400);
  await novaRevisao(w, hoje);
  let l=escada(w);
  const extra=l.find(r=>r.manual);
  ok("a revisão extra fica onde foi marcada", !!extra && extra.data===hoje, mostra(l));
  ok("a seguinte anda respeitando a distância (+5 da anterior)", off(l.find(r=>r.id==="p1").data)===5, mostra(l));
  ok("e as de depois andam junto, cada uma com a sua distância", off(l.find(r=>r.id==="p2").data)===15, mostra(l));

  /* ---- 2. várias revisões extras seguidas: cada uma empurra de novo ---- */
  await novaRevisao(w, dia(1));
  await novaRevisao(w, dia(2));
  l=escada(w);
  ok("quantas revisões extras quiser: três marcadas à mão", l.filter(r=>r.manual).length===3, mostra(l));
  ok("e a escada anda a cada uma (+2 → +7)", off(l.find(r=>r.id==="p1").data)===7, mostra(l));

  /* ---- 3. revisão feita com ATRASO empurra as seguintes ----
     A de -4 (distância 4 do fechamento em -8) é cumprida hoje, por uma sessão
     de revisão; a próxima, em +1 (distância 5), vai para +5. */
  w=abrir(base({revisarAte:dia(20),conteudos:[ficha("LAI",{concluidoEm:dia(-8)})],
    registros:[sess("r1",{data:dia(-8)})],
    revisoes:[rev("a1","r1",dia(-4)), rev("a2","r1",dia(1)), rev("a3","r1",dia(9))]}), "registros");
  await espera(400);
  const erro3=await novaSessao(w, hoje, ["LAI"]);
  const d3=db(w);
  ok("a sessão de hoje cumpre a revisão atrasada", d3.revisoes.find(r=>r.id==="a1").feita===true, [erro3, d3.revisoes.map(r=>r.id+":"+r.feita)]);
  l=escada(w);
  ok("e a seguinte conta a partir de hoje (+5)", off(l.find(r=>r.id==="a2").data)===5, mostra(l));
  ok("com a de depois andando junto (+13)", off(l.find(r=>r.id==="a3").data)===13, mostra(l));

  /* ---- 4. salvar de novo a mesma sessão NÃO empurra outra vez ---- */
  const antes4=mostra(escada(w)).join();
  click(w, w.document.querySelector('[data-aba="registros"]')); await espera(200);
  const linha=[...w.document.querySelectorAll("tbody tr[data-id]")].find(tr=>db(w).registros.find(r=>r.id===tr.dataset.id && r.data===hoje));
  click(w, linha.querySelector("td")); await espera(300);
  w.document.querySelector("#formRegistro").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(350);
  ok("salvar a mesma sessão de novo não empurra a escada outra vez", mostra(escada(w)).join()===antes4,
     [antes4, mostra(escada(w)).join()]);

  /* ---- 5. sessão FORA da agenda também é contato ---- */
  w=abrir(base({revisarAte:dia(40),conteudos:[ficha("LAI",{concluidoEm:dia(-3)})],
    registros:[sess("r1",{data:dia(-3)})],
    revisoes:[rev("b1","r1",dia(-2),{feita:true,feitaEm:dia(-2)}), rev("b2","r1",dia(4))]}), "registros");
  await espera(400);
  /* Conteúdo concluído não se estuda mais, se revisa (27/09): a sessão de hoje
     abre como revisão e adianta a próxima, em vez de ser "contato fora da agenda". */
  await novaSessao(w, hoje, ["LAI"]);
  const b2=db(w).revisoes.find(r=>r.id==="b2"), sHoje=db(w).registros.find(r=>r.data===hoje);
  ok("sessão de conteúdo concluído fora da agenda vira revisão e adianta a próxima",
     sHoje && sHoje.tipo==="revisao" && b2.feita && b2.sessaoId===sHoje.id, [sHoje, b2]);

  /* ---- 6. garantia: concluído sem revisão ganha a escada inteira ---- */
  w=abrir(base({conteudos:[ficha("LAI",{concluidoEm:hoje})], registros:[sess("r1",{data:dia(-2)})]}));
  await espera(400);
  l=escada(w);
  ok("concluído sem revisão ganha a escada (médio: D+1, 3, 7, 16, 35, 70, 140)",
     l.map(r=>off(r.data)).join()==="1,3,7,16,35,70,140", mostra(l));
  ok("e ela aparece na agenda", /LAI/.test(w.document.querySelector("#view").textContent));

  /* ---- 7. garantia com revisões já marcadas: as próximas nascem DEPOIS ----
     Revisões à mão em +5 e +13; fechado hoje. +13 fica no degrau mais perto
     (16), então a próxima vem 19 dias depois: +32. Nada é enfiado antes. */
  w=abrir(base({conteudos:[ficha("LAI",{concluidoEm:hoje})], registros:[sess("r1",{data:dia(-2)})],
    revisoes:[rev("m1","r1",dia(5),{manual:true}), rev("m2","r1",dia(13),{manual:true})]}));
  await espera(400);
  l=escada(w);
  ok("as revisões que já existiam ficam, e nada nasce antes delas", l[0].id==="m1" && l[1].id==="m2", mostra(l));
  ok("a escada continua depois da última, no degrau seguinte (+32)", off(l[2].data)===32, mostra(l));

  /* ---- 8. a dificuldade muda os intervalos ---- */
  const escadaDe=async dif=>{
    const ww=abrir(base({conteudos:[ficha("LAI",{concluidoEm:hoje})], registros:[sess("r1",{data:dia(-2),dificuldade:dif})]}));
    await espera(400); return escada(ww).map(r=>off(r.data));
  };
  const facil=await escadaDe(1), dificil=await escadaDe(3);
  ok("fácil espera mais (D+2, 5, 11…)", facil.slice(0,3).join()==="2,5,11", facil);
  ok("difícil volta mais cedo e mais vezes (D+1, 2, 5…)", dificil.slice(0,3).join()==="1,2,5" && dificil.length>facil.length,
     [dificil, facil]);

  /* ---- 8b. revisar e achar difícil encurta o que vem ----
     Fechado ontem, médio: revisões em hoje, +2, +6, +15… A sessão de hoje
     cumpre a de hoje e diz "difícil": a próxima vem em +1, não em +2. */
  w=abrir(base({conteudos:[ficha("LAI",{concluidoEm:dia(-1)})], registros:[sess("r1",{data:dia(-1)})]}), "registros");
  await espera(400);
  const antes8=escada(w).map(r=>off(r.data));
  await novaSessao(w, hoje, ["LAI"], 3);
  const depois8=escada(w).map(r=>off(r.data));
  ok("revisar e marcar difícil aproxima a próxima (+2 → +1)", antes8.slice(0,3).join()==="0,2,6" && depois8[0]===1,
     [antes8, depois8]);
  ok("e a escada difícil fica mais longa", depois8.length>antes8.length-1, [antes8.length, depois8.length]);

  /* ---- 9. contato só com parte do item: ele se divide ---- */
  w=abrir(base({conteudos:[ficha("Scrum"),ficha("XP")], revisarAte:dia(30),
    registros:[sess("r1",{assuntos:["Scrum","XP"],assunto:"Scrum"})],
    revisoes:[rev("f1","r1",dia(-3),{feita:true,feitaEm:dia(-3)}), rev("s1","r1",dia(2)), rev("s2","r1",dia(20))]}));
  await espera(400);
  await novaRevisao(w, hoje, ["Scrum"]);
  const scrum=escada(w,"Scrum"), xp=escada(w,"XP");
  ok("revisar só Scrum empurra Scrum", scrum.some(r=>!r.manual && off(r.data)===5), mostra(scrum));
  ok("e XP fica onde estava", xp.some(r=>off(r.data)===2) && !xp.some(r=>off(r.data)===5), mostra(xp));

  /* ---- 10. a ordem dos conteúdos não importa ---- */
  w=abrir(base({conteudos:[ficha("LAI"),ficha("LGPD")], revisarAte:dia(3),
    registros:[sess("r1",{assuntos:["LAI","LGPD"],assunto:"LAI"})], revisoes:[]}));
  await espera(400);
  await novaRevisao(w, dia(30), ["LGPD","LAI"]);
  const m=db(w).revisoes.find(r=>r.manual);
  ok("revisão 'LGPD, LAI' se liga à sessão 'LAI, LGPD'", !!m && m.registroId==="r1", m);

  /* ---- 11. a prova não corta a escada ---- */
  w=abrir(base({objetivo:"concurso", dataProva:dia(10),
    conteudos:[ficha("LAI",{concluidoEm:hoje})], registros:[sess("r1",{data:dia(-2)})]}));
  await espera(400);
  l=escada(w);
  ok("com prova daqui a 10 dias, a escada segue depois dela", l.some(r=>off(r.data)>10), mostra(l));
  ok("e nada cai no dia da prova", !l.some(r=>off(r.data)===10), mostra(l));

  /* ---- 12. REMANEJAR (dia cheio): as seguintes andam junto ----
     Fechado em -3; revisões em -1 (atrasada), +2 e +6 — distâncias 2, 3 e 4. */
  const seed12=()=>base({revisarAte:dia(12),conteudos:[ficha("LAI",{concluidoEm:dia(-3)})],
    registros:[sess("r1",{data:dia(-3)})], revisoes:[rev("a","r1",dia(-1)), rev("b","r1",dia(2)), rev("c","r1",dia(6))]});
  w=abrir(seed12()); await espera(400);
  responderDialogos(w, ()=>dia(3));
  click(w, w.document.querySelector('[data-acao="remarcar-revisao"][data-id="a"]')); await espera(300);
  l=escada(w);
  const pos=id=>off(l.find(r=>r.id===id).data);
  ok("remarcar a atrasada para +3 leva as seguintes junto, sem inverter a ordem (+6, +10)",
     pos("a")===3 && pos("b")===6 && pos("c")===10, mostra(l));
  w=abrir(seed12()); await espera(400);
  click(w, w.document.querySelector('[data-acao="editar-revisao"][data-id="b"]')); await espera(300);
  const f12=w.document.querySelector("#formRevisao"); f12.querySelector("[name=data]").value=dia(4);
  f12.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  l=escada(w);
  ok("editar a data de +2 para +4 empurra a seguinte mantendo a distância (+6 → +8)",
     pos("b")===4 && pos("c")===8 && pos("a")===-1, mostra(l));
  w=abrir(seed12()); await espera(400);
  click(w, w.document.querySelector('[data-acao="agenda-completa"][data-valor="true"]')); await espera(250);   // a de +6 é a 3ª
  click(w, w.document.querySelector('[data-acao="editar-revisao"][data-id="c"]')); await espera(300);
  const f13=w.document.querySelector("#formRevisao"); f13.querySelector("[name=data]").value=dia(5);
  f13.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(300);
  l=escada(w);
  ok("puxar uma revisão para mais cedo não mexe nas outras", pos("c")===5 && pos("b")===2, mostra(l));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nescada por conteúdo funcionando");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
