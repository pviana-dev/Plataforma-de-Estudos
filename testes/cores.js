const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:10,acertos:8,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[{id:"v1",registroId:"rA",data:iso(new Date(Date.now()+3*864e5)),ordem:1,feita:false,manual:false,minutos:null,questoes:null,acertos:null,dificuldade:null,atividade:"",nota:""}],
 erros:[],cronometro:null};
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
const w=dom.window,doc=w.document,$=s=>doc.querySelector(s);
const click=el=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const cor=el=>{const c=w.getComputedStyle(el);return c.backgroundColor+" / "+c.borderColor+" / "+c.color;};
setTimeout(()=>{
  const css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join("");
  console.log("resta paleta âmbar no CSS? ", /--edit-|#fdf5e6|#e0cfa6|#8a6a2f|224,207,166/.test(css) ? "SIM" : "não");
  click($('[data-aba="registros"]')); 
  setTimeout(()=>{
    click($('[data-acao="editar-registro"]'));
    setTimeout(()=>{
      console.log("\n[tela de edição da sessão]");
      console.log("  faixa 'Editando'  bg/borda/texto:", cor($("#modalCorpo .faixa-edicao")));
      console.log("  campo de texto    bg/borda:", cor($("#modalCorpo [name=minutos]")).split(" / ").slice(0,2).join(" / "));
      click(doc.querySelector('#overlay [data-acao="fechar-modal"]'));
      setTimeout(()=>{
        click($('[data-aba="revisoes"]'));
        setTimeout(()=>{
          click(doc.querySelector('[data-acao="editar-card"]'));
          setTimeout(()=>{
            console.log("\n[tela de edição do título do card — a referência]");
            console.log("  caixa do editor   bg/borda/texto:", cor($("#modalCorpo .grupo-editor")));
            console.log("  campo de texto    bg/borda:", cor($("#tituloCard")).split(" / ").slice(0,2).join(" / "));
            console.log("  etiqueta          bg/borda/texto:", $("#modalCorpo .tag") ? cor($("#modalCorpo .tag")) : "—");
            process.exit(0);
          },150);
        },150);
      },150);
    },150);
  },150);
},250);
