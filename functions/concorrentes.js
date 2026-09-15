const { onRequest } = require("firebase-functions/v2/https");

// ------------------------------------------------------------------
// 1. COLETAR CONCORRENTES (Apify)
// ------------------------------------------------------------------
exports.coletar = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido" });

  const token = process.env.APIFY_TOKEN;
  if (!token) return res.status(500).json({ erro: "APIFY_TOKEN não configurada." });

  try {
    const { instagram, limite } = req.body || {};
    if (!instagram) return res.status(400).json({ erro: "Faltou o @ do Instagram do concorrente." });
    
    const maxPosts = Math.min(Math.max(parseInt(limite, 10) || 15, 1), 30);
    const actor = "apify~instagram-scraper";
    const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}`;

    const input = {
      directUrls: [`https://www.instagram.com/${instagram}/`],
      resultsType: "posts",
      resultsLimit: maxPosts,
      addParentData: false,
    };

    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      return res.status(502).json({ erro: "Falha na Apify", detalhe: detalhe.slice(0, 500) });
    }

    const itens = await resposta.json();

    const posts = (Array.isArray(itens) ? itens : []).map((it) => {
      const tipoBruto = (it.type || it.productType || "").toLowerCase();
      let tipo = "image";
      if (tipoBruto.includes("video") || it.videoUrl) tipo = "video";
      if (tipoBruto.includes("sidecar") || (it.images && it.images.length > 1)) tipo = "carousel";
      if (tipoBruto.includes("clips") || tipoBruto.includes("reel")) tipo = "reel";

      const hashtags = Array.isArray(it.hashtags) ? it.hashtags.join(" ")
        : (it.caption ? (it.caption.match(/#[\w\u00C0-\u017F]+/g) || []).join(" ") : "");

      return {
        post_id: String(it.id || it.shortCode || it.url || ""),
        url: it.url || (it.shortCode ? `https://www.instagram.com/p/${it.shortCode}/` : null),
        tipo,
        legenda: it.caption || "",
        curtidas: it.likesCount != null ? it.likesCount : null,
        comentarios: it.commentsCount != null ? it.commentsCount : null,
        visualizacoes: it.videoViewCount != null ? it.videoViewCount : (it.videoPlayCount != null ? it.videoPlayCount : null),
        hashtags,
        postado_em: it.timestamp || null,
      };
    }).filter((p) => p.post_id);

    return res.status(200).json({ posts, total: posts.length });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao coletar", detalhe: String(e).slice(0, 500) });
  }
});

// ------------------------------------------------------------------
// 2. ANALISAR CONCORRENTE (Anthropic - Adaptado para o IFA)
// ------------------------------------------------------------------
exports.analisar = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ erro: "ANTHROPIC_API_KEY não configurada." });

  try {
    const { concorrente, posts, modo } = req.body || {};
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ erro: "Sem posts para analisar." });
    }

    const limparTexto = (str) => {
      const s = String(str || "");
      let out = "";
      for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
          const next = s.charCodeAt(i + 1);
          if (next >= 0xDC00 && next <= 0xDFFF) { out += s[i] + s[i + 1]; i++; }
        } else if (code >= 0xDC00 && code <= 0xDFFF) {
        } else {
          out += s[i];
        }
      }
      return out;
    };

    const resumo = posts.slice(0, 60).map((p, i) => {
      const eng = (p.curtidas || 0) + (p.comentarios || 0);
      const data = p.postado_em ? String(p.postado_em).slice(0, 10) : "?";
      const leg = limparTexto(p.legenda).replace(/\s+/g, " ").slice(0, 200);
      return `${i + 1}. [${data}] tipo:${p.tipo || "?"} | ${p.curtidas || 0} curtidas, ${p.comentarios || 0} coment. (eng:${eng}) | "${leg}"`;
    }).join("\n");

    let prompt;
    if (modo === "geral") {
      prompt = `Você é um consultor de marketing digital especialista em institutos de desenvolvimento e mentoria corporativa.
Abaixo estão posts públicos de VÁRIOS concorrentes do IFA (Instituto de Desenvolvimento Pessoal e Profissional). 
O IFA tem como "Roma" (promessa): ajudar empresários a terem empresas autônomas formando seus gerentes.

Faça um diagnóstico do MERCADO: quais formatos (reels/carrossel/foto) dão mais engajamento, temas recorrentes, e o que o IFA poderia fazer diferente para se destacar vendendo sua metodologia de autonomia empresarial.
Termine com 5 sugestões de pauta CONCRETAS para o IFA. Seja prático, use markdown com títulos e listas.\n\nPOSTS DOS CONCORRENTES:\n${resumo}`;
    } else {
      prompt = `Você é um consultor de marketing digital especialista em institutos de desenvolvimento e mentoria corporativa.
Abaixo estão os posts públicos recentes do concorrente "${concorrente}" do IFA (Instituto de Desenvolvimento Pessoal e Profissional). 
O IFA tem como "Roma" (promessa): ajudar empresários a terem empresas autônomas formando seus gerentes.

Faça um diagnóstico deste concorrente: com que frequência postam, quais formatos/temas engajam mais, o que eles fazem bem, e o que o IFA pode aprender ou fazer melhor para vender sua metodologia.
Termine com 3 sugestões de pauta CONCRETAS para o IFA inspiradas no que funciona para este concorrente. Seja prático, use markdown com títulos e listas.\n\nPOSTS DE ${concorrente}:\n${resumo}`;
    }

    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: limparTexto(prompt) }],
      }),
    });

    if (!resposta.ok) return res.status(502).json({ erro: "Falha na API da Anthropic" });

    const dados = await resposta.json();
    const texto = (dados.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

    return res.status(200).json({ analise: texto });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao analisar", detalhe: String(e).slice(0, 500) });
  }
});
