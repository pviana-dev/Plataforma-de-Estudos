const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(__dirname + "/../index.html","utf8");
const iso=d=>{const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());};  // data LOCAL, como o app
const hoje=iso(new Date());
const seed={versao:1,tema:"claro",dataProva:"2026-10-11",metaDiariaMin:120,disciplinas:["Legislação"],grupos:[],lancamentos:[],
 registros:[{id:"rA",data:hoje,disciplina:"Legislação",assuntos:["LAI"],assunto:"LAI",minutos:60,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:1}],
 revisoes:[],erros:[],cronometro:null};
let falhas=0; const ok=(n,c,e)=>{console.log((c?"  ok   ":"  FALHA")+"  "+n+(c?"":"   → "+JSON.stringify(e)));if(!c)falhas++;};

/* ---- 1. navegador SEM a API (Firefox/Safari): a plataforma segue funcionando ---- */
const semApi=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
 beforeParse(w){w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));}});
setTimeout(()=>{
  const doc=semApi.window.document, chip=doc.getElementById("chipArquivo");
  ok("sem a API o chip fica escondido", chip.hidden, {hidden:chip.hidden,txt:chip.textContent});
  ok("a plataforma renderiza normalmente", /Estudo de hoje/.test(doc.getElementById("view").textContent));
  ok("os botões de backup manual continuam", !!doc.getElementById("btnExportar") && !!doc.getElementById("btnImportar"));
  chip.dispatchEvent(new semApi.window.MouseEvent("click",{bubbles:true}));
  setTimeout(()=>{
    const m=doc.getElementById("modalCorpo").textContent;
    ok("o painel explica a limitação e aponta o caminho manual",
       /não deixa a página escrever/.test(m) && /exportar/.test(m), m.slice(0,140));

    /* ---- 2. navegador COM a API: arquivo falso em memória ---- */
    let disco = JSON.stringify({...seed, registros:[...seed.registros,
      {id:"rB",data:hoje,disciplina:"Legislação",assuntos:["Lei 8.112"],assunto:"Lei 8.112",minutos:30,questoes:0,acertos:0,dificuldade:3,anotacoes:"",criadoEm:2}]});
    let escritas=0, permissao="granted";
    const handle={ name:"estudos.json",
      queryPermission:async()=>permissao, requestPermission:async()=>{permissao="granted";return "granted";},
      getFile:async()=>({ text:async()=>disco }),
      createWritable:async()=>({ write:async t=>{disco=t;escritas++;}, close:async()=>{} }) };
    const comApi=new JSDOM(html,{runScripts:"dangerously",url:"https://t.local/",pretendToBeVisual:true,
      beforeParse(w){
        w.localStorage.setItem("plataforma-estudos:v1",JSON.stringify(seed));
        w.showSaveFilePicker=async()=>handle;
        w.showOpenFilePicker=async()=>[handle];
        w.confirm=()=>true;                       // "usar os dados do arquivo"
      }});
    const w2=comApi.window, doc2=w2.document, $2=s=>doc2.querySelector(s);
    setTimeout(()=>{
      const chip2=doc2.getElementById("chipArquivo");
      ok("com a API o chip aparece avisando que só há navegador", !chip2.hidden && /Só no navegador/.test(chip2.textContent),
         chip2.textContent);
      chip2.dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
      setTimeout(()=>{
        ok("o painel oferece criar/usar arquivo", !!doc2.querySelector('[data-acao="arq-criar"]') &&
           !!doc2.querySelector('[data-acao="arq-abrir"]'));
        doc2.querySelector('[data-acao="arq-abrir"]').dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
        setTimeout(()=>{
          const db=JSON.parse(w2.localStorage.getItem("plataforma-estudos:v1"));
          ok("os dados do arquivo foram adotados", db.registros.length===2, db.registros.map(r=>r.assunto));
          ok("o chip passou a mostrar o arquivo", /estudos\.json/.test(chip2.textContent), chip2.textContent);
          ok("o arquivo foi gravado ao conectar", escritas>=1, escritas);
          const antes=escritas;
          // uma ação qualquer deve regravar o arquivo
          doc2.querySelector('[data-aba="registros"]').dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
          setTimeout(()=>{
            doc2.querySelector('[data-acao="editar-registro"]').dispatchEvent(new w2.MouseEvent("click",{bubbles:true}));
            setTimeout(()=>{
              $2("#modalCorpo [name=minutos]").value="99";
              $2("#modalCorpo #formRegistro").dispatchEvent(new w2.Event("submit",{bubbles:true,cancelable:true}));
              setTimeout(()=>{
                ok("a edição foi gravada no navegador",
                   JSON.parse(w2.localStorage.getItem("plataforma-estudos:v1")).registros.some(r=>r.minutos===99));
                ok("editar um registro regrava o arquivo (após o intervalo de gravação)", escritas>antes, {antes,depois:escritas});
                const noDisco=JSON.parse(disco);
                ok("o arquivo tem o dado novo", noDisco.registros.some(r=>r.minutos===99),
                   noDisco.registros.map(r=>r.minutos));
                ok("o JSON do arquivo é legível (indentado)", /\n  "registros"/.test(disco), disco.slice(0,60));
                const antes2=escritas;
                // sair da aba grava o que estiver pendente
                Object.defineProperty(doc2,"visibilityState",{value:"hidden",configurable:true});
                doc2.dispatchEvent(new w2.Event("visibilitychange"));
                setTimeout(()=>{
                  ok("sair da aba dispara gravação", escritas>antes2, {antes2,depois:escritas});
                  console.log(falhas?"\n"+falhas+" FALHA(S)":"\npersistência em arquivo funcionando");
                  process.exit(falhas?1:0);
                },120);
              },900);
            },200);
          },200);
        },250);
      },150);
    },300);
  },150);
},300);
