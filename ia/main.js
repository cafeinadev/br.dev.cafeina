import './chat.css';
import { gsap } from 'gsap';
import { renderMarkdown } from './markdown.js';
import { PERSONAS, DEFAULT_PERSONA_ID } from './persona.js';
import { DEFAULT_MODEL, OllamaError, checkHealth, streamChat } from './ollama-client.js';

const STORAGE_KEY = 'cd-ia-conversa';
const STORAGE_VERSION = 1;
const CONFIG_KEY = 'cd-ia-config';

/** Níveis de esforço → parâmetro `think` da API do Ollama. */
const EFFORTS = [
  { id: 'direto', label: 'Direto', think: false },
  { id: 'equilibrado', label: 'Equilibrado', think: 'medium' },
  { id: 'profundo', label: 'Profundo', think: 'high' },
];
const DEFAULT_EFFORT_ID = 'equilibrado';

// ---- Referências do DOM ----
const log = document.querySelector('[data-log]');
const composer = document.querySelector('[data-composer]');
const input = document.querySelector('[data-input]');
const sendBtn = document.querySelector('[data-send]');
const stopBtn = document.querySelector('[data-stop]');
const newChatBtn = document.querySelector('[data-new-chat]');
const thinking = document.querySelector('[data-thinking]');
const thinkingRaio = document.querySelector('[data-thinking-raio]');
const statusDot = document.querySelector('[data-status-dot]');
const statusText = document.querySelector('[data-status-text]');
const toast = document.querySelector('[data-toast]');
const modelSelect = document.querySelector('[data-model]');
const personaSelect = document.querySelector('[data-persona]');
const effortSelect = document.querySelector('[data-effort]');

// ---- Estado ----
/**
 * @typedef {object} Message
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {{ evalCount: number, tokensPerSec: number|null }} [metrics]
 * @property {boolean} [interrupted]
 */

/** @type {Message[]} — conversa real (sem o system prompt). */
let messages = [];
let isStreaming = false;
/** @type {AbortController|null} */
let abortController = null;
/**
 * Identifica a sessão atual. "Nova conversa" incrementa este valor, o que
 * faz a finalização de um streaming órfão se descartar sozinha.
 */
let sessionId = 0;
let toastTimer = 0;

/** Escolhas dos seletores (modelo, persona, esforço). */
const config = {
  model: DEFAULT_MODEL,
  personaId: DEFAULT_PERSONA_ID,
  effortId: DEFAULT_EFFORT_ID,
};
/** Modelos instalados no Ollama (preenchido pelo health check). */
let availableModels = [DEFAULT_MODEL];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Associação estável <article> -> registro, para o botão "Copiar".
const recordByArticle = new WeakMap();

// ============================================================
// Indicador "pensando" — animação do raio com GSAP
// ============================================================
let thinkingTween = null;

function startThinking() {
  thinking.hidden = false;
  if (reduceMotion) return; // sem animação — só o texto estático
  if (!thinkingTween) {
    thinkingTween = gsap.to(thinkingRaio, {
      scale: 1.22,
      rotate: 8,
      opacity: 0.6,
      duration: 0.62,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: true,
      transformOrigin: '50% 50%',
    });
  }
  thinkingTween.play(0);
}

function stopThinking() {
  thinking.hidden = true;
  if (thinkingTween) {
    thinkingTween.pause();
    gsap.set(thinkingRaio, { scale: 1, rotate: 0, opacity: 1 });
  }
}

// ============================================================
// Renderização de mensagens
// ============================================================
function buildMessageEl(record) {
  const article = document.createElement('article');
  article.className = `chat__msg chat__msg--${record.role}`;

  const role = document.createElement('p');
  role.className = 'chat__msg-role';
  role.textContent = record.role === 'user' ? 'Você' : 'Cafeína Dev';
  article.append(role);

  const body = document.createElement('div');
  article.append(body);

  if (record.role === 'user') {
    body.className = 'chat__msg-body';
    body.textContent = record.content;
    return article;
  }

  // Assistente: corpo em markdown + rodapé (copiar + métricas).
  body.className = 'chat__msg-body chat__md';

  const foot = document.createElement('div');
  foot.className = 'chat__msg-foot';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'chat__copy';
  copyBtn.dataset.copyResponse = '';
  copyBtn.textContent = 'Copiar';

  const metrics = document.createElement('p');
  metrics.className = 'chat__metrics';

  foot.append(copyBtn, metrics);
  article.append(foot);

  recordByArticle.set(article, record);
  decorateAssistant(article, record);
  return article;
}

