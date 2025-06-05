
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Users, BarChart3, MessageSquare, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Conversation, ConversationParser } from '@/utils/conversationParser';

interface ConversationDetailProps {
  conversation: Conversation;
  onBack: () => void;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ 
  conversation, 
  onBack 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);

  const stats = useMemo(() => {
    return ConversationParser.calculateStats(conversation);
  }, [conversation]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return conversation.messages;
    return conversation.messages.filter(message =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversation.messages, searchTerm]);

  const formatTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-500';
      case 'instagram': return 'bg-pink-500';
      case 'discord': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getParticipantColor = (participant: string, index: number) => {
    const colors = [
      'bg-green-500/20 text-green-400 border-green-500/30',
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    ];
    return colors[index % colors.length];
  };

  // Calculate conversation duration
  const duration = useMemo(() => {
    const diffTime = conversation.endDate.getTime() - conversation.startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [conversation.startDate, conversation.endDate]);

  // Calculate average messages per day
  const avgMessagesPerDay = useMemo(() => {
    return Math.round(conversation.messageCount / duration);
  }, [conversation.messageCount, duration]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center space-x-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold spotify-text">
              {conversation.customName || conversation.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getPlatformColor(conversation.platform)} text-white`}>
                {conversation.platform.charAt(0).toUpperCase() + conversation.platform.slice(1)}
              </Badge>
              <span className="text-sm spotify-muted">
                {conversation.messageCount} messages • {conversation.wordCount} mots
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center space-x-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
        >
          <BarChart3 className="h-4 w-4" />
          <span>{showStats ? 'Masquer' : 'Afficher'} les stats</span>
        </Button>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <Card className="spotify-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 spotify-text">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span>Aperçu rapide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{duration}</div>
                  <div className="text-sm spotify-muted flex items-center justify-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Jours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{avgMessagesPerDay}</div>
                  <div className="text-sm spotify-muted flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Msgs/jour
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-center">
                  <div className="text-sm spotify-muted mb-1">Période</div>
                  <div className="text-xs spotify-muted">
                    {formatTime(conversation.startDate).split(' ')[0]} - {formatTime(conversation.endDate).split(' ')[0]}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants Stats */}
          <Card className="spotify-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 spotify-text">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Statistiques par participant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.messagesByParticipant)
                  .sort(([,a], [,b]) => b - a)
                  .map(([participant, count], index) => {
                    const wordCount = stats.wordsByParticipant[participant] || 0;
                    const percentage = Math.round((count / stats.totalMessages) * 100);
                    return (
                      <div key={participant} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getParticipantColor(participant, index)}>
                            {participant}
                          </Badge>
                          <span className="text-sm spotify-muted">{percentage}%</span>
                        </div>
                        <div className="text-xs spotify-muted flex justify-between">
                          <span>{count.toLocaleString()} messages</span>
                          <span>{wordCount.toLocaleString()} mots</span>
                        </div>
                      </div>
                    );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 spotify-muted" />
        <Input
          placeholder="Rechercher dans la conversation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
        />
      </div>

      {/* Messages */}
      <Card className="spotify-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between spotify-text">
            <span>Messages ({filteredMessages.length})</span>
            {searchTerm && (
              <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                {filteredMessages.length} résultat(s) trouvé(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 spotify-muted">
                Aucun message trouvé
              </div>
            ) : (
              filteredMessages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors border border-zinc-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      className={getParticipantColor(
                        message.sender, 
                        conversation.participants.indexOf(message.sender)
                      )}
                    >
                      {message.sender}
                    </Badge>
                    <span className="text-xs spotify-muted">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="spotify-text leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationDetail;
