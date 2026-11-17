import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal } from 'lucide-react';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'boolean' | 'type' | 'function' | 'operator' | 'punctuation' | 'plain';
  value: string;
}

// Tokenizer for TypeScript, JavaScript, JSON, Bash, and Diff
function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  // Diff lines
  if (language === 'diff' || line.startsWith('+ ') || line.startsWith('- ')) {
    if (line.startsWith('+')) {
      return [{ type: 'keyword', value: line }];
    } else if (line.startsWith('-')) {
      return [{ type: 'string', value: line }];
    }
  }

  // Bash/Shell comments
  if (language === 'bash' || language === 'sh' || language === 'shell') {
    if (line.trim().startsWith('#')) {
      return [{ type: 'comment', value: line }];
    }
  }

  const keywords = new Set([
    'import', 'export', 'from', 'default', 'const', 'let', 'var', 'function',
    'return', 'async', 'await', 'new', 'if', 'else', 'try', 'catch', 'finally',
    'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'throw', 'typeof',
    'instanceof', 'as', 'in', 'of', 'type', 'interface', 'class', 'extends',
    'implements', 'private', 'public', 'protected', 'static', 'readonly', 'null',
    'undefined', 'true', 'false', 'package', 'scripts', 'dependencies', 'devDependencies'
  ]);

  const knownTypes = new Set([
    'Server', 'ServerReq', 'ServerRes', 'HandlerFun', 'AddOption', 'ServerOptions',
    'Cookie', 'Decorator', 'Session', 'DirFiles', 'ServFiles', 'Methods', 'Headers',
    'URL', 'URLSearchParams', 'Buffer', 'Promise', 'Record', 'WebSocket', 'RawData',
    'Error', 'Date', 'JSON', 'Map', 'Set', 'Array', 'Object', 'string', 'number',
    'boolean', 'any', 'void', 'unknown', 'never'
  ]);

  while (i < line.length) {
    // Single line comments
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Shell comment if not inside string
    if (line[i] === '#' && (language === 'bash' || language === 'sh')) {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Strings: single, double, backtick
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || /[^a-zA-Z0-9_$]/.test(line[i - 1]))) {
      let num = '';
      while (i < line.length && /[0-9a-fA-FxX.eE_]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Words / Identifiers
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if followed by open parenthesis -> function call
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      const isFunction = line[j] === '(';

      if (word === 'true' || word === 'false') {
        tokens.push({ type: 'boolean', value: word });
      } else if (keywords.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (knownTypes.has(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      continue;
    }

    // Operators & Punctuation
    if (/[\+\-\*\/%=&|<>!?:;,.]/.test(line[i])) {
      tokens.push({ type: 'operator', value: line[i] });
      i++;
      continue;
    }

    // Whitespace and other characters
    tokens.push({ type: 'plain', value: line[i] });
    i++;
  }

  return tokens;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true
}) => {
  const [copied, setCopied] = useState(false);
  const rawCode = code.trim();
  const lines = rawCode.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getLanguageIcon = () => {
    if (language === 'bash' || language === 'sh') {
      return <Terminal size={14} className="text-primary" />;
    }
    return <FileCode size={14} className="text-primary" />;
  };

  return (
    <div className="syntax-code-wrapper">
      <div className="syntax-code-header">
        <div className="syntax-header-info">
          {getLanguageIcon()}
          <span className="syntax-title">{title || language}</span>
          <span className="syntax-lang-badge">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`syntax-copy-btn ${copied ? 'copied' : ''}`}
          aria-label="Copy to clipboard"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-primary" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="syntax-code-viewport">
        <pre className="syntax-pre">
          <code>
            {lines.map((line, idx) => {
              const isDiffAdd = line.startsWith('+ ') || line.startsWith('+');
              const isDiffDel = line.startsWith('- ') || line.startsWith('-');
              const lineTokens = tokenizeLine(line, language);

              return (
                <div
                  key={idx}
                  className={`syntax-line ${isDiffAdd ? 'diff-add' : ''} ${isDiffDel ? 'diff-del' : ''}`}
                >
                  {showLineNumbers && (
                    <span className="syntax-line-number" aria-hidden="true">
                      {idx + 1}
                    </span>
                  )}
                  <span className="syntax-line-content">
                    {lineTokens.map((t, tIdx) => (
                      <span key={tIdx} className={`tok-${t.type}`}>
                        {t.value}
                      </span>
                    ))}
                    {line.length === 0 && ' '}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
