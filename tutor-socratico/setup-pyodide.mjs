// Popula tutor-socratico/public/pyodide/ com o runtime do Pyodide e os wheels
// de numpy/sympy/matplotlib (+ dependências) — tudo servido localmente, para o
// tutor funcionar 100% offline. Rode uma vez: `npm run setup:tutor`.
//
// O pacote npm `pyodide` traz só o núcleo (loader + runtime). Os wheels dos
// pacotes científicos são baixados aqui do CDN do Pyodide, na versão exata.

import { createRequire } from 'node:module';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Localiza o pacote npm `pyodide` e sua versão.
const pyodideDir = dirname(require.resolve('pyodide'));
const { version } = JSON.parse(await readFile(join(pyodideDir, 'package.json'), 'utf8'));

const outDir = join(here, 'public', 'pyodide');
await mkdir(outDir, { recursive: true });
console.log(`Pyodide ${version} -> ${outDir}\n`);

// 1. Arquivos de runtime que o loadPyodide() busca no indexURL.
const RUNTIME_FILES = [
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];
for (const file of RUNTIME_FILES) {
  await copyFile(join(pyodideDir, file), join(outDir, file));
  console.log(`  runtime  ${file}`);
}

// 2. Fecho de dependências de numpy/sympy/matplotlib a partir do lockfile.
const lock = JSON.parse(await readFile(join(pyodideDir, 'pyodide-lock.json'), 'utf8'));
const packages = lock.packages ?? {};

const wanted = new Set();
const queue = ['numpy', 'sympy', 'matplotlib'];
while (queue.length > 0) {
  const name = queue.shift().toLowerCase();
  if (wanted.has(name)) continue;
  const pkg = packages[name];
  if (!pkg) {
    console.warn(`  aviso: "${name}" não está no pyodide-lock.json — ignorado`);
    continue;
  }
  wanted.add(name);
  for (const dep of pkg.depends ?? []) queue.push(dep);
}

// 3. Baixa cada wheel do CDN do Pyodide para a pasta local.
const baseURL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
let downloaded = 0;
for (const name of wanted) {
  const fileName = packages[name].file_name;
  if (!fileName) continue;
  const dest = join(outDir, fileName);
  try {
    await access(dest);
    console.log(`  ok       ${fileName} (já existe)`);
    continue;
  } catch {
    /* não existe — baixar */
  }
  const res = await fetch(baseURL + fileName);
  if (!res.ok) {
    throw new Error(`Falha ao baixar ${fileName}: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  downloaded += 1;
  console.log(`  baixado  ${fileName} (${(buf.length / 1048576).toFixed(1)} MB)`);
}

console.log(
  `\nPronto. ${RUNTIME_FILES.length} arquivos de runtime + ${wanted.size} pacotes ` +
    `(${downloaded} baixados agora).`,
);
