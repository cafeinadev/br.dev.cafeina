import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configura o marked uma única vez (síncrono — o streaming depende de
// renderMarkdown() devolver uma string na hora).
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Links abrem em nova aba, sem dar acesso ao opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Converte o markdown da fala do tutor em HTML seguro. Tolerante a markdown
 * parcial (usado durante o streaming).
 * @param {string} text
 * @returns {string} HTML já sanitizado
 */
export function renderMarkdown(text) {
  const html = marked.parse(text ?? '');
  return DOMPurify.sanitize(html);
}
