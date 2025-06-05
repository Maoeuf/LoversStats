
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
  platform: 'whatsapp' | 'instagram' | 'discord';
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
  static parseMessages(content: string, fileName: string, platform: 'whatsapp' | 'instagram' | 'discord'): Conversation {
    console.log('Parsing content for platform:', platform);
    console.log('Content length:', content.length);
    
    const lines = content.replace(/[\r\u200E\u200F\u202A-\u202E\uFEFF]/g, '').split('\n').filter(line => line.trim());
    console.log('Number of lines:', lines.length);
    console.log('First 5 lines:', lines.slice(0, 5));
    
    const messages: Message[] = [];
    
    // Format exact: [15/05/2025, 09:40] Mehdi : message
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4})\s*,?\s*(\d{1,2}:\d{2})\]\s*([^:]+?)\s*:\s*(.+)$/;
    
    lines.forEach((line, index) => {
      console.log(`Processing line ${index}:`, line);
      
      // Skip platform headers
      if (line.trim() === '[WhatsApp]' || line.trim() === '[Insta]' || line.trim() === '[Discord]') {
        console.log('Skipping platform header:', line.trim());
        return;
      }
      console.log([...line].map(c => `${c} (${c.charCodeAt(0)})`).join(' | '));

      const match = line.match(messageRegex);
      if (match) {
        const [, dateStr, timeStr, sender, content] = match;
        console.log('Matched message:', { dateStr, timeStr, sender, content });
        
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
          console.log('Added message:', message);
        } else {
          console.log('Failed to parse timestamp or empty content:', { timestamp, content: content.trim() });
        }
      } else {
        console.log('Line did not match regex:', line);
        console.log('Regex test result:', messageRegex.test(line));
      }
    });

    console.log('Total messages parsed:', messages.length);
    return this.createConversation(messages, fileName, platform);
  }

  private static parseDateTime(dateStr: string, timeStr: string): Date | null {
    console.log('Parsing date and time:', { dateStr, timeStr });
    
    try {
      // dateStr format: "15/05/2025"
      // timeStr format: "09:40"
      const dateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, hours, minutes] = timeMatch;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        console.log('Parsed date:', date);
        return date;
      } else {
        console.log('Date or time format did not match expected pattern');
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

  private static createConversation(
    messages: Message[], 
    fileName: string, 
    platform: 'whatsapp' | 'instagram' | 'discord'
  ): Conversation {
    console.log('Creating conversation with', messages.length, 'messages');
    
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
    
    console.log('Conversation stats:', {
      messageCount: messages.length,
      wordCount,
      participants
    });
    
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

  static detectPlatform(content: string): 'whatsapp' | 'instagram' | 'discord' | 'unknown' {
    console.log('Detecting platform from content');
    
    // Check for platform header first
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      console.log('First line:', firstLine);
      
      if (firstLine === '[WhatsApp]') return 'whatsapp';
      if (firstLine === '[Insta]') return 'instagram';
      if (firstLine === '[Discord]') return 'discord';
    }

    // Fallback: if no header found, default to whatsapp since the format is the same
    const messagePattern = /^\[\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}\]\s*[^:]+\s*:/m;
    if (messagePattern.test(content)) {
      console.log('Found message pattern, defaulting to whatsapp');
      return 'whatsapp';
    }
    
    console.log('No platform detected');
    return 'unknown';
  }

  static parseFile(content: string, fileName: string): Conversation | null {
    console.log('Parsing file:', fileName);
    
    const platform = this.detectPlatform(content);
    console.log('Detected platform:', platform);
    
    switch (platform) {
      case 'whatsapp':
        return this.parseWhatsApp(content, fileName);
      case 'instagram':
        return this.parseInstagram(content, fileName);
      case 'discord':
        return this.parseDiscord(content, fileName);
      default:
        console.log('Unknown platform, cannot parse');
        return null;
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
