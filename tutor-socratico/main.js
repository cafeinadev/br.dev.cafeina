import './tutor.css';
import { renderMarkdown } from './markdown.js';
import { SYSTEM_PROMPT } from './persona.js';
import { MODEL, OllamaError, checkHealth, streamChat } from './ollama-client.js';
import { init as initPyodide, run as runPython } from './pyodide-runner.js';
import { extractDirective, stripDirectives, formatToolResult } from './tool-loop.js';

const STORAGE_KEY = 'ts-tutor-conversa';
const STORAGE_VERSION = 1;
// Teto de chamadas Python por turno — evita um loop de ferramenta infinito.
const MAX_ITERATIONS = 5;

// ---- DOM ----
const log = document.querySelector('[data-log]');
const composer = document.querySelector('[data-composer]');
const input = document.querySelector('[data-input]');
const sendBtn = document.querySelector('[data-send]');
const stopBtn = document.querySelector('[data-stop]');
const newChatBtn = document.querySelector('[data-new-chat]');
const indicator = document.querySelector('[data-indicator]');
const indicatorText = document.querySelector('[data-indicator-text]');
const statusDot = document.querySelector('[data-status-dot]');
const statusText = document.querySelector('[data-status-text]');
const bootEl = document.querySelector('[data-boot]');
const bootText = document.querySelector('[data-boot-text]');

// ---- Estado ----
/** @typedef {{ role:'user'|'assistant', content:string, plots?:string[] }} Message */

/** @type {Message[]} — histórico visível ao aluno (persiste no localStorage). */
let messages = [];
/**
 * Histórico real enviado ao Ollama: inclui o system prompt, as diretivas cruas
 * e os resultados do Python. Nunca é renderizado.
 * @type {{ role:string, content:string }[]}
 */
let apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }];

let isBusy = false;
/** @type {AbortController|null} */
let abortController = null;
/** "Nova conversa" incrementa — descarta a finalização de um turno órfão. */
let sessionId = 0;
let pyodideReady = false;

// ============================================================
// Renderização de mensagens
// ============================================================
function buildUserBubble(text) {
  const article = document.createElement('article');
  article.className = 'tutor__msg tutor__msg--user';

  const role = document.createElement('p');
  role.className = 'tutor__msg-role';
  role.textContent = 'Você';

  const body = document.createElement('div');
  body.className = 'tutor__msg-body';
  body.textContent = text;

  article.append(role, body);
  return article;
}

/**
 * Bolha do tutor. Cresce ao longo do turno: a prosa entra em segmentos
 * `.tutor__prose` e os gráficos como `<img>` — assim um re-render de prosa
 * nunca apaga um gráfico já inserido.
 */
function buildAssistantBubble() {
  const article = document.createElement('article');
  article.className = 'tutor__msg tutor__msg--tutor';

  const role = document.createElement('p');
  role.className = 'tutor__msg-role';
  role.textContent = 'Tutor';

  const body = document.createElement('div');
  body.className = 'tutor__msg-body';

  article.append(role, body);

  return {
    article,
    addProse() {
      const prose = document.createElement('div');
      prose.className = 'tutor__prose';
      body.append(prose);
      return prose;
    },
    addPlot(dataUrl) {
      // <img> inserida por código (não via markdown) — o data: URL é confiável
      // e a prosa do modelo nunca consegue injetar uma imagem arbitrária.
      const img = document.createElement('img');
      img.className = 'tutor__plot';
      img.src = dataUrl;
      img.alt = 'Gráfico desenhado pelo tutor';
      body.append(img);
    },
    markInterrupted() {
      const note = document.createElement('p');
      note.className = 'tutor__interrupted';
      note.textContent = '(resposta interrompida)';
      body.append(note);
    },
  };
}

function buildRestoredAssistant(message) {
  const bubble = buildAssistantBubble();
  if (message.content) {
    bubble.addProse().innerHTML = renderMarkdown(message.content);
  }
  for (const dataUrl of message.plots ?? []) bubble.addPlot(dataUrl);
  return bubble.article;
}

