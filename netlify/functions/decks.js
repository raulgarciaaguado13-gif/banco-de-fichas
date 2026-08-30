// netlify/functions/decks.js
//
// Guarda y devuelve los mazos de fichas en Netlify Blobs, para que estén
// disponibles desde cualquier dispositivo que inicie sesión con el mismo
// usuario/contraseña. Cada petición debe llevar el token que devolvió
// login.js en la cabecera "Authorization: Bearer <token>"; este archivo
// recalcula ese mismo token a partir de las variables de entorno y lo
// compara, así que no hace falta ninguna base de datos de sesiones.

const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

function expectedToken() {
  const expectedUser = process.env.FICHAS_USER || "";
  const expectedPass = process.env.FICHAS_PASS || "";
  const salt = process.env.FICHAS_SALT || "fichas-app-salt-v1";
  if (!expectedUser || !expectedPass) return null;
  return crypto
    .createHash("sha256")
    .update(salt + "::" + expectedUser + "::" + expectedPass)
    .digest("hex");
}

exports.handler = async function (event) {
  const expected = expectedToken();
  const authHeader =
    (event.headers && (event.headers.authorization || event.headers.Authorization)) || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!expected || !token || token !== expected) {
    return { statusCode: 401, body: JSON.stringify({ error: "No autorizado" }) };
  }

  const store = getStore("fichas-data");
  const key = "decks";

  if (event.httpMethod === "GET") {
    const raw = await store.get(key);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: raw || "null",
    };
  }

  if (event.httpMethod === "POST") {
    const text = event.body || "[]";
    try {
      JSON.parse(text);
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
    }
    await store.set(key, text);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method not allowed" };
};

