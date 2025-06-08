
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/utils/conversationParser';

interface ConversationPDFExporterProps {
  conversation: Conversation;
}

const ConversationPDFExporter: React.FC<ConversationPDFExporterProps> = ({
  conversation
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Créer le contenu HTML avec les styles du thème
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${conversation.customName || conversation.name}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 40px;
              background: hsl(var(--background));
              color: hsl(var(--foreground));
            }
            .header {
              border-bottom: 2px solid hsl(var(--border));
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: hsl(var(--primary));
              margin-bottom: 10px;
            }
            .subtitle {
              color: hsl(var(--muted-foreground));
              font-size: 16px;
            }
            .stats {
              display: flex;
              gap: 30px;
              margin: 20px 0;
              padding: 15px;
              background: hsl(var(--card));
              border-radius: 8px;
              border: 1px solid hsl(var(--border));
            }
            .stat {
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: hsl(var(--primary));
            }
            .stat-label {
              font-size: 12px;
              color: hsl(var(--muted-foreground));
              text-transform: uppercase;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              background: hsl(var(--card));
              border-radius: 8px;
              border-left: 4px solid hsl(var(--primary));
            }
            .message-header {
              display: flex;
              justify-content: between;
              align-items: center;
              margin-bottom: 8px;
            }
            .sender {
              font-weight: bold;
              color: hsl(var(--primary));
            }
            .timestamp {
              font-size: 12px;
              color: hsl(var(--muted-foreground));
              margin-left: auto;
            }
            .content {
              color: hsl(var(--foreground));
              word-wrap: break-word;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${conversation.customName || conversation.name}</div>
            <div class="subtitle">Exporté le ${new Date().toLocaleDateString('fr-FR')}</div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${conversation.messageCount.toLocaleString()}</div>
                <div class="stat-label">Messages</div>
              </div>
              <div class="stat">
                <div class="stat-value">${conversation.wordCount.toLocaleString()}</div>
                <div class="stat-label">Mots</div>
              </div>
              <div class="stat">
                <div class="stat-value">${conversation.participants.length}</div>
                <div class="stat-label">Participants</div>
              </div>
            </div>
          </div>

          ${conversation.messages.map((message, index) => `
            <div class="message">
              <div class="message-header">
                <span class="sender">${message.sender}</span>
                <span class="timestamp">${message.timestamp.toLocaleString('fr-FR')}</span>
              </div>
              <div class="content">${message.content.replace(/\n/g, '<br>')}</div>
            </div>
            ${(index + 1) % 20 === 0 ? '<div class="page-break"></div>' : ''}
          `).join('')}
        </body>
        </html>
      `;

      // Créer et télécharger le fichier
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation-${conversation.customName || conversation.name}-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Export...' : 'Exporter PDF'}
    </Button>
  );
};

export default ConversationPDFExporter;
