/* JUNTAR CONTEÚDOS (04/10). Na aba Disciplinas, dois ou mais conteúdos viram um
   só daqui para a frente: o feito fica como está, os pendentes viram um card na
   data do mais próximo, a fase é "em andamento" se um estiver aberto, o ritmo é
   o mais difícil. Separar volta cada um como estava (ou todos concluídos, se o
   juntado estiver concluído), e o feito como juntado mantém o nome. */
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};
const hoje=iso(new Date()), dia=n=>iso(new Date(Date.now()+n*864e5));
let falhas=0; const ok=(n,c,x)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(x)));if(!c)falhas++;};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const sess=(id,ass,d,dif)=>({id,data:d,disciplina:"Legislação",assuntos:ass,assunto:ass[0],minutos:60,questoes:0,acertos:0,
  dificuldade:dif||2,anotacoes:"",tipo:"estudo",plano:"individual",criadoEm:Number(id.slice(1))});
const ficha=(id,nome,fase,extra)=>Object.assign({id,disciplina:"Legislação",nome,fase,criadoEm:1,
  concluidoEm:fase==="concluido"?dia(-6):null},extra||{});
function seed(conteudos, registros, revisoes){
  return {versao:1,tema:"claro",dataProva:"",objetivo:"livre",metaDiariaMin:120,disciplinas:["Legislação"],lancamentos:[],grupos:[],
    conteudos,conteudosMigrados:true,fasesMigradas:true,dificuldadesMigradas:true,registros,revisoes:revisoes||[],erros:[],cronometro:null};
}
function abrir(s){
  const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
    beforeParse(w){ w.__semLogin=true; w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(s));
      w.localStorage.setItem("plataforma-estudos:tela",JSON.stringify({aba:"conteudos",gravadoEm:hoje}));
      w.__confirmarNativo=true; w.confirm=()=>true; w.alert=()=>{}; }});
  return dom.window;
}
const db=w=>JSON.parse(w.localStorage.getItem("plataforma-estudos:v1"));
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const nomes=r=>(r.assuntos||[]).join("+");
const pend=w=>db(w).revisoes.filter(r=>!r.feita).map(r=>[r.data,nomes(r),r.retomada?"volta":"escada"]).sort((a,b)=>(a[0]+a[1]).localeCompare(b[0]+b[1]));
const cad=w=>db(w).conteudos.map(c=>c.nome+":"+c.fase).sort();
/** junta pela janela: marca os nomes, troca o nome se pedido, envia */
async function juntar(w, marcar, nome){
  const doc=w.document;
  click(w,doc.querySelector('[data-acao="juntar-conteudos"]')); await espera(200);
  const f=doc.querySelector("#formJuntar");
  marcar.forEach(v=>{ const i=f.querySelector('input[name="juntar"][value="'+v+'"]'); i.checked=true;
                      i.dispatchEvent(new w.Event("change",{bubbles:true})); });
  const padrao=f.querySelector('[name="nome"]').value;
  if (nome){ const n=f.querySelector('[name="nome"]'); n.value=nome; n.dispatchEvent(new w.Event("input",{bubbles:true})); }
  f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true})); await espera(400);
  return {padrao, erro:(doc.querySelector("#erroJuntar")||{}).textContent||""};
}

