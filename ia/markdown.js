import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configura o marked uma única vez (síncrono — o loop de streaming
// depende de renderMarkdown() devolver uma string na hora).
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Links das respostas abrem em nova aba, sem dar acesso ao opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Converte o markdown de uma resposta do modelo em HTML seguro.
 *
 * Todo conteúdo do assistente passa por aqui — inclusive o restaurado do
 * localStorage — então a sanitização cobre qualquer HTML que o modelo
 * tenha embutido. Tolerante a markdown parcial (usado durante o streaming).
 *
 * @param {string} text markdown cru
 * @returns {string} HTML já sanitizado
 */
export function renderMarkdown(text) {
  const html = marked.parse(text ?? '');
  return DOMPurify.sanitize(html);
}
