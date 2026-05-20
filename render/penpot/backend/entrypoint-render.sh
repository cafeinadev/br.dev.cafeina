#!/usr/bin/env bash
set -euo pipefail

cd /opt/penpot/backend

export PENPOT_HTTP_SERVER_HOST="${PENPOT_HTTP_SERVER_HOST:-0.0.0.0}"
export PENPOT_HTTP_SERVER_PORT="${PENPOT_HTTP_SERVER_PORT:-${PORT:-10000}}"
export PENPOT_INTERNAL_HTTP_PORT="${PENPOT_INTERNAL_HTTP_PORT:-6060}"

exec node /opt/penpot-render/proxy.js
