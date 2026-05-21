/**
 * Camada de rede do tutor — fala com o Ollama. Sem nenhuma referência ao DOM.
 * As chamadas vão para `/ollama/*`, que o dev server do Vite faz proxy para
 * `http://localhost:11434` — o navegador só faz requisições same-origin.
 *
 * Estrutura herdada do app `ia/`: o `deepseek-r1` é um reasoning model e
 * separa o raciocínio (`message.thinking`) da resposta (`message.content`).
 */

const OLLAMA_BASE = '/ollama';

/** Modelo do tutor. */
export const MODEL = 'deepseek-r1:8b';

/** Erro tipado para falhas previsíveis da API do Ollama. */
export class OllamaError extends Error {
  /** @param {'unreachable'|'http'} kind */
  constructor(kind, message) {
    super(message);
    this.name = 'OllamaError';
    this.kind = kind;
  }
}

/**
 * Verifica se o Ollama está acessível e se o modelo do tutor está instalado.
 * @returns {Promise<{ ok: boolean, hasModel: boolean }>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return { ok: false, hasModel: false };
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    return { ok: true, hasModel: models.some((m) => m.name === MODEL) };
  } catch {
    return { ok: false, hasModel: false };
  }
}

/**
 * Envia mensagens ao Ollama e faz streaming da resposta.
 * @param {object} body corpo da requisição POST /api/chat
 * @param {object} handlers
 * @param {AbortSignal} handlers.signal
 * @param {(delta: string) => void} handlers.onContent
 * @param {() => void} handlers.onThinking
 */
export async function streamChat(body, { signal, onContent, onThinking }) {
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
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) handleLine(line, { onContent, onThinking });
    }
    handleLine(buffer, { onContent, onThinking });
  } catch (err) {
    if (err.name === 'AbortError') return; // abort = fim normal
    throw err;
  }
}

/** Processa uma linha NDJSON da resposta do Ollama. */
function handleLine(line, { onContent, onThinking }) {
  const trimmed = line.trim();
  if (!trimmed) return;
  let obj;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    return; // linha incompleta/inválida — ignora
  }
  const msg = obj.message;
  if (!msg) return;
  if (msg.content) onContent(msg.content);
  else if (msg.thinking) onThinking();
}
