#!/usr/bin/env bash
# Extrai a SPA estática da imagem Docker do Penpot e prepara o diretório `dist/`
# para upload no Cloudflare Pages. Roda em GitHub Actions ou localmente.
set -euo pipefail

PENPOT_VERSION="${PENPOT_VERSION:-2.15.3}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="${SCRIPT_DIR}/dist"

echo "==> Limpando dist/"
rm -rf "$DIST"
mkdir -p "$DIST"

echo "==> Puxando penpotapp/frontend:${PENPOT_VERSION}"
docker pull "penpotapp/frontend:${PENPOT_VERSION}"

echo "==> Extraindo /var/www/app para dist/"
CID="$(docker create "penpotapp/frontend:${PENPOT_VERSION}")"
trap "docker rm -f $CID >/dev/null" EXIT
docker cp "$CID":/var/www/app/. "$DIST"/

echo "==> Copiando _redirects, _headers e functions/"
cp -R "${SCRIPT_DIR}/src/." "$DIST"/

echo "==> Conteúdo final:"
ls -la "$DIST" | head -20

echo "==> Pronto. Para deploy local:  wrangler pages deploy $DIST --project-name=penpot"
