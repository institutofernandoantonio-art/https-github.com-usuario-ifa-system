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
