export type AngleMode = 'DEG' | 'RAD';

type Token =
  | { type: 'number'; value: number }
  | { type: 'var'; name: string }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' };

function factorial(n: number): number {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal (including scientific notation like 1e-5 or 1.2e+4)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      if (i < expr.length && (expr[i] === 'e' || expr[i] === 'E') && /[0-9+-]/.test(expr[i + 1] ?? '')) {
        const nextChar = expr[i + 1];
        if (/[0-9]/.test(nextChar) || ((nextChar === '+' || nextChar === '-') && /[0-9]/.test(expr[i + 2] ?? ''))) {
          numStr += expr[i++];
          if (expr[i] === '+' || expr[i] === '-') {
            numStr += expr[i++];
          }
          while (i < expr.length && /[0-9]/.test(expr[i])) {
            numStr += expr[i++];
          }
        }
      }
      const value = Number(numStr);
      if (Number.isNaN(value)) {
        throw new Error('Invalid number');
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    if (ch === 'π') {
      tokens.push({ type: 'number', value: Math.PI });
      i++;
      continue;
    }

    if (ch === '√') {
      tokens.push({ type: 'ident', value: 'sqrt' });
      i++;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        ident += expr[i++];
      }
      const lower = ident.toLowerCase();
      if (lower === 'e') {
        tokens.push({ type: 'number', value: Math.E });
      } else if (lower === 'x') {
        tokens.push({ type: 'var', name: 'x' });
      } else {
        tokens.push({ type: 'ident', value: lower });
      }
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    if (ch === '×') {
      tokens.push({ type: 'op', value: '*' });
      i++;
      continue;
    }

    if (ch === '÷') {
      tokens.push({ type: 'op', value: '/' });
      i++;
      continue;
    }

    if (ch === '−') {
      tokens.push({ type: 'op', value: '-' });
      i++;
      continue;
    }

    if (ch === '²') {
      tokens.push({ type: 'op', value: '^' });
      tokens.push({ type: 'number', value: 2 });
      i++;
      continue;
    }

    if ('+-*/^%!'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  // Insert implicit multiplication where appropriate
  const expanded: Token[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const curr = tokens[idx];
    const prev = expanded[expanded.length - 1];

    if (prev) {
      const prevIsValueEnd =
        prev.type === 'number' ||
        prev.type === 'var' ||
        prev.type === 'rparen' ||
        (prev.type === 'op' && (prev.value === '!' || prev.value === '%'));
      const currIsValueStart =
        curr.type === 'number' ||
        curr.type === 'var' ||
        curr.type === 'ident' ||
        curr.type === 'lparen';

      if (prevIsValueEnd && currIsValueStart) {
        expanded.push({ type: 'op', value: '*' });
      }
    }
    expanded.push(curr);
  }

  return expanded;
}

function evaluateTokens(
  tokens: Token[],
  angleMode: AngleMode,
  variables: Record<string, number>
): number {
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpression(): number {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek() as { type: 'op'; value: string }).value.match(/^[+-]$/)) {
      const op = (consume() as { type: 'op'; value: string }).value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseUnary();
    while (peek()?.type === 'op' && (peek() as { type: 'op'; value: string }).value.match(/^[*/]$/)) {
      const op = (consume() as { type: 'op'; value: string }).value;
      const right = parseUnary();
      if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseUnary(): number {
    const t = peek();
    if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const val = parseUnary();
      return t.value === '-' ? -val : val;
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePostfix();
    const t = peek();
    if (t?.type === 'op' && t.value === '^') {
      consume();
      const exponent = parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePostfix(): number {
    let val = parsePrimary();
    while (peek()?.type === 'op') {
      const op = (peek() as { type: 'op'; value: string }).value;
      if (op === '!') {
        consume();
        val = factorial(val);
      } else if (op === '%') {
        consume();
        val = val / 100;
      } else {
        break;
      }
    }
    return val;
  }

  function parsePrimary(): number {
    const t = peek();
    if (!t) throw new Error('Incomplete expression');

    if (t.type === 'number') {
      consume();
      return t.value;
    }

    if (t.type === 'var') {
      consume();
      if (!(t.name in variables)) {
        throw new Error(`Undefined variable: ${t.name}`);
      }
      return variables[t.name];
    }

    if (t.type === 'lparen') {
      consume();
      const val = parseExpression();
      if (peek()?.type !== 'rparen') {
        throw new Error('Missing closing parenthesis');
      }
      consume();
      return val;
    }

    if (t.type === 'ident') {
      const fnName = (consume() as { type: 'ident'; value: string }).value;
      let arg: number;
      if (peek()?.type === 'lparen') {
        consume();
        arg = parseExpression();
        if (peek()?.type !== 'rparen') {
          throw new Error('Missing closing parenthesis');
        }
        consume();
      } else {
        arg = parseUnary();
      }

      const toRad = (deg: number) => (angleMode === 'DEG' ? (deg * Math.PI) / 180 : deg);

      switch (fnName) {
        case 'sin': {
          const r = Math.sin(toRad(arg));
          return Math.abs(r) < 1e-13 ? 0 : r;
        }
        case 'cos': {
          const r = Math.cos(toRad(arg));
          return Math.abs(r) < 1e-13 ? 0 : r;
        }
        case 'tan': {
          const c = Math.cos(toRad(arg));
          if (Math.abs(c) < 1e-13) throw new Error('Undefined');
          const r = Math.tan(toRad(arg));
          return Math.abs(r) < 1e-13 ? 0 : r;
        }
        case 'log':
          if (arg <= 0) throw new Error('Domain error');
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) throw new Error('Domain error');
          return Math.log(arg);
        case 'sqrt':
          if (arg < 0) throw new Error('Domain error');
          return Math.sqrt(arg);
        case 'abs':
          return Math.abs(arg);
        default:
          throw new Error(`Unknown function: ${fnName}`);
      }
    }

    throw new Error('Syntax error');
  }

  const result = parseExpression();
  if (pos < tokens.length) {
    throw new Error('Unexpected trailing input');
  }
  if (!Number.isFinite(result)) {
    throw new Error('Math overflow');
  }
  return result;
}

export function evaluateExpression(
  rawExpr: string,
  angleMode: AngleMode = 'DEG',
  variables: Record<string, number> = {}
): number {
  const trimmed = rawExpr.trim();
  if (!trimmed) return 0;
  const tokens = tokenize(trimmed);
  return evaluateTokens(tokens, angleMode, variables);
}

/**
 * Compiles an expression f(x) once for fast real-time plotting.
 * Auto-balances trailing open parentheses so partial expressions like "sin(x" plot live.
 */
export function compileMathFunction(
  rawExpr: string,
  angleMode: AngleMode = 'RAD'
): { fn: ((x: number) => number) | null; error: string | null } {
  const trimmed = rawExpr.trim();
  if (!trimmed) return { fn: null, error: null };

  try {
    const opens = (trimmed.match(/\(/g) || []).length;
    const closes = (trimmed.match(/\)/g) || []).length;
    const balanced =
      opens > closes ? trimmed + ')'.repeat(opens - closes) : trimmed;
    const tokens = tokenize(balanced);
    // Probe once at x=1 to catch syntax errors early (ignoring domain errors like sqrt(-1))
    try {
      evaluateTokens(tokens, angleMode, { x: 1 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Syntax error';
      if (
        msg !== 'Division by zero' &&
        msg !== 'Domain error' &&
        msg !== 'Undefined' &&
        msg !== 'Math overflow'
      ) {
        return { fn: null, error: msg };
      }
    }
    return {
      fn: (x: number) => {
        try {
          return evaluateTokens(tokens, angleMode, { x });
        } catch {
          return NaN;
        }
      },
      error: null,
    };
  } catch (err) {
    return {
      fn: null,
      error: err instanceof Error ? err.message : 'Invalid expression',
    };
  }
}

export function formatDisplayNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Error';
  if (Object.is(value, -0) || Math.abs(value) < 1e-15) return '0';

  const abs = Math.abs(value);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-9)) {
    return value.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Round floating point noise (e.g., 0.1 + 0.2 = 0.30000000000000004)
  const rounded = Number(value.toPrecision(12));
  const str = String(rounded);
  if (str.length > 14 && str.includes('.')) {
    return Number(value.toPrecision(10)).toString();
  }
  return str;
}

/**
 * Formats numeric literals inside an expression or result string with thousands separators
 * for display only. Preserves original decimal digits, exponents, and operators.
 */
export function formatExpressionWithCommas(text: string): string {
  if (!text || text === 'Error') return text;
  return text.replace(
    /(?<![A-Za-z0-9.])(\d+)(\.\d*)?(?:([eE][+-]?\d+))?/g,
    (_match, intPart: string, fracPart?: string, expPart?: string) => {
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${grouped}${fracPart ?? ''}${expPart ?? ''}`;
    }
  );
}

/**
 * Formats a finite numeric result with fixed decimal places and thousands separators.
 */
export function formatFixedWithCommas(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
