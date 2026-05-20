#!/usr/bin/env bash
set -euo pipefail

cd /opt/penpot/backend

export PENPOT_HTTP_SERVER_HOST="${PENPOT_HTTP_SERVER_HOST:-0.0.0.0}"
export PENPOT_HTTP_SERVER_PORT="${PENPOT_HTTP_SERVER_PORT:-${PORT:-10000}}"

if [[ -z "${JAVA_CMD:-}" ]]; then
  if [[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/java" ]]; then
    JAVA_CMD="$JAVA_HOME/bin/java"
  else
    JAVA_CMD="$(command -v java)"
  fi
fi

export JAVA_OPTS="-Dim4java.useV7=true -Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager -Dlog4j2.configurationFile=log4j2.xml -XX:-OmitStackTraceInFastThrow --sun-misc-unsafe-memory-access=allow --enable-native-access=ALL-UNNAMED --enable-preview ${JVM_OPTS:-} ${JAVA_OPTS:-}"

exec "$JAVA_CMD" $JAVA_OPTS -cp penpot.jar clojure.main -e "(require (quote app.main))(app.main/start)(deref (promise))"
