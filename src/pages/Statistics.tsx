
import React, { useMemo, useState } from "react";
import { ArrowLeft, Calendar, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Conversation } from "@/utils/conversationParser";
import { calculateAnalytics } from "@/utils/analytics";
import TimelineChart from "@/components/analytics/TimelineChart";
import ParticipantActivity from "@/components/analytics/ParticipantActivity";
import ActivityHeatmap from "@/components/analytics/ActivityHeatmap";
import WordCloud from "@/components/analytics/WordCloud";
import EmotionalAnalysis from "@/components/analytics/EmotionalAnalysis";
import { useNavigate } from "react-router-dom";

interface StatisticsProps {
  conversations?: Conversation[];
}

const Statistics: React.FC<StatisticsProps> = ({ conversations = [] }) => {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [participantFilter, setParticipantFilter] = useState<string>("all");
  const [timelinePeriod, setTimelinePeriod] = useState<'day' | 'week' | 'month'>('day');

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (selectedConversation !== "all") {
      filtered = filtered.filter(conv => conv.id === selectedConversation);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const daysBack = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      
      filtered = filtered.map(conv => ({
        ...conv,
        messages: conv.messages.filter(msg => msg.timestamp >= cutoffDate)
      })).filter(conv => conv.messages.length > 0);
    }

    if (participantFilter !== "all") {
      filtered = filtered.map(conv => ({
        ...conv,
        messages: conv.messages.filter(msg => msg.sender === participantFilter)
      })).filter(conv => conv.messages.length > 0);
    }

    return filtered;
  }, [conversations, selectedConversation, dateRange, participantFilter]);

  const analytics = useMemo(() => {
    return calculateAnalytics(filteredConversations);
  }, [filteredConversations]);

  const allParticipants = useMemo(() => {
    const participants = new Set<string>();
    conversations.forEach(conv => {
      conv.participants.forEach(p => participants.add(p));
    });
    return Array.from(participants);
  }, [conversations]);

  const totalMessages = filteredConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const totalWords = filteredConversations.reduce((sum, conv) => 
    sum + conv.messages.reduce((wordSum, msg) => wordSum + msg.content.split(' ').length, 0), 0
  );

  const handleWordClick = (word: string) => {
    console.log('Word clicked:', word);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header avec filtres */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">
            Statistiques avancées
          </h1>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conversation</label>
              <Select value={selectedConversation} onValueChange={setSelectedConversation}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une conversation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les conversations</SelectItem>
                  {conversations.map((conv) => (
                    <SelectItem key={conv.id} value={conv.id}>
                      {conv.customName || conv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toute la période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute la période</SelectItem>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">3 derniers mois</SelectItem>
                  <SelectItem value="365">Dernière année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Participant</label>
              <Select value={participantFilter} onValueChange={setParticipantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les participants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les participants</SelectItem>
                  {allParticipants.map((participant) => (
                    <SelectItem key={participant} value={participant}>
                      {participant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages totaux</CardTitle>
              <Badge variant="secondary">{totalMessages.toLocaleString()}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {filteredConversations.length} conversation(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mots échangés</CardTitle>
              <Badge variant="secondary">{totalWords.toLocaleString()}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Moyenne: {Math.round(totalWords / Math.max(totalMessages, 1))} mots/message
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allParticipants.length}</div>
              <p className="text-xs text-muted-foreground">
                Dans {filteredConversations.length} conversation(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Période d'activité</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalDays > 0 ? `${analytics.totalDays}j` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalDays > 0 ? 
                  `${Math.round(totalMessages / analytics.totalDays)} msg/jour` : 
                  "Aucune donnée"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimelineChart 
            data={analytics.timeline} 
            period={timelinePeriod}
            onPeriodChange={setTimelinePeriod}
          />
          <ParticipantActivity participantStats={analytics.participantStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityHeatmap data={analytics.hourlyActivity} />
          <WordCloud words={analytics.wordFrequency} onWordClick={handleWordClick} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <EmotionalAnalysis metrics={analytics.emotionalTrends} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
