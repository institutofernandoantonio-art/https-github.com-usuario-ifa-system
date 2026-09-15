const { onRequest } = require("firebase-functions/v2/https");
const crypto = require("crypto");

// Funções utilitárias
function env(nome) {
  return String(process.env[nome] || "").trim();
}

function cab(extra = {}) {
  const k = env("SUPABASE_SERVICE_KEY");
  return { apikey: k, Authorization: `Bearer ${k}`, ...extra };
}

const BASE = () => env("SUPABASE_URL").replace(/\/+$/, "");

function novoToken() {
  return crypto.randomBytes(16).toString("base64url");
}

function urlDaPesquisa(req, token) {
  const fixa = env("PESQUISA_URL_BASE");
  if (fixa) return `${fixa.replace(/\/+$/, "")}/pesquisa.html?t=${token}`;
  
  // Como estamos no Firebase, pegamos do cabeçalho
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/pesquisa.html?t=${token}`;
}

function primeiroNome(nome) {
  const limpo = String(nome || "").replace(/^[\d.\-/\s]+/, "").trim();
  let p = (limpo.split(/\s+/)[0] || "").replace(/[.,;:]+$/, "");
  if (p.length < 3) return ""; 
  if (p === p.toUpperCase()) p = p.charAt(0) + p.slice(1).toLowerCase();
  return p;
}

function montarMensagem(cliente, link) {
  const nome = primeiroNome(cliente);
  return (
    `Oi${nome ? ", " + nome : ""}! Aqui é o IFA Premium 🚀\n\n` +
    `Queremos saber como estamos te ajudando a construir sua empresa autônoma. É uma pergunta rápida e leva 10 segundos:\n` +
    `${link}\n\n` +
    `Sua resposta ajuda o nosso instituto a melhorar de verdade. Obrigado!\n\n` +
    `_Se preferir não receber mais mensagens, responda SAIR._`
  );
}

// Provedores de WhatsApp
async function enviarZapi(numero, texto) {
  const inst = env("ZAPI_INSTANCE"), tok = env("ZAPI_TOKEN");
  if (!inst || !tok) throw new Error("Z-API não configurada (ZAPI_INSTANCE / ZAPI_TOKEN).");
  
  const headers = { "Content-Type": "application/json" };
  const ct = env("ZAPI_CLIENT_TOKEN");
  if (ct) headers["Client-Token"] = ct;

  const r = await fetch(`https://api.z-api.io/instances/${inst}/token/${tok}/send-text`, {
    method: "POST", headers,
    body: JSON.stringify({ phone: numero, message: texto }),
  });
  const corpo = await r.text();
  if (!r.ok) throw new Error(`Z-API HTTP ${r.status}: ${corpo.slice(0, 200)}`);
  return corpo.slice(0, 300);
}