function renderEmptyState() {
  const el = document.createElement('div');
  el.className = 'tutor__empty';
  el.dataset.empty = '';

  const title = document.createElement('p');
  title.className = 'tutor__empty-title';
  title.textContent = 'Vamos praticar matemática?';

  const text = document.createElement('p');
  text.className = 'tutor__empty-text';
  text.textContent =
    'Conte um problema que você quer resolver — ou mostre o que já tentou. Eu não vou te dar a resposta pronta: vou te ajudar a chegar nela.';

  el.append(title, text);
  log.append(el);
}

function removeEmptyState() {
  log.querySelector('[data-empty]')?.remove();
}

function renderError(message) {
  const el = document.createElement('p');
  el.className = 'tutor__error';
  el.setAttribute('role', 'alert');
  el.textContent = message;
  log.append(el);
  scrollToBottom();
}

// ============================================================
// Rolagem e indicador
// ============================================================
function isNearBottom() {
  return log.scrollHeight - log.scrollTop - log.clientHeight < 100;
}

function scrollToBottom() {
  log.scrollTop = log.scrollHeight;
}

function showIndicator(text) {
  indicatorText.textContent = text;
  indicator.hidden = false;
}

function hideIndicator() {
  indicator.hidden = true;
}

// ============================================================
// O turno — diálogo + loop de ferramenta oculto
// ============================================================
async function runTutorTurn(rawText) {
  if (isBusy || !pyodideReady) return;
  const userText = rawText.trim();
  if (!userText) return;

  const mySession = sessionId;

  // Mensagem do aluno.
  messages.push({ role: 'user', content: userText });
  apiMessages.push({ role: 'user', content: userText });
  removeEmptyState();
  log.append(buildUserBubble(userText));
  input.value = '';
  autoGrow();
  persist();

  setBusy(true);
  abortController = new AbortController();
  scrollToBottom();

  const assistantMsg = { role: 'assistant', content: '', plots: [] };
  let bubble = null;
  const ensureBubble = () => {
    if (!bubble) {
      bubble = buildAssistantBubble();
      log.append(bubble.article);
    }
    return bubble;
  };

  let visibleProse = '';
  let aborted = false;
  let turnError = null;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i += 1) {
      showIndicator('Pensando…');

      let turnBuffer = '';
      let proseEl = null;
      let scheduled = false;
      const flush = () => {
        scheduled = false;
        const clean = stripDirectives(turnBuffer);
        if (!clean.trim()) return;
        if (!proseEl) {
          proseEl = ensureBubble().addProse();
          hideIndicator();
        }
        const stick = isNearBottom();
        proseEl.innerHTML = renderMarkdown(clean);
        if (stick) scrollToBottom();
      };

      await streamChat(
        { model: MODEL, stream: true, think: true, messages: apiMessages },
        {
          signal: abortController.signal,
          onContent: (delta) => {
            turnBuffer += delta;
            if (!scheduled) {
              scheduled = true;
              requestAnimationFrame(flush);
            }
          },
          onThinking: () => {
            /* o raciocínio do R1 é privado — nunca exibido */
          },
        },
      );

      if (mySession !== sessionId) return; // "Nova conversa" no meio do turno
      aborted = abortController.signal.aborted;

      apiMessages.push({ role: 'assistant', content: turnBuffer });

      const cleanTurn = stripDirectives(turnBuffer).trim();
      if (cleanTurn) {
        if (!proseEl) proseEl = ensureBubble().addProse();
        proseEl.innerHTML = renderMarkdown(cleanTurn);
        visibleProse += (visibleProse ? '\n\n' : '') + cleanTurn;
      }

      const directive = aborted ? null : extractDirective(turnBuffer);
      if (!directive) break;

      // Há diretiva → executa o Python sem o aluno ver.
      showIndicator(directive.kind === 'plot' ? 'Desenhando o gráfico…' : 'Conferindo as contas…');
      const result = await runPython(directive);
      if (mySession !== sessionId) return;
      if (abortController.signal.aborted) {
        aborted = true;
        break;
      }

      if (result.kind === 'image') {
        assistantMsg.plots.push(result.dataUrl);
        ensureBubble().addPlot(result.dataUrl);
        scrollToBottom();
      }
      apiMessages.push({ role: 'user', content: formatToolResult(result) });
    }
  } catch (err) {
    turnError = err;
  }

  if (mySession !== sessionId) return;

  abortController = null;
  hideIndicator();
  setBusy(false);

  if (aborted && bubble) bubble.markInterrupted();
  if (turnError) {
    renderError(describeError(turnError));
    refreshStatus();
  } else if (!visibleProse && assistantMsg.plots.length === 0 && !aborted) {
    renderError('O tutor não conseguiu responder agora. Tente reformular a pergunta.');
  }

  assistantMsg.content = visibleProse;
  if (visibleProse || assistantMsg.plots.length > 0) {
    messages.push(assistantMsg);
  }
  persist();
  if (isNearBottom()) scrollToBottom();
  input.focus();
}

