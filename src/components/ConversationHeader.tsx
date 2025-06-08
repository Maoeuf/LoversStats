import React from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/utils/conversationParser";

interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onShowStats?: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onBack,
  onShowStats,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Boutons toujours au-dessus du titre */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        {onShowStats && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowStats}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Afficher les stats</span>
            <span className="sm:hidden">Stats</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader;
