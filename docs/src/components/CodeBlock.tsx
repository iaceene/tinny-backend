import React from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true
}) => {
  return (
    <SyntaxHighlighter
      code={code}
      language={language}
      title={filename}
      showLineNumbers={showLineNumbers}
    />
  );
};
