
import React, { useState } from 'react';
import { MessageSquare, BarChart3, FileText, Weight } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ConversationList from '@/components/ConversationList';
import ConversationDetail from '@/components/ConversationDetail';
import { Conversation, ConversationParser } from '@/utils/conversationParser';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  const handleFilesUploaded = async (files: Array<{ name: string; content: string }>) => {
    const newConversations: Conversation[] = [];
    
    for (const file of files) {
      const parsedConversations = ConversationParser.parseFile(file.content, file.name);
      if (parsedConversations.length > 0) {
        newConversations.push(...parsedConversations);
      } else {
        toast({
          title: "Format non reconnu",
          description: `Impossible de parser le fichier ${file.name}. Vérifiez le format.`,
          variant: "destructive"
        });
      }
    }

    if (newConversations.length > 0) {
      setConversations(prev => [...prev, ...newConversations]);
      
      const fileCount = files.length;
      const convCount = newConversations.length;
      toast({
        title: "Conversations chargées",
        description: `${convCount} conversation(s) chargée(s) depuis ${fileCount} fichier(s)`
      });
    }
  };


  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationRename = (conversationId: string, newName: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, customName: newName }
          : conv
      )
    );
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => 
        prev ? { ...prev, customName: newName } : null
      );
    }

    toast({
      title: "Conversation renommée",
      description: `La conversation a été renommée en "${newName}"`
    });
  };

  const handleConversationDelete = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }

    toast({
      title: "Conversation supprimée",
      description: "La conversation a été supprimée avec succès"
    });
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const totalWords = conversations.reduce((sum, conv) => sum + conv.wordCount, 0);

  const gitCommit = import.meta.env.VITE_GIT_COMMIT || 'dev';
  console.log("Git commit:", import.meta.env.VITE_GIT_COMMIT);

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ConversationDetail 
            conversation={selectedConversation} 
            onBack={handleBack} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Git commit reference in top right */}
      <div className="absolute top-4 right-4 z-10">
        <span className="spotify-muted text-xs">
          {gitCommit.substring(0, 7)}
        </span>
      </div>
      {/* Spotify-style gradient header */}
      <div className="spotify-gradient">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-8 mb-6">
              <img src='https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png' width={150}></img>
              <div>
                <h1 className="text-5xl font-bold spotify-text">
                  LoversStats
                </h1>
                <p className="text-xl spotify-muted mt-2">
                  Jas la plus belle..
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {conversations.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="spotify-card rounded-xl p-6 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm spotify-muted mb-1">Messages</p>
                    <p className="text-2xl font-bold spotify-text">
                      {totalMessages.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="spotify-card rounded-xl p-6 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm spotify-muted mb-1">Mots</p>
                    <p className="text-2xl font-bold spotify-text">
                      {totalWords.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="spotify-card rounded-xl p-6 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm spotify-muted mb-1">Conversations</p>
                    <p className="text-2xl font-bold spotify-text">
                      {conversations.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="mx-auto gap-4 w-[30rem]">
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
          
          {conversations.length > 0 && (
            <ConversationList 
              conversations={conversations} 
              onConversationSelect={handleConversationSelect}
              onConversationRename={handleConversationRename}
              onConversationDelete={handleConversationDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