/** Renderiza o markdown e os anexos (nota de interrupção, métricas). */
function decorateAssistant(article, record) {
  const body = article.querySelector('.chat__msg-body');
  body.innerHTML = renderMarkdown(record.content);

  if (record.interrupted) {
    const note = document.createElement('p');
    note.className = 'chat__interrupted';
    note.textContent = '(resposta interrompida)';
    body.append(note);
  }

  if (record.metrics) {
    applyMetrics(article.querySelector('.chat__metrics'), record.metrics);
  }
}

function applyMetrics(el, metrics) {
  const parts = [`${metrics.evalCount} tokens`];
  if (metrics.tokensPerSec != null) {
    const rate = metrics.tokensPerSec.toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    });
    parts.push(`${rate} tokens/s`);
  }
  el.textContent = parts.join(' · ');
}

function renderEmptyState() {
  const el = document.createElement('div');
  el.className = 'chat__empty';
  el.dataset.empty = '';

  const title = document.createElement('p');
  title.className = 'chat__empty-title';
  title.textContent = 'Converse com o Gemma';

  const text = document.createElement('p');
  text.className = 'chat__empty-text';
  text.textContent =
    'Pergunte sobre arquitetura, código ou processo de engenharia. Tudo roda localmente, via Ollama.';

  el.append(title, text);
  log.append(el);
}

function removeEmptyState() {
  log.querySelector('[data-empty]')?.remove();
}

function renderError(message) {
  const el = document.createElement('p');
  el.className = 'chat__error';
  el.setAttribute('role', 'alert');
  el.textContent = message;
  log.append(el);
  scrollToBottom();
}

// ============================================================
// Rolagem do log
// ============================================================
function isNearBottom() {
  return log.scrollHeight - log.scrollTop - log.clientHeight < 80;
}

function scrollToBottom() {
  log.scrollTop = log.scrollHeight;
}

// ============================================================
// Envio e streaming
// ============================================================
async function send(text) {
  if (isStreaming) return;
  const content = text.trim();
  if (!content) return;

  const mySession = sessionId;

  // Mensagem do usuário.
  const userRecord = { role: 'user', content };
  messages.push(userRecord);
  removeEmptyState();
  log.append(buildMessageEl(userRecord));

  // Monta o payload ANTES de inserir o placeholder do assistente.
  const persona = PERSONAS.find((p) => p.id === config.personaId) ?? PERSONAS[0];
  const effort = EFFORTS.find((e) => e.id === config.effortId) ?? EFFORTS[1];
  const payload = {
    model: config.model,
    stream: true,
    think: effort.think,
    messages: [
      { role: 'system', content: persona.prompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };
  persist();

  // Placeholder do assistente — o <article> só nasce no 1º conteúdo.
  const assistantRecord = { role: 'assistant', content: '' };
  messages.push(assistantRecord);

  input.value = '';
  autoGrow();
  setStreaming(true);
  startThinking();
  scrollToBottom();

  abortController = new AbortController();
  let article = null;
  let body = null;
  let renderScheduled = false;

  const flush = () => {
    renderScheduled = false;
    if (!body) return;
    const stick = isNearBottom();
    body.innerHTML = renderMarkdown(assistantRecord.content);
    if (stick) scrollToBottom();
  };

  let streamError = null;
  try {
    await streamChat(payload, {
      signal: abortController.signal,
      onContent: (delta) => {
        assistantRecord.content += delta;
        if (!article) {
          // 1º trecho de resposta: troca o indicador pela bolha.
          stopThinking();
          article = buildMessageEl(assistantRecord);
          body = article.querySelector('.chat__msg-body');
          log.append(article);
        }
        if (!renderScheduled) {
          renderScheduled = true;
          requestAnimationFrame(flush);
        }
      },
      onThinking: () => {
        // Mantém o indicador enquanto só houver raciocínio.
      },
      onDone: (stats) => {
        assistantRecord.metrics = stats;
      },
    });
  } catch (err) {
    streamError = err;
  }

  // "Nova conversa" durante o stream — descarta esta finalização.
  if (mySession !== sessionId) return;

  const aborted = abortController.signal.aborted;
  abortController = null;
  setStreaming(false);
  stopThinking();

  if (assistantRecord.content) {
    if (aborted || streamError) assistantRecord.interrupted = true;
    decorateAssistant(article, assistantRecord);
  } else {
    // Placeholder vazio — descarta do histórico.
    messages.pop();
  }

  if (streamError) {
    renderError(describeError(streamError));
    refreshStatus();
  } else if (!assistantRecord.content && !aborted) {
    renderError('O modelo não retornou resposta. Tente reformular a pergunta.');
  } else {
    setStatus('ok', 'Conectado ao Ollama');
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
    if (err.kind === 'model-missing') {
      return `O modelo ${config.model} não está instalado. Rode "ollama pull ${config.model}" no terminal.`;
    }
    return err.message;
  }
  return 'Algo deu errado ao gerar a resposta. Tente novamente.';
}

function setStreaming(on) {
  isStreaming = on;
  input.disabled = on;
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
  setStreaming(false);
  stopThinking();
  log.replaceChildren();
  renderEmptyState();
  clearStorage();
  input.value = '';
  autoGrow();
  input.focus();
}

// ============================================================
// Persistência (uma conversa no localStorage)
// ============================================================
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, messages }));
  } catch {
    /* localStorage indisponível — segue sem persistir */
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage indisponível — ignora */
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

  if (messages.length === 0) {
    renderEmptyState();
    return;
  }
  for (const record of messages) {
    log.append(buildMessageEl(record));
  }
  scrollToBottom();
}

