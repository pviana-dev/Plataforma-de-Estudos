const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],
 erros:[{id:"e1",disciplina:"Legislação",assunto:"",fonte:"",oQueErrei:"",ensinamento:"vale para a matéria toda",categoria:"",refeita:false,importante:false,criadoEm:2},
        {id:"e2",disciplina:"Legislação",assunto:"LAI",fonte:"",oQueErrei:"",ensinamento:"prazo de 20 dias",categoria:"",refeita:false,importante:false,criadoEm:3}],
 cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){ w.__semLogin=true;w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));w.__confirmarNativo=true; w.confirm=()=>true;}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const espera=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{try{
  await espera(300);
  const aba=[...doc.querySelectorAll("#abas [data-aba]")].find(b=>b.dataset.aba==="erros");
  console.log("  aba: \""+aba.textContent+"\"");
  ok("a aba não mostra mais número ao lado do nome", !aba.querySelector(".pin") && !/\d/.test(aba.textContent), aba.textContent);
  ok("as outras abas mantêm os avisos de revisão",
     [...doc.querySelectorAll("#abas [data-aba]")].some(b=>["hoje","revisoes"].includes(b.dataset.aba)) , "ok");

  click(aba); await espera(300);
  const opts=[...$("#eAssunto").options].map(o=>o.textContent);
  console.log("  seletor de conteúdo: "+opts.join(" | "));
  ok("sumiu 'só as da disciplina' do seletor", !opts.some(t=>/só as da disciplina/.test(t)), opts);
  ok("o seletor lista só conteúdos de verdade", opts.join("|")==="Tudo|Legislação · LAI", opts);
  ok("as duas anotações continuam na lista", doc.querySelectorAll(".apr").length===2);

  // escolhendo a disciplina, o "Tudo de X" faz o papel do nível da disciplina
  const d=$("#eDisciplina"); d.value="Legislação"; d.dispatchEvent(new w.Event("change",{bubbles:true}));
  await espera(250);
  ok("com a disciplina escolhida, dá para anotar na matéria toda",
     /disciplina inteira/.test(doc.querySelector('[data-acao="abrir-composer"]').textContent),
     doc.querySelector('[data-acao="abrir-composer"]').textContent);

  // no editar, o destino "toda a disciplina" continua existindo, com o novo nome
  click(doc.querySelector('[data-acao="editar-erro"]')); await espera(250);
  const dest=[...$('#formEdicaoErro [name="alvoConteudo"]').options].map(o=>o.textContent);
  console.log("  conteúdo: "+dest.join(" | "));
  ok("no editar não há mais 'só as da disciplina'", !dest.some(t=>/só as da disciplina/.test(t)), dest);
  ok("mas ainda dá para apontar para a disciplina toda",
     dest.some(t=>/Toda a disciplina/.test(t)), dest);
  ok("e a disciplina tem campo próprio", !!$('#formEdicaoErro [name="alvoDisciplina"]'));
  console.log(falhas?"\n"+falhas+" FALHA(S)":"\nrótulos e contador ajustados");
  process.exit(falhas?1:0);
}catch(e){console.error("ERRO:",e.message,"\n",e.stack.split("\n").slice(0,6).join("\n"));process.exit(2);}})();