function describeError(err) {
  if (err instanceof OllamaError) {
    if (err.kind === 'unreachable') {
      return 'Não consegui falar com o Ollama. Confirme que ele está rodando e tente de novo.';
    }
    return err.message;
  }
  return 'Algo deu errado ao gerar a resposta. Tente novamente.';
}

// ============================================================
// Controles de turno
// ============================================================
function setBusy(on) {
  isBusy = on;
  input.disabled = on || !pyodideReady;
  sendBtn.disabled = on || !pyodideReady;
  sendBtn.hidden = on;
  stopBtn.hidden = !on;
  log.setAttribute('aria-busy', String(on));
}

function stop() {
  abortController?.abort();
}

function newChat() {
  sessionId += 1;
  abortController?.abort();
  abortController = null;
  messages = [];
  apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
  setBusy(false);
  hideIndicator();
  log.replaceChildren();
  renderEmptyState();
  clearStorage();
  input.value = '';
  autoGrow();
  if (pyodideReady) input.focus();
}

// ============================================================
// Persistência (uma conversa no localStorage)
// ============================================================
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, messages }));
  } catch {
    /* localStorage indisponível ou cheio — segue sem persistir */
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignora */
  }
}

function restore() {
  let data = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (data && data.v === STORAGE_VERSION && Array.isArray(data.messages)) {
    messages = data.messages.filter(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    );
  }

  apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const m of messages) {
    apiMessages.push({ role: m.role, content: m.content });
  }

  if (messages.length === 0) {
    renderEmptyState();
    return;
  }
  for (const m of messages) {
    log.append(m.role === 'user' ? buildUserBubble(m.content) : buildRestoredAssistant(m));
  }
  scrollToBottom();
}

// ============================================================
// Status do Ollama
// ============================================================
function setStatus(state, text) {
  statusDot.dataset.state = state;
  statusText.textContent = text;
}

async function refreshStatus() {
  setStatus('checking', 'Conectando…');
  const health = await checkHealth();
  if (!health.ok) {
    setStatus('error', 'Ollama indisponível');
  } else if (!health.hasModel) {
    setStatus('error', `Falta o modelo ${MODEL}`);
  } else {
    setStatus('ok', 'Tutor pronto');
  }
}

// ============================================================
// Composer
// ============================================================
function autoGrow() {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

// ============================================================
// Inicialização
// ============================================================
async function startApp() {
  restore();
  autoGrow();
  refreshStatus(); // checa o Ollama em paralelo ao carregamento do Pyodide

  const phases = {
    runtime: 'Carregando o ambiente de cálculo…',
    packages: 'Instalando as ferramentas de matemática (SymPy, gráficos)…',
    bootstrap: 'Quase pronto…',
    ready: 'Tudo pronto!',
  };

  try {
    await initPyodide((phase) => {
      bootText.textContent = phases[phase] ?? bootText.textContent;
    });
    pyodideReady = true;
    bootEl.hidden = true;
    setBusy(false); // habilita o composer agora que o motor está pronto
    input.focus();
  } catch {
    bootEl.dataset.state = 'error';
    const title = bootEl.querySelector('.tutor__boot-title');
    if (title) title.textContent = 'Ops…';
    bootText.textContent =
      'Não consegui preparar o ambiente de cálculo. Recarregue a página para tentar de novo.';
  }
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  runTutorTurn(input.value);
});

input.addEventListener('input', autoGrow);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    runTutorTurn(input.value);
  }
});

stopBtn.addEventListener('click', stop);
newChatBtn.addEventListener('click', newChat);

startApp();
