/* O SUPABASE FALSO dos testes (nuvem.js, login.js). Responde como a API de
   verdade responde — inclusive nos detalhes que já pegaram o app de surpresa:
   gravar devolve 201 com corpo VAZIO, e json() num corpo vazio falha como no
   Safari. Guarda as chamadas (est.chamadas) e as contas (est.usuarios:
   e-mail → { id, senha, meta }). Não é suíte: o .cjs fica fora do rodar.sh. */
module.exports = function servidorFalso(){
  const est = { chamadas: [], linha: null, codigo: "123456", usuarios: {}, n: 0, senhaPadrao: true };
  const porToken = t => Object.entries(est.usuarios).find(([, u]) => "tok-" + u.id === t);
  const sessao = (email, u) => ({ access_token: "tok-" + u.id, refresh_token: "ref-" + u.id,
    user: { id: u.id, email, user_metadata: u.meta } });
  est.conta = (email, senha) => {             // cria uma conta pronta (com senha, se dada)
    const u = { id: "u" + (++est.n), senha: senha || null, meta: senha ? { senha_criada: true } : {} };
    est.usuarios[email] = u; return u;
  };
  est.fetch = async (url, op = {}) => {
    const corpo = op.body ? JSON.parse(op.body) : null;
    const metodo = op.method || "GET";
    const auth = ((op.headers || {})["Authorization"] || "").replace("Bearer ", "");
    est.chamadas.push({ url, metodo, corpo, auth });
    const resp = (status, dados) => { const cru = dados === null || dados === undefined ? "" : JSON.stringify(dados);
      return { ok: status < 400, status, statusText: "", text: async () => cru,
               json: async () => { if (!cru) throw new Error("The string did not match the expected pattern."); return JSON.parse(cru); } }; };
    if (/\/auth\/v1\/otp/.test(url)){
      if (!est.usuarios[corpo.email]){
        if (!corpo.create_user) return resp(422, { msg: "Signups not allowed for otp" });
        est.conta(corpo.email);
      }
      return resp(200, {});
    }
    if (/\/auth\/v1\/recover/.test(url)) return resp(200, {});
    if (/\/auth\/v1\/verify/.test(url)){
      const u = est.usuarios[corpo.email];
      if (!u || corpo.token !== est.codigo) return resp(403, { msg: "Token has expired or is invalid" });
      return resp(200, sessao(corpo.email, u));
    }
    if (/grant_type=password/.test(url)){
      const u = est.usuarios[corpo.email];
      if (!u || !u.senha || u.senha !== corpo.password) return resp(400, { msg: "Invalid login credentials" });
      return resp(200, sessao(corpo.email, u));
    }
    if (/grant_type=refresh_token/.test(url)) return resp(400, { msg: "Invalid Refresh Token" });
    if (/\/auth\/v1\/logout/.test(url)) return resp(204, null);
    if (/\/auth\/v1\/user/.test(url)){
      const achado = porToken(auth);
      if (metodo === "PUT"){
        if (!achado) return resp(401, { msg: "invalid JWT" });
        const [email, u] = achado;
        // como o Supabase: a senha só é conferida quando vem; atualizar só o nome não pede senha
        if (corpo.password !== undefined){
          if ((corpo.password || "").length < 8) return resp(422, { msg: "Password should be at least 8 characters." });
          u.senha = corpo.password;
        }
        Object.assign(u.meta, corpo.data || {});
        return resp(200, { id: u.id, email, user_metadata: u.meta });
      }
      // sessões antigas dos testes (token "tok"): contas que já têm senha, salvo se o teste disser outra coisa
      if (!achado) return resp(200, { id: "?", email: "", user_metadata: est.senhaPadrao ? { senha_criada: true } : {} });
      return resp(200, { id: achado[1].id, email: achado[0], user_metadata: achado[1].meta });
    }
    if (/\/rest\/v1\//.test(url) && est.expirado) return resp(401, { msg: "JWT expired" });   // sessão vencida
    if (/\/rest\/v1\/dados/.test(url) && metodo === "GET") return resp(200, est.linha ? [est.linha] : []);
    // gravar: o Supabase (PostgREST) responde 201 Created com o corpo VAZIO (Prefer: return=minimal)
    if (/\/rest\/v1\/dados/.test(url)){ est.linha = { conteudo: corpo[0].conteudo, atualizado_em: corpo[0].atualizado_em }; return resp(201, null); }
    return resp(404, { msg: "não encontrado" });
  };
  return est;
};
