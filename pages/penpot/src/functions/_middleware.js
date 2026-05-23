// Middleware do Cloudflare Pages: intercepta requisições para os endpoints da API
// do Penpot e proxy-passa para o backend (ou exporter) no Render. Cobre HTTP e
// WebSocket (fetch nativo dos Workers suporta upgrade transparente).
//
// Configure no painel do Cloudflare Pages > Settings > Environment variables:
//   PENPOT_BACKEND_URL   = https://penpot-backend.onrender.com
//   PENPOT_EXPORTER_URL  = https://penpot-exporter.onrender.com

const stripSlash = (u) => u.replace(/\/+$/, "");

export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  let upstream = null;
  if (path.startsWith("/api/export")) upstream = env.PENPOT_EXPORTER_URL;
  else if (path.startsWith("/api/")) upstream = env.PENPOT_BACKEND_URL;
  else if (path.startsWith("/assets/")) upstream = env.PENPOT_BACKEND_URL;
  else if (path === "/readyz") upstream = env.PENPOT_BACKEND_URL;
  else if (path.startsWith("/ws/")) upstream = env.PENPOT_BACKEND_URL;

  if (!upstream) return next();

  const target = stripSlash(upstream) + path + url.search;
  return fetch(target, request);
};
