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
//
// Nota: esta función usa la sintaxis "Functions v2" (export default, con
// Request/Response nativos) porque Netlify Blobs necesita v2 para que las
// credenciales se inyecten automáticamente en producción.

import crypto from "node:crypto";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = (body.user || "").trim();
  const pass = body.pass || "";

  const expectedUser = process.env.FICHAS_USER || "";
  const expectedPass = process.env.FICHAS_PASS || "";
  const salt = process.env.FICHAS_SALT || "fichas-app-salt-v1";

  if (!expectedUser || !expectedPass) {
    return new Response(
      JSON.stringify({
        error:
          "El sitio no tiene configuradas las variables FICHAS_USER y FICHAS_PASS en Netlify (Site settings > Environment variables).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (user !== expectedUser || pass !== expectedPass) {
    return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = crypto
    .createHash("sha256")
    .update(salt + "::" + expectedUser + "::" + expectedPass)
    .digest("hex");

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
