# Banco de Fichas — despliegue en Netlify con sincronización

Este proyecto es la app de fichas de vocabulario, con:
- Pantalla de acceso (usuario/contraseña).
- Sincronización real entre dispositivos a través de Netlify Functions + Netlify Blobs.
- Si se abre `index.html` directamente (sin desplegar), sigue funcionando en modo local sin sincronizar, como antes.

## Archivos

- `index.html` — la aplicación (incluye ya el vocabulario "Vocabulario Oposición" precargado).
- `netlify.toml` — configuración de Netlify (dónde están las funciones).
- `package.json` — dependencia `@netlify/blobs`, necesaria para guardar los datos.
- `netlify/functions/login.js` — comprueba el usuario/contraseña (definidos como variables de entorno).
- `netlify/functions/decks.js` — guarda y devuelve los mazos de fichas.

## Pasos para desplegar

1. Instala Node.js (desde nodejs.org) si no lo tienes, y la CLI de Netlify:
   `npm install -g netlify-cli`
2. Dentro de esta carpeta, instala la dependencia:
   `npm install`
3. Inicia sesión en Netlify (te abrirá el navegador; crea una cuenta gratis si no tienes):
   `netlify login`
4. Publica el sitio:
   `netlify deploy --prod`
   La primera vez te preguntará si quieres crear un sitio nuevo — di que sí y ponle el nombre que quieras.
5. En el panel de Netlify (https://app.netlify.com) entra en tu sitio → **Site configuration → Environment variables** y añade:
   - `FICHAS_USER` = `Raul García`
   - `FICHAS_PASS` = `Raul.2026`
6. Vuelve a publicar para que las funciones cojan esas variables:
   `netlify deploy --prod`
7. Abre la URL que te ha dado Netlify (tipo `https://tu-sitio.netlify.app`) desde cualquier dispositivo e inicia sesión con el usuario y contraseña de arriba.
