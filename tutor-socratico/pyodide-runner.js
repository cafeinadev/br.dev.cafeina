/**
 * Motor de cálculo do tutor — Python rodando no navegador via Pyodide.
 *
 * O loader do Pyodide é carregado por `<script src="/pyodide/pyodide.js">` no
 * index.html, expondo `globalThis.loadPyodide`. Assim o Vite não precisa
 * empacotar o loader (que referencia módulos Node). Sem referência ao DOM.
 */

let pyodide = null;
let readyPromise = null;
let stdoutBuffer = '';

// Roda uma vez, depois que os pacotes carregam: backend headless, imports do
// SymPy, símbolos comuns prontos e o helper que captura um gráfico como PNG.
const BOOTSTRAP = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import sympy as sp
from sympy import (symbols, Eq, solve, simplify, expand, factor, diff,
                   integrate, limit, Rational, sqrt, S, latex, N, pi, oo,
                   sin, cos, tan, log, exp, Abs)
import io as _ts_io, base64 as _ts_base64
x, y, z, t, n = symbols('x y z t n')

def _ts_capture_plot():
    buf = _ts_io.BytesIO()
    plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
    plt.close('all')
    buf.seek(0)
    return _ts_base64.b64encode(buf.read()).decode('ascii')
`;

/**
 * Carrega o Pyodide e os pacotes científicos. Idempotente — chamadas
 * seguintes reusam a mesma promessa.
 * @param {(phase: 'runtime'|'packages'|'bootstrap'|'ready') => void} [onProgress]
 * @returns {Promise<unknown>}
 */
export function init(onProgress = () => {}) {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    if (typeof globalThis.loadPyodide !== 'function') {
      throw new Error('loadPyodide indisponível — /pyodide/pyodide.js não carregou.');
    }
    onProgress('runtime');
    pyodide = await globalThis.loadPyodide({ indexURL: '/pyodide/' });
    pyodide.setStdout({
      batched: (line) => {
        stdoutBuffer += `${line}\n`;
      },
    });
    onProgress('packages');
    await pyodide.loadPackage(['numpy', 'sympy', 'matplotlib']);
    onProgress('bootstrap');
    await pyodide.runPythonAsync(BOOTSTRAP);
    onProgress('ready');
    return pyodide;
  })();
  return readyPromise;
}

/** @returns {boolean} se o motor já está pronto para `run()`. */
export function isReady() {
  return pyodide !== null;
}

/**
 * Executa uma diretiva do modelo.
 * @param {{ kind: 'calc'|'plot', code: string }} directive
 * @returns {Promise<
 *   { kind:'text', value:string } |
 *   { kind:'image', dataUrl:string } |
 *   { kind:'error', message:string }
 * >}
 */
export async function run(directive) {
  await init();
  return directive.kind === 'plot' ? runPlot(directive.code) : runCalc(directive.code);
}

async function runCalc(code) {
  stdoutBuffer = '';
  try {
    const result = await pyodide.runPythonAsync(code);
    let value;
    if (result == null) {
      value = stdoutBuffer.trim() || '(sem valor de retorno)';
    } else if (typeof result === 'object') {
      value = result.toString();
      if (typeof result.destroy === 'function') result.destroy();
    } else {
      value = String(result);
    }
    return { kind: 'text', value };
  } catch (err) {
    return { kind: 'error', message: shortError(err) };
  }
}

async function runPlot(code) {
  stdoutBuffer = '';
  try {
    await pyodide.runPythonAsync(code);
    const base64 = await pyodide.runPythonAsync('_ts_capture_plot()');
    return { kind: 'image', dataUrl: `data:image/png;base64,${base64}` };
  } catch (err) {
    return { kind: 'error', message: shortError(err) };
  }
}

/** Pega a última linha útil de um traceback do Python. */
function shortError(err) {
  const text = String(err && err.message ? err.message : err).trim();
  const lines = text.split('\n').filter(Boolean);
  return lines[lines.length - 1] || 'erro desconhecido';
}
