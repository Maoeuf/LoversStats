
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, MessageSquare, Hash, Clock, Heart } from 'lucide-react';

interface ParticipantStats {
  messages: number;
  words: number;
  avgWordsPerMessage: number;
  emotionalScore: number;
  mostActiveHour: number;
}

interface ParticipantActivityProps {
  participantStats: Map<string, ParticipantStats>;
}

const ParticipantActivity: React.FC<ParticipantActivityProps> = ({ participantStats }) => {
  const participants = Array.from(participantStats.entries());
  const totalMessages = participants.reduce((sum, [, stats]) => sum + stats.messages, 0);
  
  const getParticipantColor = (index: number) => {
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

  const getEmotionalScoreColor = (score: number) => {
    if (score > 10) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    if (score > -10) return 'text-orange-400';
    return 'text-red-400';
  };

  const mostActiveParticipant = participants.reduce((max, current) => 
    current[1].messages > max[1].messages ? current : max
  );

  const mostEmotionalParticipant = participants.reduce((max, current) => 
    current[1].emotionalScore > max[1].emotionalScore ? current : max
  );

  return (
    <Card className="spotify-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 spotify-text">
          <Users className="h-5 w-5 text-purple-500" />
          <span>Activité des participants</span>
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            🏆 Plus actif : {mostActiveParticipant[0]}
          </Badge>
          <Badge variant="outline" className="bg-pink-500/20 text-pink-400 border-pink-500/30">
            💖 Plus émotionnel : {mostEmotionalParticipant[0]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants
          .sort((a, b) => b[1].messages - a[1].messages)
          .map(([name, stats], index) => {
            const messagePercentage = (stats.messages / totalMessages) * 100;
            
            return (
              <div key={name} className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={getParticipantColor(index)}>
                    {name}
                  </Badge>
                  <div className="text-sm spotify-muted">
                    {messagePercentage.toFixed(1)}% des messages
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Barre de progression des messages */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="spotify-muted">Contribution aux messages</span>
                      <span className="text-white">{stats.messages}</span>
                    </div>
                    <Progress value={messagePercentage} className="h-2" />
                  </div>
                  
                  {/* Statistiques détaillées */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-3 w-3 text-blue-500" />
                      <span className="spotify-muted">Mots:</span>
                      <span className="text-blue-400 font-medium">{stats.words.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      <span className="spotify-muted">Moy/msg:</span>
                      <span className="text-green-400 font-medium">{stats.avgWordsPerMessage}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span className="spotify-muted">Heure pic:</span>
                      <span className="text-orange-400 font-medium">{stats.mostActiveHour}h</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span className="spotify-muted">Emotion:</span>
                      <span className={`font-medium ${getEmotionalScoreColor(stats.emotionalScore)}`}>
                        {stats.emotionalScore > 0 ? '+' : ''}{stats.emotionalScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
};

export default ParticipantActivity;
