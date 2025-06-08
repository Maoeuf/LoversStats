
import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, MessageSquare, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Conversation, Message } from '@/utils/conversationParser';

interface SearchResult {
  type: 'message' | 'conversation' | 'participant';
  id: string;
  title: string;
  subtitle: string;
  conversationId: string;
  conversationName: string;
  relevance: number;
}

interface GlobalSearchProps {
  conversations: Conversation[];
  onResultSelect: (result: SearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  conversations,
  onResultSelect,
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    conversations.forEach(conversation => {
      const convName = conversation.customName || conversation.name;
      
      // Recherche dans les noms de conversations
      if (convName.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'conversation',
          id: conversation.id,
          title: convName,
          subtitle: `${conversation.messageCount} messages`,
          conversationId: conversation.id,
          conversationName: convName,
          relevance: 100
        });
      }

      // Recherche dans les participants
      conversation.participants.forEach(participant => {
        if (participant.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'participant',
            id: `${conversation.id}-${participant}`,
            title: participant,
            subtitle: `Dans ${convName}`,
            conversationId: conversation.id,
            conversationName: convName,
            relevance: 90
          });
        }
      });

      // Recherche dans les messages (limitée pour éviter les ralentissements)
      const messageMatches = conversation.messages
        .filter(message => message.content.toLowerCase().includes(searchTerm))
        .slice(0, 20); // Limiter à 20 résultats par conversation

      messageMatches.forEach((message, index) => {
        const preview = message.content.length > 100 
          ? message.content.substring(0, 100) + '...'
          : message.content;

        results.push({
          type: 'message',
          id: `${conversation.id}-${message.timestamp.getTime()}`,
          title: preview,
          subtitle: `${message.sender} - ${message.timestamp.toLocaleString('fr-FR')}`,
          conversationId: conversation.id,
          conversationName: convName,
          relevance: 80 - index
        });
      });
    });

    // Trier par pertinence et limiter les résultats
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 50);
  }, [query, conversations]);

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultSelect(result);
    setQuery('');
    onClose();
  }, [onResultSelect, onClose]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'conversation':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'participant':
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Barre de recherche */}
          <div className="flex items-center p-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans les conversations, messages, participants..."
              className="flex-1 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Résultats */}
          <div className="max-h-96 overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                Tapez au moins 2 caractères pour rechercher
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucun résultat trouvé pour "{query}"
              </div>
            ) : (
              <div className="divide-y divide-border">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {result.title}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {result.type === 'message' ? 'Message' : 
                             result.type === 'conversation' ? 'Conversation' : 'Participant'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dans: {result.conversationName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalSearch;
