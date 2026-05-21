# Cafeína Dev — site

Site da Cafeína Dev: duas páginas estáticas (landing e design system) e dois apps locais
de IA (chat e tutor de matemática), construídos com **Vite + JavaScript vanilla** (sem
framework, sem TypeScript).

## Estrutura

- `src/landing/` — a landing (`cafeina.dev.br`): `index.html`, `main.js`, `landing.css`
- `src/design-system/` — o design system (`design-system.cafeina.dev.br`)
- `src/shared/` — código compartilhado: `tokens.css` (cores, tipografia, reset) e `brand-motion.js`
- `ia/` — interface local de chat com IA (modelo Gemma via Ollama); **não é deployada**
- `tutor-socratico/` — tutor de matemática socrático (deepseek-r1 + Pyodide/SymPy);
  identidade visual própria, **não** segue o design system; **não é deployado**
- `public/` — assets estáticos servidos na raiz (`/brand/...`)
- `vite.config.js` — uma config, quatro apps via env `APP` (`landing` | `design-system` | `ia` | `tutor-socratico`)

## Comandos

- `npm run dev` — landing em http://localhost:4200
- `npm run dev:design-system` — design system em http://localhost:4300
- `npm run dev:ia` — chat com IA em http://localhost:4400 (precisa do Ollama rodando)
- `npm run dev:tutor` — tutor de matemática em http://localhost:4500 (Ollama + `setup:tutor`)
- `npm run build` — build da landing → `dist/landing`
- `npm run build:design-system` — build do design system → `dist/design-system`
- `npm run build:ia` — build do chat com IA → `dist/ia`
- `npm run build:tutor` — build do tutor → `dist/tutor-socratico`
- `npm run setup:tutor` — baixa o runtime do Pyodide para o tutor (rodar uma vez)

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
Cada push em `main` dispara deploy automático. Os apps `ia/` e `tutor-socratico/` são
locais (dependem do Ollama na máquina) e não são publicados.
