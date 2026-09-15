const { onRequest } = require("firebase-functions/v2/https");
const crypto = require("crypto");

// ------------------------------------------------------------------
// AUTENTICAÇÃO E LISTAGEM (GOOGLE DRIVE)
// ------------------------------------------------------------------
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
  if (!data.access_token) throw new Error("Falha ao autenticar no Google.");
  return data.access_token;
}

async function listar(token, query) {
  const url = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink)",
    pageSize: "200",
    orderBy: "name",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Erro na API do Drive");
  const data = await res.json();
  return data.files || [];
}

async function todasAsImagens(token, rootId) {
  const todas = [];
  const soltas = await listar(token, `'${rootId}' in parents and mimeType contains 'image/' and trashed=false`);
  soltas.forEach((f) => todas.push({ ...f, pasta: "(raiz)" }));

  const subpastas = await listar(token, `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  for (const p of subpastas) {
    const imgs = await listar(token, `'${p.id}' in parents and mimeType contains 'image/' and trashed=false`);
    imgs.forEach((f) => todas.push({ ...f, pasta: p.name }));
  }
  return todas;
}

function normalizar(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\.(jpe?g|png|webp|gif)\b/g, " ")
    .replace(/[_\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const RUIDO = new Set([
  "carrossel", "carousel", "foto", "fotos", "imagem", "imagens", "video", "reel",
  "de", "da", "do", "das", "dos", "e", "com", "para", "pra", "em", "no", "na",
  "close", "angulo", "outro", "outra", "se", "houver", "ambiente", "transicao",
  "fundo", "cena", "detalhe", "vertical", "horizontal", "sugerida", "opcional",
  "a", "o", "as", "os", "um", "uma", "que", "ou",
]);

function extrairTermos(sugestao) {
  let s = String(sugestao || "");
  s = s.replace(/^\s*(carrossel|carousel|foto|imagem|reel|video)\s*:\s*/i, "");
  s = s.replace(/\([^)]*\)/g, " + ");
  return s.split(/[+,;/|]| e /i).map((t) => t.trim()).filter((t) => t.length > 1);
}

function pontuar(termo, arquivo) {
  const t = normalizar(termo);
  const nome = normalizar(arquivo.name);
  const pasta = normalizar(arquivo.pasta);
  if (!t) return 0;
  if (nome === t) return 1000;
  if (t.includes(nome) || nome.includes(t)) return 500;

  const palavras = t.split(" ").filter((p) => p.length > 2 && !RUIDO.has(p));
  if (palavras.length === 0) return 0;

  let score = 0;
  for (const p of palavras) {
    if (nome.split(" ").includes(p)) score += 100;
    else if (nome.includes(p)) score += 60;
    else if (pasta.includes(p)) score += 25;
  }
  return score;
}

// ------------------------------------------------------------------
// 1. LISTAR DRIVE (Pastas e Imagens)
// ------------------------------------------------------------------
exports.listarImagens = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  try {
    const b64 = process.env.GOOGLE_CREDENTIALS;
    const rootId = process.env.DRIVE_FOLDER_ID;
    if (!b64 || !rootId) return res.status(500).json({ erro: "Variáveis do Drive não configuradas." });

    const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    const token = await getAccessToken(creds);

    const subpastas = await listar(token, `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const pastas = [];

    for (const p of subpastas) {
      const imgs = await listar(token, `'${p.id}' in parents and mimeType contains 'image/' and trashed=false`);
      pastas.push({
        id: p.id, nome: p.name,
        imagens: imgs.map((f) => ({
          id: f.id, nome: f.name, thumb: f.thumbnailLink || null,
          view: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
          download: f.webContentLink || `https://drive.google.com/uc?export=download&id=${f.id}`,
        })),
      });
    }

    const soltas = await listar(token, `'${rootId}' in parents and mimeType contains 'image/' and trashed=false`);
    if (soltas.length > 0) {
      pastas.unshift({
        id: rootId, nome: "(soltas na raiz)",
        imagens: soltas.map((f) => ({
          id: f.id, nome: f.name, thumb: f.thumbnailLink || null,
          view: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
          download: f.webContentLink || `https://drive.google.com/uc?export=download&id=${f.id}`,
        })),
      });
    }

    return res.status(200).json({ pastas });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao listar: " + String(e) });
  }
});

// ------------------------------------------------------------------
// 2. CASAR IMAGENS (Google Drive Matcher)
// ------------------------------------------------------------------
exports.casarImagens = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST" });

  try {
    const corpo = req.body || {};
    const sugestao = corpo.sugestao || corpo.imagem_sugerida || "";
    const formato = String(corpo.formato || "").toLowerCase();

    if (!sugestao) return res.status(400).json({ erro: "Informe a sugestão de imagem da pauta." });

    const b64 = process.env.GOOGLE_CREDENTIALS;
    const rootId = process.env.DRIVE_FOLDER_ID;
    if (!b64 || !rootId) return res.status(500).json({ erro: "Variáveis do Drive não configuradas." });

    const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    const token = await getAccessToken(creds);
    const arquivos = await todasAsImagens(token, rootId);

    const termos = extrairTermos(sugestao);
    const encontradas = [];
    const nao_encontradas = [];
    const jaUsados = new Set();
    const CORTE = 60;

    for (const termo of termos) {
      let melhor = null;
      let melhorScore = 0;
      for (const arq of arquivos) {
        if (jaUsados.has(arq.id)) continue;
        const s = pontuar(termo, arq);
        if (s > melhorScore) { melhorScore = s; melhor = arq; }
      }

      if (melhor && melhorScore >= CORTE) {
        jaUsados.add(melhor.id);
        encontradas.push({
          id: melhor.id, nome: melhor.name, pasta: melhor.pasta,
          thumb: melhor.thumbnailLink || null, termo, score: melhorScore,
        });
      } else {
        nao_encontradas.push(termo);
      }
    }

    const limitadas = encontradas.slice(0, 10);
    let tipo = limitadas.length > 1 ? "carrossel" : "foto";
    if (formato === "foto" && limitadas.length > 1) tipo = "carrossel";

    return res.status(200).json({
      tipo, encontradas: limitadas, nao_encontradas,
      total_sugerido: termos.length, formato_original: formato || null,
    });
  } catch (e) {
    return res.status(500).json({ erro: "Erro ao casar: " + String(e) });
  }
});
