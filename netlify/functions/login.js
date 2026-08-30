// netlify/functions/login.js
//
// Comprueba el usuario y la contraseña contra las variables de entorno
// configuradas en Netlify (Site settings -> Environment variables):
//   FICHAS_USER  -> el usuario (por ejemplo: Raul García)
//   FICHAS_PASS  -> la contraseña (por ejemplo: Raul.2026)
//   FICHAS_SALT  -> opcional, cualquier texto fijo para "condimentar" el token
//
// Esas variables NUNCA se envían al navegador: solo viven en el servidor.
// Si el usuario/contraseña son correctos, devuelve un token derivado de ellos
// (mismo cálculo que hace netlify/functions/decks.js para comprobar cada
// petición posterior). Así no hace falta guardar sesiones en ningún sitio.

const crypto = require("crypto");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const user = (body.user || "").trim();
  const pass = body.pass || "";

  const expectedUser = process.env.FICHAS_USER || "";
  const expectedPass = process.env.FICHAS_PASS || "";
  const salt = process.env.FICHAS_SALT || "fichas-app-salt-v1";

  if (!expectedUser || !expectedPass) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "El sitio no tiene configuradas las variables FICHAS_USER y FICHAS_PASS en Netlify (Site settings > Environment variables).",
      }),
    };
  }

  if (user !== expectedUser || pass !== expectedPass) {
    return { statusCode: 401, body: JSON.stringify({ error: "Usuario o contraseña incorrectos." }) };
  }

  const token = crypto
    .createHash("sha256")
    .update(salt + "::" + expectedUser + "::" + expectedPass)
    .digest("hex");

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: token }),
  };
};