(async()=>{try{
  /* ---- 1. dois concluídos: A fácil, B difícil ---- */
  const s1=seed([ficha("cA","A","concluido"),ficha("cB","B","concluido"),ficha("cC","C","andamento")],
                [sess("r1",["A"],dia(-6),1), sess("r2",["B"],dia(-6),3), sess("r3",["C"],dia(-1))]);
  let w=abrir(s1); await espera(600);
  const antes=pend(w);
  const proxAB=antes.filter(x=>x[1]==="A"||x[1]==="B").map(x=>x[0]).sort()[0];
  ok("antes: A e B têm escadas próprias", antes.some(x=>x[1]==="A") && antes.some(x=>x[1]==="B"), antes);
  const j1=await juntar(w,["A","B"]);
  ok("o nome padrão é a soma", j1.padrao==="A + B", j1);
  ok("A e B saem do cadastro, entra \"A + B\" concluído", JSON.stringify(cad(w))==='["A + B:concluido","C:andamento"]', cad(w));
  const f1=db(w).conteudos.find(c=>c.nome==="A + B");
  ok("o juntado guarda A e B como estavam", f1.juntados.map(j=>j.nome+":"+j.fase).join(",")==="A:concluido,B:concluido", f1.juntados);
  ok("e começa no ritmo mais difícil", f1.dificuldade===3, f1);
  const p1=pend(w);
  ok("nenhum card pendente de A ou de B", !p1.some(x=>x[1]==="A"||x[1]==="B"), p1);
  const ab=p1.filter(x=>x[1]==="A + B");
  ok("os cards do juntado começam na data do mais próximo", ab.length>0 && ab[0][0]===proxAB, [proxAB,ab]);
  ok("as sessões antigas continuam com o nome de cada um", JSON.stringify(db(w).registros.map(r=>nomes(r)))==='["A","B","C"]', db(w).registros);
  ok("C não foi tocado", p1.filter(x=>x[1]==="C").length===1, p1);
  ok("a tela mostra de quem ele é feito e o botão separar",
     /juntou A e B/.test(w.document.getElementById("view").textContent) && !!w.document.querySelector('[data-acao="separar-conteudo"]'));

  /* ---- 2. recarregar não recria A nem B ---- */
  let salvo=db(w);
  w=abrir(salvo); await espera(600);
  ok("recarregado, a agenda continua igual", JSON.stringify(pend(w))===JSON.stringify(p1), [p1,pend(w)]);

  /* ---- 3. separar o concluído: todos voltam concluídos, um card por conteúdo ---- */
  click(w,w.document.querySelector('[data-acao="separar-conteudo"]')); await espera(400);
  ok("separado: A e B voltam concluídos", JSON.stringify(cad(w))==='["A:concluido","B:concluido","C:andamento"]', cad(w));
  const p3=pend(w);
  ok("sem card do juntado pendente", !p3.some(x=>x[1]==="A + B"), p3);
  ok("A e B ganham cards nas mesmas datas do juntado",
     JSON.stringify(p3.filter(x=>x[1]==="A").map(x=>x[0]))===JSON.stringify(ab.map(x=>x[0])) &&
     JSON.stringify(p3.filter(x=>x[1]==="B").map(x=>x[0]))===JSON.stringify(ab.map(x=>x[0])), [ab,p3]);
  salvo=db(w); w=abrir(salvo); await espera(600);
  ok("recarregado, A e B continuam separados", JSON.stringify(pend(w))===JSON.stringify(p3), [p3,pend(w)]);

  /* ---- 4. um em andamento, outro concluído: o juntado fica em andamento ---- */
  const s4=seed([ficha("cA","A","andamento"),ficha("cB","B","concluido")],
                [sess("r1",["A"],dia(-2)), sess("r2",["B"],dia(-6),3)]);
  w=abrir(s4); await espera(600);
  const prox4=pend(w).map(x=>x[0]).sort()[0];
  const j4=await juntar(w,["A","B"],"Tudo de A e B");
  ok("o nome escolhido vale", JSON.stringify(cad(w))==='["Tudo de A e B:andamento"]', [j4,cad(w)]);
  const p4=pend(w);
  ok("um card só, de continuar, na data do mais próximo", JSON.stringify(p4)===JSON.stringify([[prox4,"Tudo de A e B","volta"]]), [prox4,p4]);

  /* ---- 5. sessão nova do juntado cumpre o card e o ritmo segue dele ---- */
  const r5={...sess("r9",["Tudo de A e B"],hoje),criadoEm:Date.now()+1000};
  salvo=db(w); salvo.registros.push(r5);
  salvo.revisoes.forEach(r=>{ if(!r.feita) r.data=hoje; });
  w=abrir(salvo); await espera(600);
  ok("ainda um card do juntado (sem duplicar)", pend(w).filter(x=>x[1]==="Tudo de A e B").length===1, pend(w));

  /* ---- 6. separar o em andamento: cada um volta como estava ---- */
  w=abrir(db(w)); await espera(500);
  click(w,w.document.querySelector('[data-acao="separar-conteudo"]')); await espera(400);
  ok("A volta em andamento e B concluído", JSON.stringify(cad(w))==='["A:andamento","B:concluido"]', cad(w));
  const p6=pend(w);
  ok("A tem um card de continuar e B uma escada", p6.some(x=>x[1]==="A"&&x[2]==="volta") && p6.some(x=>x[1]==="B"&&x[2]==="escada"), p6);
  ok("a sessão feita como juntado mantém o nome", db(w).registros.some(r=>nomes(r)==="Tudo de A e B"), db(w).registros);

  /* ---- 7. validações da janela ---- */
  w=abrir(seed([ficha("cA","A","andamento"),ficha("cB","B","andamento"),ficha("cC","C","andamento")],[])); await espera(500);
  let j7=await juntar(w,["A"]);
  ok("um conteúdo só não junta", /dois ou mais/.test(j7.erro) && cad(w).length===3, j7);
  w=abrir(seed([ficha("cA","A","andamento"),ficha("cB","B","andamento"),ficha("cC","C","andamento")],[])); await espera(500);
  j7=await juntar(w,["A","B"],"C");
  ok("nome de outro conteúdo é recusado", /Já existe/.test(j7.erro) && cad(w).length===3, j7);
  w=abrir(seed([ficha("cA","A","andamento"),ficha("cB","B","andamento")],[])); await espera(500);
  await juntar(w,["A","B"]);
  ok("dois a estudar viram um a estudar, sem card", JSON.stringify(cad(w))==='["A + B:andamento"]' && !pend(w).length, [cad(w),pend(w)]);
  ok("e aparece como \"a estudar\"", /a estudar/.test(w.document.querySelector(".item-conteudo").textContent));

  console.log(falhas?"\n"+falhas+" FALHA(S)":"\njuntar: conteúdos viram um só daqui para a frente, e separar volta como era");
  process.exit(falhas?1:0);
}catch(x){console.error("ERRO:",x.message,"\n",x.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