// ============================================================
// Copiar resposta + toast
// ============================================================
function onLogClick(event) {
  const btn = event.target.closest('[data-copy-response]');
  if (!btn) return;
  const article = btn.closest('.chat__msg');
  const record = article && recordByArticle.get(article);
  if (record) copyResponse(record.content);
}

async function copyResponse(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Resposta copiada');
  } catch {
    showToast('Não foi possível copiar');
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 1600);
}

// ============================================================
// Status do Ollama
// ============================================================
function setStatus(state, text) {
  statusDot.dataset.state = state;
  statusText.textContent = text;
}

async function refreshStatus() {
  setStatus('checking', 'Conectando ao Ollama…');
  const health = await checkHealth();
  setupModels(health.models);
  if (!health.ok) {
    setStatus('error', 'Ollama indisponível');
  } else if (!availableModels.includes(config.model)) {
    setStatus('error', `Modelo ${config.model} ausente`);
  } else {
    setStatus('ok', 'Conectado ao Ollama');
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
// Seletores: modelo, persona e esforço
// ============================================================
function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.model === 'string') config.model = saved.model;
    if (PERSONAS.some((p) => p.id === saved.personaId)) {
      config.personaId = saved.personaId;
    }
    if (EFFORTS.some((e) => e.id === saved.effortId)) {
      config.effortId = saved.effortId;
    }
  } catch {
    /* localStorage indisponível — usa os padrões */
  }
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* localStorage indisponível — ignora */
  }
}

function fillSelect(select, options, selected) {
  select.replaceChildren();
  for (const opt of options) {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    if (opt.value === selected) el.selected = true;
    select.append(el);
  }
}

function setupModels(models) {
  availableModels = models.length > 0 ? models : [DEFAULT_MODEL];
  if (!availableModels.includes(config.model)) {
    config.model = availableModels[0];
    saveConfig();
  }
  fillSelect(
    modelSelect,
    availableModels.map((m) => ({ value: m, label: m })),
    config.model,
  );
}

// ============================================================
// Eventos e inicialização
// ============================================================
composer.addEventListener('submit', (event) => {
  event.preventDefault();
  send(input.value);
});

input.addEventListener('input', autoGrow);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send(input.value);
  }
});

stopBtn.addEventListener('click', stop);
newChatBtn.addEventListener('click', newChat);
log.addEventListener('click', onLogClick);

modelSelect.addEventListener('change', () => {
  config.model = modelSelect.value;
  saveConfig();
});
personaSelect.addEventListener('change', () => {
  config.personaId = personaSelect.value;
  saveConfig();
});
effortSelect.addEventListener('change', () => {
  config.effortId = effortSelect.value;
  saveConfig();
});

loadConfig();
fillSelect(
  personaSelect,
  PERSONAS.map((p) => ({ value: p.id, label: p.label })),
  config.personaId,
);
fillSelect(
  effortSelect,
  EFFORTS.map((e) => ({ value: e.id, label: e.label })),
  config.effortId,
);
fillSelect(modelSelect, [{ value: config.model, label: config.model }], config.model);
restore();
refreshStatus();
autoGrow();
input.focus();