async function enviarEvolution(numero, texto) {
  const base = env("EVO_BASE_URL").replace(/\/+$/, "");
  const inst = env("EVO_INSTANCE"), key = env("EVO_APIKEY");
  if (!base || !inst || !key) throw new Error("Evolution não configurada (EVO_BASE_URL / EVO_INSTANCE / EVO_APIKEY).");

  const r = await fetch(`${base}/message/sendText/${inst}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({ number: numero, text: texto }),
  });
  const corpo = await r.text();
  if (!r.ok) throw new Error(`Evolution HTTP ${r.status}: ${corpo.slice(0, 200)}`);
  return corpo.slice(0, 300);
}

async function enviarWhatsapp(numero, texto) {
  const p = (env("WHATS_PROVIDER") || "zapi").toLowerCase();
  if (p === "evolution") return enviarEvolution(numero, texto);
  return enviarZapi(numero, texto);
}

// ------------------------------------------------------------------
// 2. ENVIAR PESQUISA (NPS via WhatsApp)
// ------------------------------------------------------------------
exports.enviar = onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ ok: false, erro: "Use POST" });

  try {
    const c = req.body || {};
    const cliente = String(c.cliente || "").trim();
    const numero = String(c.whatsapp_e164 || "").replace(/\D/g, "");
    const quem = String(c.quem || "").slice(0, 120) || null;
    const teste = !!c.teste;

    if (!cliente) return res.status(400).json({ ok: false, erro: "Cliente não informado." });
    if (numero.length < 12) return res.status(400).json({ ok: false, erro: "Número inválido." });

    if (!env("SUPABASE_URL") || !env("SUPABASE_SERVICE_KEY")) {
      return res.status(500).json({ ok: false, erro: "Faltam credenciais do Supabase no backend." });
    }

    // Verifica Opt-out
    const opt = await fetch(`${BASE()}/rest/v1/pesquisa_optout?select=whatsapp_e164&whatsapp_e164=eq.${numero}`, { headers: cab() });
    if (opt.ok) {
      const data = await opt.json();
      if (data.length) return res.status(200).json({ ok: false, pulado: true, erro: "Cliente pediu para não receber." });
    }

    const token = novoToken();
    const link = urlDaPesquisa(req, token);
    const texto = montarMensagem(cliente, link);

    if (teste) {
      const r = await enviarWhatsapp(numero, texto);
      return res.status(200).json({ ok: true, teste: true, link, resposta: r });
    }

    const ins = await fetch(`${BASE()}/rest/v1/pesquisas`, {
      method: "POST",
      headers: cab({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify([{ token, cliente, whatsapp_e164: numero, status: "fila", criado_por: quem }]),
    });
    if (!ins.ok) throw new Error(`Falha ao registrar convite no Supabase (HTTP ${ins.status}).`);

    try {
      await enviarWhatsapp(numero, texto);
    } catch (e) {
      await fetch(`${BASE()}/rest/v1/pesquisas?token=eq.${token}`, {
        method: "PATCH",
        headers: cab({ "Content-Type": "application/json", Prefer: "return=minimal" }),
        body: JSON.stringify({ status: "erro", erro: String(e.message || e).slice(0, 400) }),
      });
      return res.status(200).json({ ok: false, cliente, erro: String(e.message || e) });
    }

    await fetch(`${BASE()}/rest/v1/pesquisas?token=eq.${token}`, {
      method: "PATCH",
      headers: cab({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ status: "enviado", enviado_em: new Date().toISOString() }),
    });

    return res.status(200).json({ ok: true, cliente, token, link });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: String(e.message || e) });
  }
});

// ------------------------------------------------------------------
// 3. RESPONDER PESQUISA (Endpoint público acessado pelo form)
// ------------------------------------------------------------------
exports.responder = onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  function tokenValido(t) {
    return typeof t === "string" && /^[A-Za-z0-9_-]{10,64}$/.test(t);
  }

  async function buscar(token) {
    const r = await fetch(`${BASE()}/rest/v1/pesquisas?select=token,cliente,nota,respondido_em,status&token=eq.${encodeURIComponent(token)}`, { headers: cab() });
    if (!r.ok) return null;
    const linhas = await r.json();
    return linhas[0] || null;
  }

  try {
    if (req.method === "GET") {
      const t = String(req.query?.t || "");
      if (!tokenValido(t)) return res.status(400).json({ ok: false, erro: "Link inválido." });

      const p = await buscar(t);
      if (!p) return res.status(404).json({ ok: false, erro: "Link inválido ou expirado." });

      return res.status(200).json({ ok: true, cliente: p.cliente, respondido: !!p.respondido_em, nota: p.nota });
    }

    if (req.method === "POST") {
      const corpo = req.body || {};
      const t = String(corpo.token || "");
      const nota = Number(corpo.nota);
      const comentario = String(corpo.comentario || "").slice(0, 1000).trim() || null;

      if (!tokenValido(t)) return res.status(400).json({ ok: false, erro: "Link inválido." });
      if (!Number.isInteger(nota) || nota < 0 || nota > 10) return res.status(400).json({ ok: false, erro: "Nota inválida." });

      const p = await buscar(t);
      if (!p) return res.status(404).json({ ok: false, erro: "Link inválido ou expirado." });
      if (p.respondido_em) return res.status(200).json({ ok: true, jaRespondido: true });

      const r = await fetch(`${BASE()}/rest/v1/pesquisas?token=eq.${encodeURIComponent(t)}`, {
        method: "PATCH",
        headers: cab({ "Content-Type": "application/json", Prefer: "return=minimal" }),
        body: JSON.stringify({ nota, comentario, status: "respondido", respondido_em: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error("Erro ao gravar resposta.");
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, erro: "Método não suportado." });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: "Erro interno no servidor." });
  }
});
