import { Conversation, Message } from './conversationParser';

export interface TimelineData {
  date: string;
  messages: number;
  words: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface EmotionalMetrics {
  positiveScore: number;
  negativeScore: number;
  moodScore: number;
  totalEmojis: number;
  affectionWords: number;
}

export interface WordFrequency {
  word: string;
  count: number;
  category?: 'positive' | 'negative' | 'neutral';
}

// Mots-clés positifs et négatifs pour l'analyse émotionnelle
const POSITIVE_KEYWORDS = [
  'amour', 'love', 'adorable', 'magnifique', 'merveilleux', 'génial', 'super', 'parfait',
  'excellent', 'fantastique', 'incroyable', 'formidable', 'heureux', 'joie', 'sourire',
  'rire', 'bisou', 'câlin', 'chéri', 'bébé', 'coeur', '❤️', '💕', '💖', '😘', '😍', '🥰'
];

const NEGATIVE_KEYWORDS = [
  'triste', 'sad', 'horrible', 'nul', 'terrible', 'affreux', 'déprimé', 'énervé',
  'colère', 'furieux', 'déteste', 'hate', 'ennuyeux', 'fatigue', 'stress', 'problème',
  'inquiet', 'peur', 'angoisse', '😢', '😭', '😠', '😡', '😞', '😔', '😰'
];

const STOP_WORDS = [
  'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
  'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
  'par', 'grand', 'celui', 'me', 'te', 'si', 'la', 'du', 'des', 'les', 'mais',
  'ou', 'où', 'donc', 'car', 'ni', 'or', 'je', 'tu', 'nous', 'vous', 'ils',
  'elles', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre',
  'votre', 'leur', 'this', 'that', 'the', 'and', 'or', 'but', 'in', 'on', 'at',
  'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
];

export class ConversationAnalytics {
  static generateTimeline(conversations: Conversation[], period: 'day' | 'week' | 'month' = 'day'): TimelineData[] {
    const dataMap = new Map<string, { messages: number; words: number }>();
    
    conversations.forEach(conv => {
      conv.messages.forEach(message => {
        const date = new Date(message.timestamp);
        let key: string;
        
        switch (period) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay());
            key = startOfWeek.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
        }
        
        const existing = dataMap.get(key) || { messages: 0, words: 0 };
        dataMap.set(key, {
          messages: existing.messages + 1,
          words: existing.words + message.content.split(' ').length
        });
      });
    });
    
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static generateHourlyActivity(conversations: Conversation[]): HourlyActivity[] {
    const hourlyCount = new Array(24).fill(0);
    
    conversations.forEach(conv => {
      conv.messages.forEach(message => {
        const hour = new Date(message.timestamp).getHours();
        hourlyCount[hour]++;
      });
    });
    
    return hourlyCount.map((count, hour) => ({ hour, count }));
  }

  static analyzeEmotions(conversations: Conversation[]): EmotionalMetrics {
    let positiveScore = 0;
    let negativeScore = 0;
    let totalEmojis = 0;
    let affectionWords = 0;
    let totalMessages = 0;
    
    conversations.forEach(conv => {
      conv.messages.forEach(message => {
        totalMessages++;
        const content = message.content.toLowerCase();
        
        // Count emojis
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = content.match(emojiRegex);
        if (emojis) totalEmojis += emojis.length;
        
        // Analyze sentiment
        POSITIVE_KEYWORDS.forEach(keyword => {
          if (content.includes(keyword.toLowerCase())) {
            positiveScore++;
            if (['amour', 'love', 'chéri', 'bébé', 'coeur'].includes(keyword.toLowerCase())) {
              affectionWords++;
            }
          }
        });
        
        NEGATIVE_KEYWORDS.forEach(keyword => {
          if (content.includes(keyword.toLowerCase())) {
            negativeScore++;
          }
        });
      });
    });
    
    const moodScore = totalMessages > 0 ? Math.round(((positiveScore - negativeScore) / totalMessages) * 100) : 0;
    
    return {
      positiveScore,
      negativeScore,
      moodScore: Math.max(-100, Math.min(100, moodScore)),
      totalEmojis,
      affectionWords
    };
  }

  static generateWordCloud(conversations: Conversation[], limit: number = 50): WordFrequency[] {
    const wordCount = new Map<string, number>();
    
    conversations.forEach(conv => {
      conv.messages.forEach(message => {
        const words = message.content
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2 && !STOP_WORDS.includes(word));
        
        words.forEach(word => {
          wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
      });
    });
    
    return Array.from(wordCount.entries())
      .map(([word, count]) => ({
        word,
        count,
        category: POSITIVE_KEYWORDS.includes(word) ? 'positive' as const :
                 NEGATIVE_KEYWORDS.includes(word) ? 'negative' as const : 'neutral' as const
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static getParticipantActivity(conversations: Conversation[]) {
    const participantStats = new Map<string, {
      messages: number;
      words: number;
      avgWordsPerMessage: number;
      emotionalScore: number;
      mostActiveHour: number;
    }>();

    conversations.forEach(conv => {
      const hourlyActivity = new Map<string, number[]>();
      
      conv.messages.forEach(message => {
        const sender = message.sender;
        const hour = new Date(message.timestamp).getHours();
        const wordCount = message.content.split(' ').length;
        const content = message.content.toLowerCase();
        
        if (!participantStats.has(sender)) {
          participantStats.set(sender, {
            messages: 0,
            words: 0,
            avgWordsPerMessage: 0,
            emotionalScore: 0,
            mostActiveHour: 0
          });
        }
        
        if (!hourlyActivity.has(sender)) {
          hourlyActivity.set(sender, new Array(24).fill(0));
        }
        
        const stats = participantStats.get(sender)!;
        const hours = hourlyActivity.get(sender)!;
        
        stats.messages++;
        stats.words += wordCount;
        hours[hour]++;
        
        // Calculate emotional score
        let emotionalPoints = 0;
        POSITIVE_KEYWORDS.forEach(keyword => {
          if (content.includes(keyword)) emotionalPoints++;
        });
        NEGATIVE_KEYWORDS.forEach(keyword => {
          if (content.includes(keyword)) emotionalPoints--;
        });
        stats.emotionalScore += emotionalPoints;
      });
      
      // Calculate averages and most active hour
      participantStats.forEach((stats, sender) => {
        stats.avgWordsPerMessage = Math.round(stats.words / stats.messages);
        
        const hours = hourlyActivity.get(sender) || [];
        stats.mostActiveHour = hours.indexOf(Math.max(...hours));
      });
    });

    return participantStats;
  }
}

// Add the missing calculateAnalytics function
export function calculateAnalytics(conversations: Conversation[]) {
  return {
    timeline: ConversationAnalytics.generateTimeline(conversations),
    hourlyActivity: ConversationAnalytics.generateHourlyActivity(conversations),
    emotionalTrends: ConversationAnalytics.analyzeEmotions(conversations),
    wordFrequency: ConversationAnalytics.generateWordCloud(conversations),
    participantStats: ConversationAnalytics.getParticipantActivity(conversations),
    totalDays: conversations.length > 0 ? Math.ceil((new Date().getTime() - new Date(conversations[0].messages[0]?.timestamp || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0
  };
}
