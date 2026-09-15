const { onRequest } = require("firebase-functions/v2/https");

const GRAPH = "https://graph.instagram.com/v21.0";

function urlDaImagem(item, req) {
  const v = String(item || "").trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/api/imagem-drive?id=${encodeURIComponent(v)}`;
}

async function graph(caminho, params, metodo = "POST") {
  const url = `${GRAPH}/${caminho}`;
  const body = new URLSearchParams(params);

  let res;
  if (metodo === "GET") {
    res = await fetch(`${url}?${body}`);
  } else {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error || {};
    const msg = e.error_user_msg || e.message || JSON.stringify(data).slice(0, 300);
    throw new Error(`Instagram: ${msg}`);
  }
  return data;
}

async function esperarContainer(containerId, token, tentativas = 20) {
  for (let i = 0; i < tentativas; i++) {
    const st = await graph(containerId, { fields: "status_code,status", access_token: token }, "GET");

    if (st.status_code === "FINISHED") return true;
    if (st.status_code === "ERROR" || st.status_code === "EXPIRED") {
      throw new Error(`Container falhou (${st.status_code}): ${st.status || "sem detalhe"}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("A imagem demorou demais para processar. Tente de novo.");
}

exports.publicar = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST." });

  const token = process.env.IG_ACCESS_TOKEN;
  const igUser = process.env.IG_USER_ID;
  if (!token) return res.status(500).json({ erro: "IG_ACCESS_TOKEN não configurada." });
  if (!igUser) return res.status(500).json({ erro: "IG_USER_ID não configurada." });

  try {
    const corpo = req.body || {};
    const legenda = String(corpo.legenda || "").slice(0, 2200);
    let imagens = corpo.imagens || (corpo.imagem ? [corpo.imagem] : []);
    
    if (!Array.isArray(imagens)) imagens = [];
    imagens = imagens.map((i) => urlDaImagem(i, req)).filter(Boolean);

    if (imagens.length === 0) return res.status(400).json({ erro: "Informe ao menos uma imagem." });
    if (imagens.length > 10) return res.status(400).json({ erro: "Máximo de 10 imagens." });

    let containerFinal;
    let tipo;

    if (imagens.length === 1) {
      tipo = "foto";
      const c = await graph(`${igUser}/media`, { image_url: imagens[0], caption: legenda, access_token: token });
      await esperarContainer(c.id, token);
      containerFinal = c.id;
    } else {
      tipo = "carrossel";
      const filhos = [];
      for (const img of imagens) {
        const f = await graph(`${igUser}/media`, { image_url: img, is_carousel_item: "true", access_token: token });
        filhos.push(f.id);
      }
      for (const id of filhos) await esperarContainer(id, token);

      const c = await graph(`${igUser}/media`, { media_type: "CAROUSEL", children: filhos.join(","), caption: legenda, access_token: token });
      await esperarContainer(c.id, token);
      containerFinal = c.id;
    }

    const pub = await graph(`${igUser}/media_publish`, { creation_id: containerFinal, access_token: token });
    let permalink = null;
    try {
      const info = await graph(pub.id, { fields: "permalink", access_token: token }, "GET");
      permalink = info.permalink || null;
    } catch (_) {}

    return res.status(200).json({ ok: true, id: pub.id, tipo, quantidade: imagens.length, permalink });
  } catch (e) {
    const msg = String(e.message || e);
    const dica = /expired|session|OAuth|token/i.test(msg) ? " — gere novo token no Developers Facebook." : "";
    return res.status(500).json({ erro: msg.slice(0, 400) + dica });
  }
});
