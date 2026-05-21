/**
 * Camada de rede do chat — falando com o Ollama. Sem nenhuma referência ao
 * DOM. Todas as chamadas vão para `/ollama/*`, que o dev server do Vite faz
 * proxy para `http://localhost:11434` (ver vite.config.js) — assim o
 * navegador só faz requisições same-origin e não há CORS envolvido.
 */

const OLLAMA_BASE = '/ollama';

/** Modelo usado por padrão quando nenhum outro foi escolhido. */
export const DEFAULT_MODEL = 'gemma4:latest';

/** Erro tipado para falhas previsíveis da API do Ollama. */
export class OllamaError extends Error {
  /** @param {'unreachable'|'http'|'model-missing'} kind */
  constructor(kind, message) {
    super(message);
    this.name = 'OllamaError';
    this.kind = kind;
  }
}

/**
 * Verifica se o Ollama está acessível e lista os modelos instalados.
 * @returns {Promise<{ ok: boolean, models: string[] }>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m) => m.name).filter(Boolean) : [];
    return { ok: true, models };
  } catch {
    return { ok: false, models: [] };
  }
}

/**
 * Envia a conversa ao Ollama e faz streaming da resposta.
 *
 * @param {object} body corpo da requisição POST /api/chat
 * @param {object} handlers
 * @param {AbortSignal} handlers.signal cancela a geração
 * @param {(delta: string) => void} handlers.onContent trecho de resposta
 * @param {() => void} handlers.onThinking chunk de raciocínio (sem conteúdo)
 * @param {(stats: { evalCount: number, tokensPerSec: number|null }) => void} handlers.onDone
 * @returns {Promise<void>} resolve no fim do stream (ou no abort)
 */
export async function streamChat(body, { signal, onContent, onThinking, onDone }) {
  let res;
  try {
    res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw new OllamaError('unreachable', 'Não foi possível conectar ao Ollama.');
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new OllamaError('model-missing', `Modelo ${body.model} não encontrado.`);
    }
    if (res.status >= 500) {
      // O proxy do Vite devolve 5xx quando não alcança o Ollama.
      throw new OllamaError('unreachable', 'Não foi possível conectar ao Ollama.');
    }
    throw new OllamaError('http', `O Ollama respondeu HTTP ${res.status}.`);
  }
  if (!res.body) {
    throw new OllamaError('http', 'O Ollama respondeu sem corpo de streaming.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // NDJSON: um objeto JSON por linha. A última fatia pode estar
      // incompleta — guarda no buffer para o próximo chunk.
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        handleLine(line, { onContent, onThinking, onDone });
      }
    }
    // Processa um eventual resíduo (linha final sem \n).
    handleLine(buffer, { onContent, onThinking, onDone });
  } catch (err) {
    if (err.name === 'AbortError') return; // abort = fim normal, não erro
    throw err;
  }
}

/**
 * Processa uma linha NDJSON da resposta do Ollama.
 * gemma4 é um reasoning model: cada chunk traz `message.content` (resposta)
 * e/ou `message.thinking` (raciocínio). Só `content` é repassado adiante.
 */
function handleLine(line, { onContent, onThinking, onDone }) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let obj;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    return; // linha inválida/incompleta — ignora defensivamente
  }

  const msg = obj.message;
  if (msg) {
    if (msg.content) onContent(msg.content);
    else if (msg.thinking) onThinking();
  }

  if (obj.done) {
    const evalCount = obj.eval_count ?? 0;
    const evalDuration = obj.eval_duration ?? 0;
    const tokensPerSec = evalDuration > 0 ? evalCount / (evalDuration / 1e9) : null;
    onDone({ evalCount, tokensPerSec });
  }
}
