import React, { useState } from "react";
import { Download, Image, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Message, Conversation } from "@/utils/conversationParser";

interface MessageExporterProps {
  conversation: Conversation;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

const MessageExporter: React.FC<MessageExporterProps> = ({
  conversation,
  messages,
  isOpen,
  onClose,
}) => {
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleMessage = (messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(
        new Set(messages.map((_, index) => index.toString()))
      );
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);

    try {
      // Créer un canvas pour le rendu
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const selectedMessagesList = Array.from(selectedMessages)
        .map((id) => messages[parseInt(id)])
        .filter(Boolean);

      // Dimensions du canvas
      const width = 800;
      const padding = 40;
      const messageHeight = 80;
      const height = Math.max(
        400,
        selectedMessagesList.length * messageHeight + padding * 2 + 100
      );

      canvas.width = width;
      canvas.height = height;

      // Style de base
      ctx.fillStyle = "hsl(var(--background))";
      ctx.fillRect(0, 0, width, height);

      // En-tête
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "bold 24px Inter";
      ctx.fillText(
        conversation.customName || conversation.name,
        padding,
        padding + 30
      );

      ctx.font = "16px Inter";
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.fillText(
        `${selectedMessagesList.length} messages sélectionnés`,
        padding,
        padding + 60
      );

      // Messages
      let yPos = padding + 100;
      selectedMessagesList.forEach((message, index) => {
        // Nom de l'expéditeur
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.font = "bold 14px Inter";
        ctx.fillText(message.sender, padding, yPos);

        // Date
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.font = "12px Inter";
        const dateText = message.timestamp.toLocaleString("fr-FR");
        ctx.fillText(
          dateText,
          width - padding - ctx.measureText(dateText).width,
          yPos
        );

        // Contenu du message
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "14px Inter";
        const maxWidth = width - padding * 2;
        const words = message.content.split(" ");
        let line = "";
        let lineY = yPos + 25;

        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, padding, lineY);
            line = word + " ";
            lineY += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, lineY);

        yPos += messageHeight;
      });

      // Télécharger l'image
      const link = document.createElement("a");
      link.download = `messages-${
        conversation.customName || conversation.name
      }-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="items-center justify-between">
            <CardTitle className="pb-3">Exporter des messages</CardTitle>
            <div className=" grid flex grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" onClick={selectAll} className="text-sm">
                {selectedMessages.size === messages.length
                  ? "Tout désélectionner"
                  : "Tout sélectionner"}
              </Button>
              <Button
                onClick={exportAsImage}
                disabled={selectedMessages.size === 0 || isExporting}
                className="text-sm"
              >
                <Image className="h-4 w-4" />
                {isExporting ? "Export..." : "Exporter images"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{selectedMessages.size} messages sélectionnés</span>
            <Badge variant="secondary">{messages.length} total</Badge>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {messages.map((message, index) => {
              const messageId = index.toString();
              const isSelected = selectedMessages.has(messageId);

              return (
                <div
                  key={messageId}
                  onClick={() => toggleMessage(messageId)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageExporter;
