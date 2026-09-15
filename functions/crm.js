const { onRequest } = require("firebase-functions/v2/https");

// ------------------------------------------------------------------
// GERAR MENSAGEM DE REATIVAÇÃO DE CLIENTES ESFRIADOS
// ------------------------------------------------------------------
exports.gerarMensagem = onRequest(async (req, res) => {
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
    const { cliente, diasSumido, totalGasto, nCompras, ultimaCompra, tom } = req.body || {};
    if (!cliente) return res.status(400).json({ erro: "Faltou o nome do cliente." });

    const contexto = [
      `Cliente: ${cliente}`,
      diasSumido != null ? `Está sem comprar mentorias/cursos há ${diasSumido} dias` : null,
      ultimaCompra ? `Última compra em ${ultimaCompra}` : null,
      nCompras != null ? `Já fez ${nCompras} compras no total` : null,
      totalGasto != null ? `Já investiu cerca de R$ ${totalGasto} no IFA` : null,
    ].filter(Boolean).join(". ");

    const tomEscolhido = tom || "amigável e inspirador";

    const prompt = `Você é o atendimento de excelência do IFA (Instituto de Desenvolvimento Pessoal e Profissional). 
O IFA tem como missão formar gerentes para que empresários tenham empresas autônomas.

Escreva UMA mensagem curta de WhatsApp para reativar um cliente (empresário) que parou de investir em nossos cursos/mentorias. 
A mensagem deve ser ${tomEscolhido}, calorosa, com no máximo 3-4 linhas, sem parecer robótica.
Não invente promoções. Lembre-o de forma sutil sobre a importância da autonomia da empresa.
Trate o cliente pelo nome de forma natural. 
Responda APENAS com o texto da mensagem.\n\nDados do cliente: ${contexto}`;

    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resposta.ok) return res.status(502).json({ erro: "Falha na API da Anthropic" });

    const dados = await resposta.json();
    const texto = (dados.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

    return res.status(200).json({ mensagem: texto });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao gerar mensagem", detalhe: String(e.message || e).slice(0, 500) });
  }
});
