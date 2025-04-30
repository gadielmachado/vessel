import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EmbedCode: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  // Get the current domain
  const domain = window.location.origin;
  const embedCode = `<iframe src="${domain}/embed" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);"></iframe>`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Copy className="h-6 w-6" />
          <span>Código para Incorporação</span>
        </CardTitle>
        <CardDescription>
          Adicione a timeline de navios em seu próprio site para manter todos informados sobre as movimentações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Copie e cole este código em qualquer local do seu site onde o HTML é aceito (WordPress, Wix, Squarespace, Framer, etc.).
          </p>
          
          <div className="relative">
            <Input
              readOnly
              value={embedCode}
              className="pr-28 font-mono text-sm h-auto py-4 bg-gray-50"
            />
            <Button
              className="absolute right-1 top-1 gap-1.5"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar código</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="rounded-md p-4 bg-blue-50 border border-blue-200 text-sm">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              <span>Dicas de Inserção</span>
            </h3>
            <ul className="list-disc ml-5 space-y-2 text-blue-900">
              <li>Recomendamos uma largura mínima de 800 pixels para melhor visualização.</li>
              <li>A altura pode ser ajustada conforme necessário mudando o valor de <code className="bg-blue-100 px-1 rounded">height="600"</code>.</li>
              <li>A timeline é responsiva e se ajusta automaticamente a diferentes tamanhos de tela.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedCode;
