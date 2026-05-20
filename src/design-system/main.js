import './design-system.css';
import { initHeroMotion } from '../shared/brand-motion.js';

/* ============ Dados ============ */
const principles = [
  { title: 'Impulso', copy: 'Formas angulares e contraste alto traduzem energia e capacidade de execução.' },
  { title: 'Clareza', copy: 'Hierarquia objetiva, espaço negativo generoso e tipografia direta.' },
  { title: 'Conexão', copy: 'O símbolo nasce da ideia de fluxo — peças que se encaixam sem ruído.' },
];

const brandColors = [
  { name: 'Amarelo Energia', token: '--cd-color-brand-energy', hex: '#fdda0d', rgb: 'rgb(253, 218, 7)', cmyk: 'C0 M13 Y94 K70', darkText: true },
  { name: 'Grafite', token: '--cd-color-brand-graphite', hex: '#333530', rgb: 'rgb(51, 53, 48)', cmyk: 'C3 M0 Y9 K79', darkText: false },
  { name: 'Branco', token: '--cd-color-neutral-white', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', cmyk: 'C0 M0 Y0 K0', darkText: true },
  { name: 'Preto', token: '--cd-color-neutral-black', hex: '#000000', rgb: 'rgb(0, 0, 0)', cmyk: 'C0 M0 Y0 K100', darkText: false },
];

const surfaceColors = [
  { name: 'Superfície suave', token: '--cd-color-surface-muted', value: '#f7f7f2' },
  { name: 'Superfície elevada', token: '--cd-color-surface-elevated-dark', value: '#1f211d' },
  { name: 'Superfície elevada · hover', token: '--cd-color-surface-elevated-dark-hover', value: '#272a25' },
  { name: 'Borda padrão', token: '--cd-color-border-default', value: '#d8d9d2' },
  { name: 'Primário · hover', token: '--cd-color-button-primary-hover', value: '#ebc900' },
];

const typeScale = [
  { role: 'Display', weight: 'UltraBold 800', size: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: '1.05', usage: 'Aberturas de hero e títulos de impacto.', cls: 'sample sample--display' },
  { role: 'Título 1', weight: 'UltraBold 800', size: '2.5rem', lineHeight: '1.1', usage: 'Título principal de página.', cls: 'sample sample--h1' },
  { role: 'Título 2', weight: 'UltraBold 800', size: '1.75rem', lineHeight: '1.2', usage: 'Cabeçalho de seção.', cls: 'sample sample--h2' },
  { role: 'Título 3', weight: 'SemiBold 600', size: '1.25rem', lineHeight: '1.3', usage: 'Subtítulos e títulos de card.', cls: 'sample sample--h3' },
  { role: 'Corpo grande', weight: 'Regular 400', size: '1.125rem', lineHeight: '1.6', usage: 'Introduções e parágrafos de destaque.', cls: 'sample sample--lead' },
  { role: 'Corpo', weight: 'Regular 400', size: '1rem', lineHeight: '1.62', usage: 'Texto corrido padrão.', cls: 'sample sample--body' },
  { role: 'Legenda', weight: 'SemiBold 600', size: '0.8125rem', lineHeight: '1.45', usage: 'Eyebrows e metadados, em caixa alta.', cls: 'sample sample--caption' },
];

const horizontalLogos = [
  { name: 'Principal', note: 'Aplicação preferencial, sobre fundos claros.', file: 'horizontal-principal', background: 'light' },
  { name: 'Branco', note: 'Fundos escuros, grafite ou preto.', file: 'horizontal-branco', background: 'dark' },
  { name: 'Amarelo', note: 'Monocromática de destaque sobre fundo escuro.', file: 'horizontal-amarelo', background: 'dark' },
  { name: 'Preto', note: 'Monocromática para fundos claros e impressão P&B.', file: 'horizontal-preto', background: 'light' },
];

const verticalLogos = [
  { name: 'Principal', note: 'Formatos quadrados e composições centralizadas.', file: 'vertical-principal', background: 'light' },
  { name: 'Branco', note: 'Fundos escuros, grafite ou preto.', file: 'vertical-branco', background: 'dark' },
  { name: 'Amarelo', note: 'Monocromática de destaque sobre fundo escuro.', file: 'vertical-amarelo', background: 'dark' },
  { name: 'Preto', note: 'Monocromática para fundos claros.', file: 'vertical-preto', background: 'light' },
];

const symbolLogos = [
  { name: 'Símbolo amarelo', note: 'Favicon, avatares e selos sobre fundo escuro.', file: 'simbolo-amarelo', background: 'dark' },
  { name: 'Símbolo branco', note: 'Fundos escuros de alto contraste.', file: 'simbolo-branco', background: 'dark' },
  { name: 'Símbolo preto', note: 'Fundos claros e impressão P&B.', file: 'simbolo-preto', background: 'light' },
];

const logoDonts = [
  { title: 'Não aplique sobre fundos coloridos', copy: 'Fundos saturados reduzem o contraste. Use a versão negativa.' },
  { title: 'Não recomponha os elementos', copy: 'Símbolo e logotipo não devem ser redimensionados ou reposicionados isoladamente.' },
  { title: 'Não reduza abaixo do mínimo', copy: 'A marca não deve ter menos de 20 mm de altura em materiais gráficos.' },
  { title: 'Respeite a área de proteção', copy: 'Nenhum elemento deve invadir a margem de 2x ao redor da marca.' },
];

const spacingScale = [
  { token: '--cd-space-4', rem: '0.25rem', px: 4 },
  { token: '--cd-space-8', rem: '0.5rem', px: 8 },
  { token: '--cd-space-12', rem: '0.75rem', px: 12 },
  { token: '--cd-space-16', rem: '1rem', px: 16 },
  { token: '--cd-space-24', rem: '1.5rem', px: 24 },
  { token: '--cd-space-32', rem: '2rem', px: 32 },
  { token: '--cd-space-48', rem: '3rem', px: 48 },
  { token: '--cd-space-64', rem: '4rem', px: 64 },
  { token: '--cd-space-96', rem: '6rem', px: 96 },
];

const radiusScale = [
  { token: '--cd-radius-sm', rem: '0.25rem' },
  { token: '--cd-radius-md', rem: '0.5rem' },
  { token: '--cd-radius-pill', rem: '999px' },
];

const mockups = [
  { name: 'Web', note: 'A landing rodando em desktop.', src: '/brand/mockups/macbook-site-1600.webp' },
  { name: 'Mobile', note: 'Layout responsivo na palma da mão.', src: '/brand/mockups/iphone-showcase-1600.webp' },
  { name: 'App', note: 'O símbolo como ícone de aplicativo iOS.', src: '/brand/mockups/ios-app-1600.webp' },
  { name: 'Grande formato', note: 'A marca em painel LED de ambiente urbano.', src: '/brand/mockups/subway-led-1600.webp' },
  { name: 'Cartão', note: 'Papelaria — cartão de visita.', src: '/brand/mockups/paper-card-1600.webp' },
  { name: 'Caderno', note: 'Capa de caderno institucional.', src: '/brand/mockups/notebooks-1600.webp' },
  { name: 'Caneca', note: 'Brinde — caneca da marca.', src: '/brand/mockups/caneca-1600.webp' },
  { name: 'Vestuário', note: 'Camiseta com a marca aplicada.', src: '/brand/mockups/camisa-1600.webp' },
];

const pecas = [
  { name: 'Banner — Facebook', note: 'Capa para a página no Facebook.', src: '/brand/pecas/banner-facebook.jpg' },
  { name: 'Banner — YouTube', note: 'Arte de canal do YouTube.', src: '/brand/pecas/banner-youtube.jpg' },
];

/* ============ Render ============ */
const $ = (sel) => document.querySelector(sel);

function setHtml(sel, html) {
  const el = $(sel);
  if (el) el.innerHTML = html;
}

setHtml(
  '[data-principles]',
  principles
    .map((p) => `<article class="ds__card"><h3>${p.title}</h3><p>${p.copy}</p></article>`)
    .join(''),
);

setHtml(
  '[data-brand-colors]',
  brandColors
    .map(
      (c) => `
      <article class="ds__swatch">
        <div class="ds__swatch-chip" style="background:${c.hex};color:${c.darkText ? '#000' : '#fff'}">
          <span>Aa</span>
        </div>
        <div class="ds__swatch-body">
          <h4>${c.name}</h4>
          <button type="button" class="ds__token" data-copy="${c.token}"><code>${c.token}</code></button>
          <dl class="ds__swatch-values">
            <div><dt>HEX</dt><dd><button type="button" data-copy="${c.hex}">${c.hex}</button></dd></div>
            <div><dt>RGB</dt><dd><button type="button" data-copy="${c.rgb}">${c.rgb}</button></dd></div>
            <div><dt>CMYK</dt><dd><span>${c.cmyk}</span></dd></div>
          </dl>
        </div>
      </article>`,
    )
    .join(''),
);

setHtml(
  '[data-surface-colors]',
  surfaceColors
    .map(
      (c) => `
      <li>
        <span class="ds__token-dot" style="background:${c.value}" aria-hidden="true"></span>
        <span class="ds__token-name">${c.name}</span>
        <button type="button" class="ds__token" data-copy="${c.token}"><code>${c.token}</code></button>
        <button type="button" class="ds__token-value" data-copy="${c.value}">${c.value}</button>
      </li>`,
    )
    .join(''),
);

setHtml(
  '[data-type-scale]',
  typeScale
    .map(
      (t) => `
      <article class="ds__type-row">
        <p class="${t.cls}">${t.role}</p>
        <dl class="ds__type-meta">
          <div><dt>Peso</dt><dd>${t.weight}</dd></div>
          <div><dt>Tamanho</dt><dd>${t.size}</dd></div>
          <div><dt>Entrelinha</dt><dd>${t.lineHeight}</dd></div>
          <div><dt>Uso</dt><dd>${t.usage}</dd></div>
        </dl>
      </article>`,
    )
    .join(''),
);

function logoCard(logo, kind) {
  const preview =
    kind === 'vertical'
      ? 'ds__logo-preview ds__logo-preview--tall'
      : kind === 'symbol'
        ? 'ds__logo-preview ds__logo-preview--square'
        : 'ds__logo-preview';
  const label =
    kind === 'symbol'
      ? `Símbolo Cafeína Dev — ${logo.name}`
      : `Logo ${kind} Cafeína Dev — ${logo.name}`;
  return `
    <article class="ds__logo-card">
      <div class="${preview}" data-bg="${logo.background}">
        <img src="/brand/logos/${logo.file}.svg" alt="${label}" loading="lazy" />
      </div>
      <div class="ds__logo-info">
        <h4>${logo.name}</h4>
        <p>${logo.note}</p>
        <div class="ds__logo-actions">
          <a href="/brand/logos/${logo.file}.svg" download="${logo.file}.svg">SVG</a>
          <a href="/brand/logos/${logo.file}.png" download="${logo.file}.png">PNG</a>
        </div>
      </div>
    </article>`;
}

setHtml('[data-logos="horizontal"]', horizontalLogos.map((l) => logoCard(l, 'horizontal')).join(''));
setHtml('[data-logos="vertical"]', verticalLogos.map((l) => logoCard(l, 'vertical')).join(''));
setHtml('[data-logos="symbol"]', symbolLogos.map((l) => logoCard(l, 'symbol')).join(''));

setHtml(
  '[data-donts]',
  logoDonts
    .map(
      (d) => `
      <li class="ds__dont">
        <span class="ds__dont-mark" aria-hidden="true">✕</span>
        <div><h4>${d.title}</h4><p>${d.copy}</p></div>
      </li>`,
    )
    .join(''),
);

setHtml(
  '[data-spacing]',
  spacingScale
    .map(
      (s) => `
      <li>
        <span class="ds__scale-bar" style="width:${s.px}px" aria-hidden="true"></span>
        <button type="button" class="ds__token" data-copy="${s.token}"><code>${s.token}</code></button>
        <span class="ds__scale-value">${s.rem} · ${s.px}px</span>
      </li>`,
    )
    .join(''),
);

setHtml(
  '[data-radius]',
  radiusScale
    .map(
      (r) => `
      <li>
        <span class="ds__radius-demo" style="border-radius:${r.rem}" aria-hidden="true"></span>
        <button type="button" class="ds__token" data-copy="${r.token}"><code>${r.token}</code></button>
        <span class="ds__scale-value">${r.rem}</span>
      </li>`,
    )
    .join(''),
);

function shotCard(shot) {
  return `
    <li class="ds__shot">
      <img src="${shot.src}" alt="${shot.name}" loading="lazy" />
      <div class="ds__shot-info"><h4>${shot.name}</h4><p>${shot.note}</p></div>
    </li>`;
}

setHtml('[data-mockups]', mockups.map(shotCard).join(''));
setHtml('[data-pecas]', pecas.map(shotCard).join(''));

/* ============ Copiar para a área de transferência ============ */
const toast = $('[data-toast]');
let toastTimer;

document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('[data-copy]');
  if (!trigger) return;
  const value = trigger.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
    if (!toast) return;
    toast.textContent = `Copiado: ${value}`;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  } catch {
    /* clipboard indisponível — ignora */
  }
});

