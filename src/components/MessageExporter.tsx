import React, { useState, useRef } from "react";
import { Download, Image, CheckSquare, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Message, Conversation } from "@/utils/conversationParser";
import { useTheme } from "@/hooks/useTheme";

interface MessageExporterProps {
  conversation: Conversation;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  initialScrollPosition?: number;
}

const MessageExporter: React.FC<MessageExporterProps> = ({
  conversation,
  messages,
  isOpen,
  onClose,
  initialScrollPosition = 0,
}) => {
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isExporting, setIsExporting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  React.useEffect(() => {
    if (isOpen && scrollContainerRef.current && initialScrollPosition > 0) {
      scrollContainerRef.current.scrollTop = initialScrollPosition;
    }
  }, [isOpen, initialScrollPosition]);

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const getAvatarColor = (sender: string): string => {
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
    ];

    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getThemeColors = () => {
    switch (theme) {
      case "dark":
        return {
          bgColor: "#0a0a0a",
          textColor: "#ffffff",
          mutedColor: "#71717a",
          cardColor: "#1a1a1a",
          borderColor: "#27272a",
          primaryColor: "#f97316",
        };
      case "spotify":
        return {
          bgColor: "#121212",
          textColor: "#ffffff",
          mutedColor: "#b3b3b3",
          cardColor: "#1e1e1e",
          borderColor: "#2a2a2a",
          primaryColor: "#1db954",
        };
      case "light":
        return {
          bgColor: "#ffffff",
          textColor: "#0a0a0a",
          mutedColor: "#71717a",
          cardColor: "#f8fafc",
          borderColor: "#e2e8f0",
          primaryColor: "#0f172a",
        };
      case "love":
      default:
        return {
          bgColor: "#667eea",
          textColor: "#ffffff",
          mutedColor: "#e2e8f0",
          cardColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          primaryColor: "#ec4899",
        };
      case "loveplus":
        return {
          bgColor: "#667eea",
          textColor: "#ffffff",
          mutedColor: "#e2e8f0",
          cardColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          primaryColor: "#ec4899",
        };
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return "WhatsApp";
      case "instagram":
        return "Instagram";
      case "discord":
        return "Discord";
      case "sms":
        return "SMS";
      default:
        return "Inconnu";
    }
  };

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
      const selectedMessagesList = Array.from(selectedMessages)
        .map((id) => messages[parseInt(id)])
        .filter(Boolean)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (selectedMessagesList.length === 0) {
        alert("Veuillez sélectionner au moins un message");
        setIsExporting(false);
        return;
      }

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      const width = 800;
      const padding = 32;
      const messageSpacing = 24;
      const headerHeight = 110;
      const footerHeight = 60;

      let totalHeight = headerHeight + footerHeight;
      const messageHeights: number[] = [];

      selectedMessagesList.forEach((message) => {
        tempCtx.font = "14px Inter, sans-serif";
        const maxWidth = width - padding * 2 - 80;

        const lines = wrapText(tempCtx, message.content, maxWidth);
        const messageHeight = Math.max(60, lines.length * 20 + 40);
        messageHeights.push(messageHeight);
        totalHeight += messageHeight + messageSpacing;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = totalHeight;

      const colors = getThemeColors();

      // Arrière-plan
      if (theme === "love" || theme === "loveplus") {
        const gradient = ctx.createLinearGradient(0, 0, width, totalHeight);
        gradient.addColorStop(0, "#18181b");
        gradient.addColorStop(1, "#13060b");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = colors.bgColor;
      }
      ctx.fillRect(0, 0, width, totalHeight);

      // En-tête
      ctx.fillStyle = colors.textColor;
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.fillText(conversation.customName || conversation.name, padding, 40);

      // Label de plateforme en haut à droite
      ctx.fillStyle = colors.primaryColor;
      ctx.font = "bold 16px Inter, sans-serif";
      const platformText = getPlatformName(conversation.platform);
      const platformWidth = ctx.measureText(platformText).width;
      ctx.fillText(platformText, width - padding - platformWidth, 40);

      ctx.fillStyle = colors.mutedColor;
      ctx.font = "16px Inter, sans-serif";
      ctx.fillText(
        `Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
        padding,
        70
      );

      // Messages
      let yPos = headerHeight;
      selectedMessagesList.forEach((message, index) => {
        const messageHeight = messageHeights[index];

        // Carte de message
        ctx.fillStyle = colors.cardColor;
        if (theme === "love" || theme === "loveplus") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        }
        drawRoundedRect(
          ctx,
          padding,
          yPos,
          width - padding * 2,
          messageHeight,
          8
        ); // 8px de rayon
        ctx.fill();

        // Bordure
        ctx.strokeStyle = colors.borderColor;
        ctx.lineWidth = 1;
        drawRoundedRect(
          ctx,
          padding,
          yPos,
          width - padding * 2,
          messageHeight,
          8
        );
        ctx.stroke();

        // Avatar
        const avatarX = padding + 16;
        const avatarY = yPos + 16;
        const avatarSize = 32;

        ctx.fillStyle = getAvatarColor(message.sender);
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Inter, sans-serif";
        const initial = message.sender.charAt(0).toUpperCase();
        const textWidth = ctx.measureText(initial).width;
        ctx.fillText(
          initial,
          avatarX + avatarSize / 2 - textWidth / 2,
          avatarY + avatarSize / 2 + 5
        );

        // Nom de l'expéditeur
        ctx.fillStyle = colors.textColor;
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.fillText(message.sender, avatarX + avatarSize + 12, yPos + 20);

        // Date
        ctx.fillStyle = colors.mutedColor;
        ctx.font = "12px Inter, sans-serif";
        const dateText = message.timestamp.toLocaleString("fr-FR");
        const dateWidth = ctx.measureText(dateText).width;
        ctx.fillText(dateText, width - padding - dateWidth - 16, yPos + 20);

        // Contenu du message
        ctx.fillStyle = colors.textColor;
        ctx.font = "14px Inter, sans-serif";
        const lines = wrapText(ctx, message.content, width - padding * 2 - 80);
        lines.forEach((line, lineIndex) => {
          ctx.fillText(
            line,
            avatarX + avatarSize + 12,
            yPos + 45 + lineIndex * 20
          );
        });

        yPos += messageHeight + messageSpacing;
      });

      // Pied de page
      ctx.fillStyle = colors.mutedColor;
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText("Généré par LoversStats", padding, totalHeight - 30);

      const link = document.createElement("a");
      link.download = `messages-${
        conversation.customName || conversation.name
      }-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export de l'image");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle>Exporter des messages</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
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
              <Image className="h-4 w-4 mr-2" />
              {isExporting ? "Export..." : "Exporter en image"}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>{selectedMessages.size} messages sélectionnés</span>
            <Badge variant="secondary">{messages.length} total</Badge>
          </div>
        </CardHeader>

        <CardContent
          ref={scrollContainerRef}
          className="max-h-96 overflow-y-auto"
        >
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
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default MessageExporter;
