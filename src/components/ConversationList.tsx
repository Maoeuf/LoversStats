import React, { useState } from "react";
import {
  MessageSquare,
  Users,
  Calendar,
  Hash,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/utils/conversationParser";
import RenameDialog from "./RenameDialog";

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  onConversationRename: (conversationId: string, newName: string) => void;
  onConversationDelete: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationSelect,
  onConversationRename,
  onConversationDelete,
}) => {
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    conversation: Conversation | null;
  }>({
    isOpen: false,
    conversation: null,
  });
  const [expandedConversations, setExpandedConversations] = useState<
    Set<string>
  >(new Set());

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return "bg-green-600 hover:bg-green-700";
      case "instagram":
        return "bg-pink-600 hover:bg-pink-700";
      case "discord":
        return "bg-indigo-600 hover:bg-indigo-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
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
      default:
        return "Inconnu";
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Date invalide";
    }
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleRename = (conversation: Conversation) => {
    setRenameDialog({ isOpen: true, conversation });
  };

  const handleRenameSubmit = (newName: string) => {
    if (renameDialog.conversation) {
      onConversationRename(renameDialog.conversation.id, newName);
    }
  };

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      onConversationDelete(conversationId);
    }
  };

  const toggleExpanded = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setExpandedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
          Aucune conversation
        </h3>
        <p className="text-muted-foreground text-sm">
          Importez des fichiers de conversation pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Conversations
        </h2>
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {conversations.length}
        </Badge>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {conversations.map((conversation) => {
          const isExpanded = expandedConversations.has(conversation.id);
          return (
            <Card
              key={conversation.id}
              className="conversation-card cursor-pointer transition-all duration-200 hover:scale-[101%] group relative"
            >
              <CardHeader
                className="pb-2 sm:pb-3"
                onClick={() => onConversationSelect(conversation)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base lg:text-lg truncate group-hover:text-primary transition-colors text-foreground flex-1 mr-2">
                    {conversation.customName || conversation.name}
                  </CardTitle>

                  {/* Boutons modifier/supprimer à droite du titre */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(conversation);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDelete(e, conversation.id)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Badge
                      className={`${getPlatformColor(
                        conversation.platform
                      )} text-white text-xs transition-colors ml-1`}
                    >
                      {getPlatformName(conversation.platform)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                {/* Bouton pour afficher les détails */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleExpanded(e, conversation.id)}
                  className="w-full h-6 text-xs text-muted-foreground hover:bg-accent p-1"
                >
                  Détails
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>

                {/* Détails déroulants */}
                {isExpanded && (
                  <div className="space-y-2 text-xs border-t border-border pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">Messages</span>
                      </div>
                      <div className="font-semibold text-blue-400">
                        {conversation.messageCount.toLocaleString()}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Hash className="h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">Mots</span>
                      </div>
                      <div className="font-semibold text-green-400">
                        {conversation.wordCount.toLocaleString()}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-violet-500" />
                        <span className="text-muted-foreground">
                          Participants
                        </span>
                      </div>
                      <div className="font-semibold text-violet-400">
                        {conversation.participants.length}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-orange-500" />
                        <span className="text-muted-foreground">Période</span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDate(conversation.startDate)} -{" "}
                        {formatDate(conversation.endDate)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RenameDialog
        isOpen={renameDialog.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, conversation: null })}
        onRename={handleRenameSubmit}
        currentName={
          renameDialog.conversation?.customName ||
          renameDialog.conversation?.name ||
          ""
        }
      />
    </div>
  );
};

export default ConversationList;
