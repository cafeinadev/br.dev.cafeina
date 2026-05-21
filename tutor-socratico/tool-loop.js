/**
 * Protocolo de diretivas do tutor.
 *
 * Quando precisa de matemática, o modelo emite uma cerca de código com a
 * linguagem `calc` (expressão SymPy) ou `plot` (código matplotlib). O app
 * detecta a cerca, executa via Pyodide e a esconde do aluno — para ele, só
 * existe a prosa do professor e os gráficos.
 */

const DIRECTIVE_RE = /```(calc|plot)[ \t]*\r?\n([\s\S]*?)```/;

/**
 * Extrai a primeira diretiva de um texto completo de turno.
 * @param {string} text
 * @returns {{ kind: 'calc'|'plot', code: string }|null}
 */
export function extractDirective(text) {
  const match = DIRECTIVE_RE.exec(text);
  if (!match) return null;
  return { kind: match[1], code: match[2].trim() };
}

/**
 * Remove TODA a maquinaria antes de mostrar o texto ao aluno: blocos
 * ```calc```/```plot``` completos, um bloco aberto sem fechar (durante o
 * streaming) e um início de cerca ainda incompleto no fim do texto.
 * @param {string} text
 * @returns {string} apenas a prosa
 */
export function stripDirectives(text) {
  return text
    .replace(/```(?:calc|plot)[ \t]*\r?\n[\s\S]*?```/g, '')
    .replace(/```(?:calc|plot)[ \t]*\r?\n[\s\S]*$/, '')
    .replace(/```[a-z]*[ \t]*$/i, '');
}

/**
 * Formata o resultado do Python como mensagem para o modelo. Nunca é vista
 * pelo aluno — entra só no histórico enviado ao Ollama.
 * @param {{kind:'text',value:string}|{kind:'image',dataUrl:string}|{kind:'error',message:string}} result
 * @returns {string}
 */
export function formatToolResult(result) {
  if (result.kind === 'error') {
    return `[ERRO NO PYTHON]\n${result.message}\nCorrija a diretiva e tente de novo.`;
  }
  if (result.kind === 'image') {
    return '[RESULTADO DO PYTHON]\nO gráfico foi gerado e já está visível para o aluno. Comente-o sem revelar como foi feito.';
  }
  return `[RESULTADO DO PYTHON]\n${result.value}`;
}
