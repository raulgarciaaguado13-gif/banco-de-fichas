// netlify/functions/decks.js
//
// Guarda y devuelve los mazos de fichas en Netlify Blobs, para que estén
// disponibles desde cualquier dispositivo que inicie sesión con el mismo
// usuario/contraseña. Cada petición debe llevar el token que devolvió
// login.js en la cabecera "Authorization: Bearer <token>"; este archivo
// recalcula ese mismo token a partir de las variables de entorno y lo
// compara, así que no hace falta ninguna base de datos de sesiones.
//
// Nota: esta función usa la sintaxis "Functions v2" (export default, con
// Request/Response nativos) porque Netlify Blobs necesita v2 para que las
// credenciales se inyecten automáticamente en producción (con v1 daba
// "MissingBlobsEnvironmentError").

import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

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

export default async (req) => {
  const expected = expectedToken();
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!expected || !token || token !== expected) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore("fichas-data");
  const key = "decks";

  if (req.method === "GET") {
    const raw = await store.get(key);
    return new Response(raw || "null", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const text = await req.text();
    try {
      JSON.parse(text);
    } catch (e) {
      return new Response(JSON.stringify({ error: "JSON inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await store.set(key, text);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
