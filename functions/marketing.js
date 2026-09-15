const { onRequest } = require("firebase-functions/v2/https");
const crypto = require("crypto");

// Função auxiliar de JWT
function base64url(input) {
  return Buffer.from(input).toString("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(creds.private_key, "base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Falha ao autenticar no Google");
  return data.access_token;
}

// ------------------------------------------------------------------
// 1. GERAR PAUTAS (Adaptado para o IFA)
// ------------------------------------------------------------------
exports.gerarPautas = onRequest(async (req, res) => {
  // Configurando CORS básico
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ erro: "ANTHROPIC_API_KEY não configurada." });

  try {
    const { posts, quantidade } = req.body || {};
    const qtd = Math.min(Math.max(parseInt(quantidade, 10) || 5, 1), 10);

    const resumoConc = (posts || []).slice(0, 40).map((p) => {
      const eng = (p.curtidas || 0) + (p.comentarios || 0);
      return `- ${p.tipo || "?"} (eng ${eng}): "${String(p.legenda).slice(0, 120)}"`;
    }).join("\n");

    const prompt = `Você é um estrategista de marketing digital especialista em desenvolvimento pessoal e corporativo.
Seu cliente é o IFA (Instituto de Desenvolvimento Pessoal e Profissional). 
A 'Roma' (promessa principal) do IFA é ajudar o empresário a ter a sua empresa autônoma através da formação do gerente dessa empresa.

O QUE FUNCIONA NOS CONCORRENTES (aprenda, mas NÃO copie):
${resumoConc || "(sem dados)"}

TAREFA: gere ${qtd} pautas de post PRONTAS para o Instagram do IFA. Cada pauta deve:
- Focar na dor do empresário que trabalha demais e não tem um gerente preparado.
- Focar na solução: formar o gerente para que a empresa rode sozinha (autônoma).
- Ter uma legenda envolvente, com storytelling e chamada para ação clara.

Responda APENAS com um JSON válido (array), no formato:
[{"titulo":"...","formato":"reel|carrossel|foto|stories","tema":"...","legenda":"...","hashtags":"#... #...","cta":"..."}]`;

    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      return res.status(502).json({ erro: "Falha na API da Anthropic", detalhe });
    }

    const dados = await resposta.json();
    let texto = (dados.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    texto = texto.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    
    let pautas = JSON.parse(texto);
    return res.status(200).json({ pautas });
  } catch (e) {
    return res.status(500).json({ erro: String(e.message || e) });
  }
});
