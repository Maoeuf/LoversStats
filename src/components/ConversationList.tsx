
import React, { useState } from 'react';
import { MessageSquare, Users, Calendar, Hash, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/utils/conversationParser';
import RenameDialog from './RenameDialog';

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
  onConversationDelete
}) => {
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; conversation: Conversation | null }>({
    isOpen: false,
    conversation: null
  });

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-500';
      case 'instagram': return 'bg-pink-500';
      case 'discord': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram';
      case 'discord': return 'Discord';
      default: return 'Inconnu';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      onConversationDelete(conversationId);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 spotify-muted mb-4" />
        <h3 className="text-lg font-medium spotify-text mb-2">Aucune conversation</h3>
        <p className="spotify-muted">Importez des fichiers de conversation pour commencer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold spotify-text">Conversations</h2>
        <Badge variant="secondary" className="text-sm bg-zinc-800 text-white">
          {conversations.length} conversation(s)
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {conversations.map((conversation) => (
          <Card 
            key={conversation.id} 
            className="spotify-card cursor-pointer transition-all duration-200 hover:scale-105 group relative"
            onClick={() => onConversationSelect(conversation)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate group-hover:text-green-400 transition-colors spotify-text">
                  {conversation.customName || conversation.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${getPlatformColor(conversation.platform)} text-white text-xs`}
                  >
                    {getPlatformName(conversation.platform)}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(conversation);
                  }}
                  className="h-8 px-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDelete(e, conversation.id)}
                  className="h-8 px-2 bg-zinc-800 border-zinc-700 hover:bg-red-900"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="spotify-muted">Messages</span>
                </div>
                <div className="font-semibold text-green-400">
                  {conversation.messageCount.toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <span className="spotify-muted">Mots</span>
                </div>
                <div className="font-semibold text-blue-400">
                  {conversation.wordCount.toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="spotify-muted">Participants</span>
                </div>
                <div className="font-semibold text-purple-400">
                  {conversation.participants.length}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="spotify-muted">Période</span>
                </div>
                <div className="text-xs spotify-muted">
                  {formatDate(conversation.startDate)} - {formatDate(conversation.endDate)}
                </div>
              </div>
              
              {conversation.participants.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="flex flex-wrap gap-1">
                    {conversation.participants.slice(0, 3).map((participant, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                        {participant}
                      </Badge>
                    ))}
                    {conversation.participants.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                        +{conversation.participants.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <RenameDialog
        isOpen={renameDialog.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, conversation: null })}
        onRename={handleRenameSubmit}
        currentName={renameDialog.conversation?.customName || renameDialog.conversation?.name || ''}
      />
    </div>
  );
};

export default ConversationList;
