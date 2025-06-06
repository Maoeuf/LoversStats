
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
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\]\s*([^:]+?)\s*:\s*(.+)$/;
    
    lines.forEach((line, index) => {
      console.log(`Processing line ${index}:`, line);
      
      // Skip platform headers
      if (line.trim() === '[WhatsApp]' || line.trim() === '[Insta]' || line.trim() === '[Discord]') {
        console.log('Skipping platform header:', line.trim());
        return;
      }

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
      }
    });

    console.log('Total messages parsed:', messages.length);
    return this.createConversation(messages, fileName, platform);
  }

  static parseMultiFormat(content: string, fileName: string): Conversation[] {
    console.log('Parsing multi-format file:', fileName);
    
    const lines = content.replace(/[\r\u200E\u200F\u202A-\u202E\uFEFF]/g, '').split('\n');
    const conversations: Conversation[] = [];
    
    // Pattern pour détecter les sections de conversation: [Platform](Name)
    const sectionRegex = /^\[(\w+)\]\(([^)]+)\)$/;
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\]\s*([^:]+?)\s*:\s*(.+)$/;
    
    let currentSection: { platform: string; name: string } | null = null;
    let currentMessages: Message[] = [];
    let messageIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and [Multi] header
      if (!line || line === '[Multi]') {
        continue;
      }
      
      // Check if it's a new section header
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        // Save previous section if it exists
        if (currentSection && currentMessages.length > 0) {
          const platform = this.mapPlatformName(currentSection.platform);
          const conversation = this.createConversation(
            currentMessages, 
            `${currentSection.name}`, 
            platform
          );
          conversation.customName = currentSection.name;
          conversations.push(conversation);
        }
        
        // Start new section
        currentSection = {
          platform: sectionMatch[1],
          name: sectionMatch[2]
        };
        currentMessages = [];
        console.log('Started new section:', currentSection);
        continue;
      }
      
      // Try to parse as message if we're in a section
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
            console.log('Added message to section:', message);
          }
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection && currentMessages.length > 0) {
      const platform = this.mapPlatformName(currentSection.platform);
      const conversation = this.createConversation(
        currentMessages, 
        `${currentSection.name}`, 
        platform
      );
      conversation.customName = currentSection.name;
      conversations.push(conversation);
    }
    
    console.log(`Parsed ${conversations.length} conversations from multi-format file`);
    return conversations;
  }

  static mapPlatformName(platformName: string): 'whatsapp' | 'instagram' | 'discord' {
    const normalized = platformName.toLowerCase();
    if (normalized === 'whatsapp') return 'whatsapp';
    if (normalized === 'insta' || normalized === 'instagram') return 'instagram';
    if (normalized === 'discord') return 'discord';
    return 'whatsapp'; // default fallback
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

  static detectPlatform(content: string): 'whatsapp' | 'instagram' | 'discord' | 'multi' | 'unknown' {
    console.log('Detecting platform from content');
    
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      console.log('First line:', firstLine);
      
      // Check for multi-format first
      if (firstLine === '[Multi]') return 'multi';
      
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

  static parseFile(content: string, fileName: string): Conversation[] {
    console.log('Parsing file:', fileName);
    
    const platform = this.detectPlatform(content);
    console.log('Detected platform:', platform);
    
    switch (platform) {
      case 'multi':
        return this.parseMultiFormat(content, fileName);
      case 'whatsapp':
        return [this.parseWhatsApp(content, fileName)];
      case 'instagram':
        return [this.parseInstagram(content, fileName)];
      case 'discord':
        return [this.parseDiscord(content, fileName)];
      default:
        console.log('Unknown platform, cannot parse');
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
