
import React, { useState, useMemo } from 'react';
import { BarChart3, Users, MessageSquare, Calendar, TrendingUp, Clock, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Conversation } from '@/utils/conversationParser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface StatisticsProps {
  conversations: Conversation[];
}

const Statistics: React.FC<StatisticsProps> = ({ conversations }) => {
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'global' | 'filtered'>('global');

  // Données filtrées
  const filteredConversations = useMemo(() => {
    if (viewMode === 'global') return conversations;
    
    return conversations.filter(conv => 
      selectedConversations.length === 0 || selectedConversations.includes(conv.id)
    );
  }, [conversations, selectedConversations, viewMode]);

  // Tous les participants uniques
  const allParticipants = useMemo(() => {
    const participants = new Set<string>();
    filteredConversations.forEach(conv => {
      conv.participants.forEach(p => participants.add(p));
    });
    return Array.from(participants);
  }, [filteredConversations]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalMessages = filteredConversations.reduce((sum, conv) => sum + conv.messageCount, 0);
    const totalWords = filteredConversations.reduce((sum, conv) => sum + conv.wordCount, 0);
    const totalParticipants = new Set(filteredConversations.flatMap(conv => conv.participants)).size;
    
    return {
      totalMessages,
      totalWords,
      totalParticipants,
      totalConversations: filteredConversations.length,
      avgMessagesPerConv: totalMessages / filteredConversations.length || 0,
      avgWordsPerMessage: totalWords / totalMessages || 0
    };
  }, [filteredConversations]);

  // Messages par participant
  const participantStats = useMemo(() => {
    const stats: Record<string, { messages: number; words: number }> = {};
    
    filteredConversations.forEach(conv => {
      conv.messages.forEach(message => {
        if (selectedParticipants.length === 0 || selectedParticipants.includes(message.sender)) {
          if (!stats[message.sender]) {
            stats[message.sender] = { messages: 0, words: 0 };
          }
          stats[message.sender].messages++;
          stats[message.sender].words += message.content.split(' ').length;
        }
      });
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.messages - a.messages);
  }, [filteredConversations, selectedParticipants]);

  // Activité par heure
  const hourlyActivity = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    
    filteredConversations.forEach(conv => {
      conv.messages.forEach(message => {
        if (selectedParticipants.length === 0 || selectedParticipants.includes(message.sender)) {
          const hour = message.timestamp.getHours();
          hourCounts[hour]++;
        }
      });
    });

    return hourCounts.map((count, hour) => ({
      hour: `${hour}h`,
      messages: count
    }));
  }, [filteredConversations, selectedParticipants]);

  // Activité par mois
  const monthlyActivity = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    
    filteredConversations.forEach(conv => {
      conv.messages.forEach(message => {
        if (selectedParticipants.length === 0 || selectedParticipants.includes(message.sender)) {
          const monthKey = `${message.timestamp.getFullYear()}-${String(message.timestamp.getMonth() + 1).padStart(2, '0')}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        }
      });
    });

    return Object.entries(monthCounts)
      .map(([month, messages]) => ({ month, messages }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredConversations, selectedParticipants]);

  // Messages les plus longs
  const longestMessages = useMemo(() => {
    const allMessages = filteredConversations.flatMap(conv => 
      conv.messages
        .filter(msg => selectedParticipants.length === 0 || selectedParticipants.includes(msg.sender))
        .map(msg => ({
          ...msg,
          conversationName: conv.customName || conv.name,
          wordCount: msg.content.split(' ').length
        }))
    );

    return allMessages
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 10);
  }, [filteredConversations, selectedParticipants]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff'];

  const toggleConversation = (convId: string) => {
    setSelectedConversations(prev => 
      prev.includes(convId) 
        ? prev.filter(id => id !== convId)
        : [...prev, convId]
    );
  };

  const toggleParticipant = (participant: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participant) 
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statistiques</h1>
            <p className="text-muted-foreground">Analysez vos conversations en détail</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredConversations.length} conversation(s) analysée(s)
          </Badge>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Filtres et Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode de vue */}
            <div className="flex items-center gap-4">
              <label className="font-medium">Mode d'affichage:</label>
              <Select value={viewMode} onValueChange={(value: 'global' | 'filtered') => setViewMode(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Statistiques globales</SelectItem>
                  <SelectItem value="filtered">Conversations sélectionnées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sélection des conversations */}
            {viewMode === 'filtered' && (
              <div>
                <label className="font-medium mb-2 block">Conversations à analyser:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {conversations.map(conv => (
                    <div key={conv.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={conv.id}
                        checked={selectedConversations.includes(conv.id)}
                        onCheckedChange={() => toggleConversation(conv.id)}
                      />
                      <label htmlFor={conv.id} className="text-sm truncate cursor-pointer">
                        {conv.customName || conv.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection des participants */}
            <div>
              <label className="font-medium mb-2 block">Participants à analyser:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {allParticipants.map(participant => (
                  <div key={participant} className="flex items-center space-x-2">
                    <Checkbox
                      id={participant}
                      checked={selectedParticipants.includes(participant)}
                      onCheckedChange={() => toggleParticipant(participant)}
                    />
                    <label htmlFor={participant} className="text-sm truncate cursor-pointer">
                      {participant}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques générales */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-foreground">
                {globalStats.totalMessages.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Messages totaux</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Hash className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-foreground">
                {globalStats.totalWords.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Mots échangés</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-foreground">
                {globalStats.totalParticipants}
              </div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-foreground">
                {globalStats.totalConversations}
              </div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-pink-500" />
              <div className="text-2xl font-bold text-foreground">
                {Math.round(globalStats.avgMessagesPerConv).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Moy. msg/conv</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold text-foreground">
                {Math.round(globalStats.avgWordsPerMessage)}
              </div>
              <div className="text-xs text-muted-foreground">Mots/message</div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages par participant */}
          <Card>
            <CardHeader>
              <CardTitle>Messages par participant</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={participantStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activité par heure */}
          <Card>
            <CardHeader>
              <CardTitle>Activité par heure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="messages" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des mots */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des mots par participant</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={participantStats.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="words"
                  >
                    {participantStats.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Évolution mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Messages les plus longs */}
        <Card>
          <CardHeader>
            <CardTitle>Messages les plus longs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {longestMessages.map((message, index) => (
                <div key={index} className="p-3 bg-accent rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{message.sender}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {message.wordCount} mots
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.conversationName}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{message.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