/* ============ Scrollspy da navegação lateral ============ */
const navLinks = new Map();
document.querySelectorAll('.ds__nav a').forEach((link) => {
  navLinks.set(link.getAttribute('href').slice(1), link);
});

const sections = document.querySelectorAll('section[id]');
if (sections.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link, id) => {
          if (id === entry.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

/* ============ Animação de marca ============ */
initHeroMotion($('[data-hero-visual]'));

/* ============ Drawer da sidebar ============ */
const sidebar = $('[data-sidebar]');
const drawerToggle = $('[data-drawer-toggle]');
const drawerScrim = $('[data-drawer-scrim]');
const narrowQuery = window.matchMedia('(max-width: 960px)');
const DRAWER_KEY = 'cd-ds-drawer';

function isDrawerOpen() {
  return sidebar?.classList.contains('is-drawer-open') ?? false;
}

function applyDrawer(open) {
  if (!sidebar) return;
  sidebar.classList.toggle('is-drawer-open', open);
  sidebar.classList.toggle('is-drawer-close', !open);
  if (drawerToggle) {
    drawerToggle.setAttribute('aria-expanded', String(open));
    drawerToggle.setAttribute('aria-label', open ? 'Recolher menu' : 'Expandir menu');
  }
  if (drawerScrim) {
    drawerScrim.hidden = !(open && narrowQuery.matches);
  }
}

function persistDrawer(open) {
  try {
    localStorage.setItem(DRAWER_KEY, open ? 'open' : 'close');
  } catch {
    /* localStorage indisponível — ignora */
  }
}

let storedDrawer = null;
try {
  storedDrawer = localStorage.getItem(DRAWER_KEY);
} catch {
  /* ignora */
}

// Padrão: aberto em telas largas, recolhido em telas estreitas.
applyDrawer(storedDrawer === null ? !narrowQuery.matches : storedDrawer === 'open');

drawerToggle?.addEventListener('click', () => {
  const open = !isDrawerOpen();
  applyDrawer(open);
  persistDrawer(open);
});

drawerScrim?.addEventListener('click', () => {
  applyDrawer(false);
  persistDrawer(false);
});

// Em telas estreitas, navegar fecha o drawer.
document.querySelectorAll('.ds__nav a').forEach((link) => {
  link.addEventListener('click', () => {
    if (narrowQuery.matches) {
      applyDrawer(false);
      persistDrawer(false);
    }
  });
});

narrowQuery.addEventListener('change', () => applyDrawer(isDrawerOpen()));
