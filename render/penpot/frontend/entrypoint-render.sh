#!/usr/bin/env bash
set -euo pipefail

cp /opt/penpot-render/templates/nginx.conf.template /tmp/nginx.conf.template
cp /opt/penpot-render/templates/resolvers.conf.template /tmp/resolvers.conf.template

export PENPOT_EXPORTER_URI="${PENPOT_EXPORTER_URI:-${PENPOT_BACKEND_URI:-http://penpot-backend:6060}}"
export PENPOT_NITRATE_URI="${PENPOT_NITRATE_URI:-${PENPOT_BACKEND_URI:-http://penpot-backend:6060}}"
export PENPOT_MCP_URI="${PENPOT_MCP_URI:-${PENPOT_BACKEND_URI:-http://penpot-backend:6060}}"
export PENPOT_MCP_URI_WS="${PENPOT_MCP_URI_WS:-${PENPOT_BACKEND_URI:-http://penpot-backend:6060}}"

exec /bin/bash /entrypoint.sh "$@"
