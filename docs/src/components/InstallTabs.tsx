import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { SyntaxHighlighter } from './SyntaxHighlighter';

export const InstallTabs: React.FC = () => {
  return (
    <div className="install-tabs-wrapper my-4">
      <Tabs defaultValue="bun">
        <TabsList>
          <TabsTrigger value="bun">bun</TabsTrigger>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
        </TabsList>
        <TabsContent value="bun">
          <SyntaxHighlighter code="bun add tinny-backend" language="bash" title="terminal" showLineNumbers={false} />
        </TabsContent>
        <TabsContent value="npm">
          <SyntaxHighlighter code="npm install tinny-backend" language="bash" title="terminal" showLineNumbers={false} />
        </TabsContent>
        <TabsContent value="pnpm">
          <SyntaxHighlighter code="pnpm add tinny-backend" language="bash" title="terminal" showLineNumbers={false} />
        </TabsContent>
        <TabsContent value="yarn">
          <SyntaxHighlighter code="yarn add tinny-backend" language="bash" title="terminal" showLineNumbers={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
