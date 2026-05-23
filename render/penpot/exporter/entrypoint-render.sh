#!/usr/bin/env bash
set -euo pipefail

cd /opt/penpot/exporter

# Render injeta PORT; exporter lê de PENPOT_HTTP_SERVER_PORT.
export PENPOT_HTTP_SERVER_HOST="${PENPOT_HTTP_SERVER_HOST:-0.0.0.0}"
export PENPOT_HTTP_SERVER_PORT="${PENPOT_HTTP_SERVER_PORT:-${PORT:-10000}}"

exec node app.js
