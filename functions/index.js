const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Endpoint de teste
exports.ping = onRequest((req, res) => {
  res.json({ ok: true, message: "Firebase Functions do IFA funcionando!" });
});

// Módulos
const marketing = require("./marketing");
exports.gerarPautas = marketing.gerarPautas;

const pesquisa = require("./pesquisa");
exports.enviarPesquisa = pesquisa.enviar;
exports.responderPesquisa = pesquisa.responder;

const concorrentes = require("./concorrentes");
exports.coletarConcorrentes = concorrentes.coletar;
exports.analisarConcorrentes = concorrentes.analisar;

const instagram = require("./instagram");
exports.publicarInstagram = instagram.publicar;

const crm = require("./crm");
exports.gerarMensagem = crm.gerarMensagem;

const drive = require("./drive");
exports.listarImagens = drive.listarImagens;
exports.casarImagens = drive.casarImagens;
