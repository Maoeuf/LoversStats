
export interface Message {
  id: string;
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'media' | 'system';
}

export interface Conversation {
  id: string;
  name: string;
  platform: 'whatsapp' | 'instagram' | 'discord' | 'sms';
  messages: Message[];
  messageCount: number;
  wordCount: number;
  participants: string[];
  startDate: Date;
  endDate: Date;
  customName?: string;
}

export interface ConversationStats {
  totalMessages: number;
  totalWords: number;
  participants: string[];
  messagesByParticipant: Record<string, number>;
  wordsByParticipant: Record<string, number>;
}

export class ConversationParser {
  static parseMessages(content: string, fileName: string, platform: 'whatsapp' | 'instagram' | 'discord' | 'sms'): Conversation {
    console.log('Parsing content for platform:', platform);
    
    const lines = content.replace(/[\r\u200E\u200F\u202A-\u202E\uFEFF]/g, '').split('\n').filter(line => line.trim());
    const messages: Message[] = [];
    
    // Format exact: [15/05/2025, 09:40] Mehdi : message
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\]\s*([^:]+?)\s*:\s*(.+)$/;
    
    lines.forEach((line, index) => {
      // Skip platform headers
      if (line.trim() === '[WhatsApp]' || line.trim() === '[Insta]' || line.trim() === '[Discord]' || line.trim() === '[SMS]') {
        return;
      }

      const match = line.match(messageRegex);
      if (match) {
        const [, dateStr, timeStr, sender, content] = match;
        const timestamp = this.parseDateTime(dateStr, timeStr);
        
        if (timestamp && content.trim()) {
          const message = {
            id: `${platform}-${index}`,
            timestamp,
            sender: sender.trim(),
            content: content.trim(),
            type: 'text' as const
          };
          messages.push(message);
        }
      }
    });

    return this.createConversation(messages, fileName, platform);
  }

  static parseMultiFormat(content: string, fileName: string): Conversation[] {
    const lines = content.replace(/[\r\u200E\u200F\u202A-\u202E\uFEFF]/g, '').split('\n');
    const conversations: Conversation[] = [];
    
    const sectionRegex = /^\[(\w+)\]\(([^)]+)\)$/;
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\]\s*([^:]+?)\s*:\s*(.+)$/;
    
    let currentSection: { platform: string; name: string } | null = null;
    let currentMessages: Message[] = [];
    let messageIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line === '[Multi]') {
        continue;
      }
      
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        if (currentSection && currentMessages.length > 0) {
          const platform = this.mapPlatformName(currentSection.platform);
          const conversation = this.createConversation(currentMessages, currentSection.name, platform);
          conversation.customName = currentSection.name;
          conversations.push(conversation);
        }
        
        currentSection = {
          platform: sectionMatch[1],
          name: sectionMatch[2]
        };
        currentMessages = [];
        continue;
      }
      
      if (currentSection) {
        const messageMatch = line.match(messageRegex);
        if (messageMatch) {
          const [, dateStr, timeStr, sender, content] = messageMatch;
          const timestamp = this.parseDateTime(dateStr, timeStr);
          
          if (timestamp && content.trim()) {
            const message = {
              id: `${currentSection.platform}-${messageIndex++}`,
              timestamp,
              sender: sender.trim(),
              content: content.trim(),
              type: 'text' as const
            };
            currentMessages.push(message);
          }
        }
      }
    }
    
    if (currentSection && currentMessages.length > 0) {
      const platform = this.mapPlatformName(currentSection.platform);
      const conversation = this.createConversation(currentMessages, currentSection.name, platform);
      conversation.customName = currentSection.name;
      conversations.push(conversation);
    }
    
    return conversations;
  }

  static mapPlatformName(platformName: string): 'whatsapp' | 'instagram' | 'discord' | 'sms' {
    const normalized = platformName.toLowerCase();
    if (normalized === 'whatsapp') return 'whatsapp';
    if (normalized === 'insta' || normalized === 'instagram') return 'instagram';
    if (normalized === 'discord') return 'discord';
    if (normalized === 'sms') return 'sms';
    return 'whatsapp'; // default fallback
  }

  private static parseDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      const dateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, hours, minutes] = timeMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      }
    } catch (error) {
      console.error('Error parsing date:', { dateStr, timeStr }, error);
    }
    
    return null;
  }

  static parseWhatsApp(content: string, fileName: string): Conversation {
    return this.parseMessages(content, fileName, 'whatsapp');
  }

  static parseInstagram(content: string, fileName: string): Conversation {
    return this.parseMessages(content, fileName, 'instagram');
  }

  static parseDiscord(content: string, fileName: string): Conversation {
    return this.parseMessages(content, fileName, 'discord');
  }

  static parseSMS(content: string, fileName: string): Conversation {
    return this.parseMessages(content, fileName, 'sms');
  }

  private static createConversation(
    messages: Message[], 
    fileName: string, 
    platform: 'whatsapp' | 'instagram' | 'discord' | 'sms'
  ): Conversation {
    if (messages.length === 0) {
      return {
        id: fileName,
        name: fileName.replace(/\.[^/.]+$/, ''),
        platform,
        messages: [],
        messageCount: 0,
        wordCount: 0,
        participants: [],
        startDate: new Date(),
        endDate: new Date()
      };
    }

    const participants = [...new Set(messages.map(m => m.sender))];
    const wordCount = messages.reduce((total, msg) => total + msg.content.split(/\s+/).length, 0);
    
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      id: fileName,
      name: fileName.replace(/\.[^/.]+$/, ''),
      platform,
      messages,
      messageCount: messages.length,
      wordCount,
      participants,
      startDate: messages[0].timestamp,
      endDate: messages[messages.length - 1].timestamp
    };
  }

  static detectPlatform(content: string): 'whatsapp' | 'instagram' | 'discord' | 'sms' | 'multi' | 'unknown' {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      if (firstLine === '[Multi]') return 'multi';
      if (firstLine === '[WhatsApp]') return 'whatsapp';
      if (firstLine === '[Insta]') return 'instagram';
      if (firstLine === '[Discord]') return 'discord';
      if (firstLine === '[SMS]') return 'sms';
    }

    const messagePattern = /^\[\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}\]\s*[^:]+\s*:/m;
    if (messagePattern.test(content)) {
      return 'whatsapp';
    }
    
    return 'unknown';
  }

  static parseFile(content: string, fileName: string): Conversation[] {
    const platform = this.detectPlatform(content);
    
    switch (platform) {
      case 'multi':
        return this.parseMultiFormat(content, fileName);
      case 'whatsapp':
        return [this.parseWhatsApp(content, fileName)];
      case 'instagram':
        return [this.parseInstagram(content, fileName)];
      case 'discord':
        return [this.parseDiscord(content, fileName)];
      case 'sms':
        return [this.parseSMS(content, fileName)];
      default:
        return [];
    }
  }

  static calculateStats(conversation: Conversation): ConversationStats {
    const messagesByParticipant: Record<string, number> = {};
    const wordsByParticipant: Record<string, number> = {};

    conversation.messages.forEach(message => {
      messagesByParticipant[message.sender] = (messagesByParticipant[message.sender] || 0) + 1;
      const words = message.content.split(/\s+/).length;
      wordsByParticipant[message.sender] = (wordsByParticipant[message.sender] || 0) + words;
    });

    return {
      totalMessages: conversation.messageCount,
      totalWords: conversation.wordCount,
      participants: conversation.participants,
      messagesByParticipant,
      wordsByParticipant
    };
  }
}
