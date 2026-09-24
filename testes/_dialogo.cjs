/* Responde à PERGUNTA CURTA do app (#dialogo), que substituiu o prompt() do
   navegador em renomear e remarcar (24/09). Faz o papel que o w.prompt fazia
   nos testes: `responder(texto)` recebe o que a tela diz e devolve o valor (ou
   null para cancelar); se a tela recusar (erro de validação), `aoErro(msg)`
   recebe a mensagem — o que antes vinha num alert — e a pergunta é cancelada.
   Chame em beforeParse. Não é uma suíte: o .cjs fica fora do rodar.sh. */
module.exports = function responderDialogos(w, responder, aoErro){
  w.setInterval(() => {
    const d = w.document && w.document.getElementById("dialogo");
    if (!d || d.hidden || d.dataset.respondendo) return;
    d.dataset.respondendo = "1";
    const texto = d.querySelector("#dialogoTitulo").textContent + "\n" + d.querySelector("#dialogoCorpo").textContent;
    const v = responder(texto);
    const cancelar = () => d.querySelector('[data-dialogo="cancelar"]').click();
    if (v === null || v === undefined) cancelar();
    else {
      d.querySelector('[name="valor"]').value = v;
      d.querySelector("#formDialogo").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
      if (!d.hidden){ if (aoErro) aoErro(d.querySelector("#erroDialogo").textContent); cancelar(); }
    }
    delete d.dataset.respondendo;
  }, 15);
};
