const http = require("node:http");
const net = require("node:net");
const { spawn } = require("node:child_process");

const publicPort = Number(process.env.PORT || "10000");
const internalPort = Number(process.env.PENPOT_INTERNAL_HTTP_PORT || "6060");
const internalHost = "127.0.0.1";

const splitOpts = (value) => (value || "").match(/(?:[^\s"]+|"[^"]*")+/g)?.map((item) => item.replace(/^"|"$/g, "")) || [];

const javaOpts = [
  "-Dim4java.useV7=true",
  "-Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager",
  "-Dlog4j2.configurationFile=log4j2.xml",
  "-XX:-OmitStackTraceInFastThrow",
  "--sun-misc-unsafe-memory-access=allow",
  "--enable-native-access=ALL-UNNAMED",
  "--enable-preview",
  ...splitOpts(process.env.JVM_OPTS),
  ...splitOpts(process.env.JAVA_OPTS),
];

const penpotEnv = {
  ...process.env,
  PENPOT_HTTP_SERVER_HOST: internalHost,
  PENPOT_HTTP_SERVER_PORT: String(internalPort),
};

const penpot = spawn(process.env.JAVA_CMD || "java", [
  ...javaOpts,
  "-cp",
  "penpot.jar",
  "clojure.main",
  "-e",
  "(require (quote app.main))(app.main/start)(deref (promise))",
], {
  cwd: "/opt/penpot/backend",
  env: penpotEnv,
  stdio: "inherit",
});

penpot.on("exit", (code, signal) => {
  console.error(`penpot backend exited code=${code ?? ""} signal=${signal ?? ""}`);
  process.exit(code || 1);
});

const warming = (res) => {
  res.writeHead(503, { "content-type": "text/plain; charset=utf-8" });
  res.end("penpot backend warming\n");
};

const server = http.createServer((req, res) => {
  const upstream = http.request({
    hostname: internalHost,
    port: internalPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${internalHost}:${internalPort}` },
  }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
    upstreamRes.pipe(res);
  });

  upstream.on("error", () => warming(res));
  req.pipe(upstream);
});

server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect(internalPort, internalHost, () => {
    upstream.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
    for (const [key, value] of Object.entries(req.headers)) {
      upstream.write(`${key}: ${value}\r\n`);
    }
    upstream.write("\r\n");
    if (head.length > 0) {
      upstream.write(head);
    }
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  upstream.on("error", () => socket.destroy());
});

server.listen(publicPort, "0.0.0.0", () => {
  console.log(`penpot backend proxy listening on ${publicPort}, upstream ${internalHost}:${internalPort}`);
});
