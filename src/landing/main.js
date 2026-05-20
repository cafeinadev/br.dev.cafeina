import './landing.css';
import { initHeroMotion } from '../shared/brand-motion.js';

const digitalShowcase = [
  {
    src: '/brand/mockups/macbook-site-800.webp',
    alt: 'MacBook Pro exibindo a landing page da Cafeína Dev.',
    caption: 'Web',
    description: 'A própria landing rodando: tipografia firme, contraste alto, leitura em qualquer monitor.',
  },
  {
    src: '/brand/mockups/iphone-showcase-800.webp',
    alt: 'Marca Cafeína Dev em mockup de iPhone exibindo a landing page.',
    caption: 'Mobile',
    description: 'Layout responsivo: a mesma narrativa, calibrada para a leitura na palma da mão.',
  },
  {
    src: '/brand/mockups/ios-app-800.webp',
    alt: 'Ícone da Cafeína Dev em uma tela inicial de aplicativo iOS.',
    caption: 'App',
    description: 'Identidade que se sustenta como ícone: traço amarelo, fundo grafite, leitura imediata.',
  },
  {
    src: '/brand/mockups/subway-led-800.webp',
    alt: 'Marca Cafeína Dev aplicada em interface de TV.',
    caption: 'Android TV e tvOS',
    description: 'A identidade pronta para a tela grande: leitura nítida em apps de Android TV e tvOS.',
  },
];

const fisicoShowcase = [
  {
    src: '/brand/mockups/paper-card-800.webp',
    alt: 'Cartões de visita Cafeína Dev sobre superfície clara.',
    caption: 'Cartão',
    description: 'Tipografia firme, hierarquia limpa: o primeiro contato profissional cabe na mão.',
  },
  {
    src: '/brand/mockups/notebooks-800.webp',
    alt: 'Cadernos com capa estampada pela identidade da Cafeína Dev.',
    caption: 'Caderno',
    description: 'A marca como objeto de trabalho — capa que acompanha a rotina de quem cria.',
  },
  {
    src: '/brand/mockups/caneca-800.webp',
    alt: 'Caneca preta com a marca Cafeína Dev estampada em amarelo.',
    caption: 'Caneca',
    description: 'Cafeína literal: o ritual da xícara carregando o mesmo traço da assinatura.',
  },
  {
    src: '/brand/mockups/camisa-800.webp',
    alt: 'Camiseta preta com a marca Cafeína Dev estampada no peito.',
    caption: 'Vestuário',
    description: 'A identidade vestida — coerência do digital ao tecido, sem perder o tom.',
  },
];

const channels = [
  {
    eyebrow: 'Comunidade',
    label: 'Instagram',
    href: 'https://www.instagram.com/cafeina_dev/',
    description: 'Bastidores, leituras curtas e provocações sobre engenharia.',
    ariaLabel: 'Abrir Instagram da Cafeína Dev',
    cta: 'Seguir →',
  },
  {
    eyebrow: 'Engenharia aberta',
    label: 'GitHub',
    href: 'https://github.com/cafeinadesign',
    description: 'Código, padrões e referências que usamos no dia a dia.',
    ariaLabel: 'Abrir organização Cafeína no GitHub',
    cta: 'Explorar →',
  },
  {
    eyebrow: 'Ensaios',
    label: 'Medium',
    href: 'https://thiagoprazeres.medium.com/',
    description: 'Textos longos sobre arquitetura, liderança técnica e fluxo.',
    ariaLabel: 'Abrir Medium de Thiago Prazeres',
    cta: 'Ler →',
  },
  {
    eyebrow: 'Vídeo',
    label: 'YouTube',
    href: 'https://www.youtube.com/@cafeina_dev',
    description: 'Conversas e demos para aprofundar prática.',
    ariaLabel: 'Abrir YouTube da Cafeína Dev',
    cta: 'Assistir →',
  },
  {
    eyebrow: 'Rede',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/thbezerra/',
    description: 'Contato profissional, parcerias e propostas.',
    ariaLabel: 'Conectar com Thiago Bezerra no LinkedIn',
    cta: 'Conectar →',
  },
];

function renderShowcase(key, items) {
  const list = document.querySelector(`[data-showcase="${key}"]`);
  if (!list) return;
  list.innerHTML = items
    .map(
      (item) => `
      <li class="showcase__card card">
        <figure>
          <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
          <figcaption>
            <span class="showcase__caption">${item.caption}</span>
            <p>${item.description}</p>
          </figcaption>
        </figure>
      </li>`,
    )
    .join('');
}

function renderChannels() {
  const grid = document.querySelector('[data-channels]');
  if (!grid) return;
  grid.innerHTML = channels
    .map(
      (channel) => `
      <a
        class="channel card"
        href="${channel.href}"
        aria-label="${channel.ariaLabel}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="channel__eyebrow">${channel.eyebrow}</span>
        <strong>${channel.label}</strong>
        <p>${channel.description}</p>
        <span class="channel__cta" aria-hidden="true">${channel.cta}</span>
      </a>`,
    )
    .join('');
}

function renderFooterLinks() {
  const list = document.querySelector('[data-footer-links]');
  if (!list) return;
  list.innerHTML = channels
    .map(
      (channel) => `
      <li>
        <a href="${channel.href}" aria-label="${channel.ariaLabel}" target="_blank" rel="noopener noreferrer">
          ${channel.label}
        </a>
      </li>`,
    )
    .join('');
}

renderShowcase('digital', digitalShowcase);
renderShowcase('fisico', fisicoShowcase);
renderChannels();
renderFooterLinks();
initHeroMotion(document.querySelector('[data-hero-visual]'));
