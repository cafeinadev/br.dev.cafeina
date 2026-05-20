# Cafeína Dev — site

Site da Cafeína Dev: duas páginas estáticas construídas com **Vite + JavaScript vanilla**
(sem framework, sem TypeScript).

## Estrutura

- `src/landing/` — a landing (`cafeina.dev.br`): `index.html`, `main.js`, `landing.css`
- `src/design-system/` — o design system (`design-system.cafeina.dev.br`)
- `src/shared/` — código compartilhado: `tokens.css` (cores, tipografia, reset) e `brand-motion.js`
- `public/` — assets estáticos servidos na raiz (`/brand/...`)
- `vite.config.js` — uma config, dois apps via env `APP` (`landing` | `design-system`)

## Comandos

- `npm run dev` — landing em http://localhost:4200
- `npm run dev:design-system` — design system em http://localhost:4300
- `npm run build` — build da landing → `dist/landing`
- `npm run build:design-system` — build do design system → `dist/design-system`

## Convenções

- **Vanilla JS** (ESM). Sem framework, sem TypeScript, sem build de componentes.
- CSS com custom properties: use os tokens `--cd-*` de `src/shared/tokens.css`. Não
  hard-code cores/espaçamentos da marca.
- Cores da marca: Amarelo Energia `#fdda0d`, Grafite `#333530`. Fonte: Friends.
- HTML semântico e acessível: passa AXE, WCAG AA (foco visível, contraste, ARIA).
- Animação com GSAP; sempre respeitar `prefers-reduced-motion`.
- Conteúdo repetitivo é renderizado em `main.js` a partir de arrays de dados.

## Deploy

Netlify, dois sites a partir deste repo: `cafeinadev` (landing) e `cafeina-design-system`.
Cada push em `main` dispara deploy automático.
