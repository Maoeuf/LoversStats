import React, { useState, useCallback, useEffect } from "react";
import { BarChart3, MessagesSquare, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import ConversationList from "@/components/ConversationList";
import ConversationDetail from "@/components/ConversationDetail";
import GlobalSearch from "@/components/GlobalSearch";
import TouchGestures from "@/components/TouchGestures";
import { ConversationParser, Conversation } from "@/utils/conversationParser";
import AppMenu from "@/components/AppMenu";
import { Header } from "@radix-ui/react-accordion";

const STORAGE_KEY = "loversstats";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageExporterOpen, setMessageExporterOpen] = useState(false);
  const { toast } = useToast();

  // Load conversations from localStorage on startup
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY);
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const restoredConversations = parsed.map((conv: any) => ({
          ...conv,
          startDate: new Date(conv.startDate),
          endDate: new Date(conv.endDate),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setConversations(restoredConversations);
      } catch (error) {
        console.error("Error restoring conversations:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const mergeParticipants = useCallback(
    (conversation: Conversation): Conversation => {
      const mergedMessages = conversation.messages.map((message) => {
        let newSender = message.sender;

        if (
          (newSender.toLowerCase().includes("jas") ||
            newSender.includes("Jas")) &&
          newSender !== "Jas"
        ) {
          newSender = "Jas";
        }

        if (
          (newSender.toLowerCase().includes("mao") ||
            newSender.includes("Mao")) &&
          newSender !== "Mao" &&
          newSender !== "Meta AI"
        ) {
          newSender = "Mao";
        }

        return { ...message, sender: newSender };
      });

      const uniqueParticipants = [
        ...new Set(mergedMessages.map((msg) => msg.sender)),
      ];

      return {
        ...conversation,
        messages: mergedMessages,
        participants: uniqueParticipants,
      };
    },
    []
  );

  const isDuplicateConversation = useCallback(
    (newConv: Conversation) => {
      return conversations.some(
        (existingConv) =>
          existingConv.name === newConv.name &&
          existingConv.platform === newConv.platform &&
          existingConv.messageCount === newConv.messageCount &&
          Math.abs(
            new Date(existingConv.startDate).getTime() -
              new Date(newConv.startDate).getTime()
          ) < 86400000
      );
    },
    [conversations]
  );

  const handleFilesUploaded = useCallback(
    (files: Array<{ name: string; content: string }>) => {
      let addedCount = 0;
      let duplicateCount = 0;

      files.forEach((file) => {
        try {
          const newConversations = ConversationParser.parseFile(
            file.content,
            file.name
          );
          newConversations.forEach((newConversation) => {
            const mergedConversation = mergeParticipants(newConversation);

            if (!isDuplicateConversation(mergedConversation)) {
              setConversations((prev) => [...prev, mergedConversation]);
              addedCount++;
            } else {
              duplicateCount++;
            }
          });
          setError("");
        } catch (error) {
          console.error("Error processing file:", error);
          setError(
            `Error processing file ${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      });

      if (addedCount > 0) {
        toast({
          title: "Fichiers chargés",
          description: `${addedCount} conversation(s) ajoutée(s)${
            duplicateCount > 0 ? ` (${duplicateCount} doublons ignorés)` : ""
          }`,
          duration: 5000,
        });
      } else if (duplicateCount > 0) {
        toast({
          title: "Aucune nouvelle conversation",
          description: "Toutes les conversations étaient déjà importées",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    [mergeParticipants, isDuplicateConversation, toast]
  );

  const handleFileInput = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".txt,.lov";

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const validFiles: Array<{ name: string; content: string }> = [];

        for (const file of Array.from(files)) {
          if (
            file.type === "text/plain" ||
            file.name.endsWith(".txt") ||
            file.name.endsWith(".lov")
          ) {
            try {
              const content = await file.text();
              validFiles.push({ name: file.name, content });
            } catch (error) {
              toast({
                title: "Erreur de lecture",
                description: `Impossible de lire le fichier ${file.name}`,
                variant: "destructive",
                duration: 5000,
              });
            }
          }
        }

        if (validFiles.length > 0) {
          handleFilesUploaded(validFiles);
        }
      }
    };

    input.click();
  }, [handleFilesUploaded, toast]);

  const handleConversationSelect = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const handleConversationRename = useCallback(
    (conversationId: string, newName: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, customName: newName } : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, customName: newName } : null
        );
      }
    },
    [selectedConversation]
  );

  const handleConversationDelete = useCallback(
    (conversationId: string) => {
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    },
    [selectedConversation]
  );

  const handleClearAll = useCallback(() => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible."
      )
    ) {
      setConversations([]);
      setSelectedConversation(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  const handleSearchResultSelect = useCallback(
    (result: any) => {
      const conversation = conversations.find(
        (conv) => conv.id === result.conversationId
      );
      if (conversation) {
        setSelectedConversation(conversation);
      }
    },
    [conversations]
  );

  const handleSwipeLeft = useCallback(() => {
    if (selectedConversation) {
      const currentIndex = conversations.findIndex(
        (conv) => conv.id === selectedConversation.id
      );
      const nextIndex = (currentIndex + 1) % conversations.length;
      setSelectedConversation(conversations[nextIndex]);
    }
  }, [selectedConversation, conversations]);

  const handleSwipeRight = useCallback(() => {
    if (selectedConversation) {
      const currentIndex = conversations.findIndex(
        (conv) => conv.id === selectedConversation.id
      );
      const prevIndex =
        currentIndex === 0 ? conversations.length - 1 : currentIndex - 1;
      setSelectedConversation(conversations[prevIndex]);
    }
  }, [selectedConversation, conversations]);

  // Calculate totals
  const totalMessages = conversations.reduce(
    (sum, conv) => sum + conv.messageCount,
    0
  );
  const totalWords = conversations.reduce(
    (sum, conv) => sum + conv.wordCount,
    0
  );
  const hasConversations = conversations.length > 0;

  if (selectedConversation) {
    return (
      <TouchGestures
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="min-h-screen bg-background"
      >
        <div className="container mx-auto p-2 sm:p-4">
          <ConversationDetail
            conversation={selectedConversation}
            onBack={handleBack}
          />
        </div>
      </TouchGestures>
    );
  }

  return (
    <div className="min-h-screen bg-background select-none">
      {/* Header avec gradient */}
      <div className="header-gradient border-b border-border">
        <div className="container mx-auto px-2 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6">
          {/* Title and Menu */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center ml-3 mt-2 gap-3">
              <img
                src="/favicon.ico"
                draggable="false"
                alt="Logo"
                className="select-none w-10 h-10 sm:w-12 sm:h-12"
              />
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
                  LoversStats
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Jas la plus belle..
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasConversations && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="bg-black/20 border-white/20 text-white hover:bg-black/30"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
              <AppMenu />
            </div>
          </div>

          {/* Global statistics */}
          {hasConversations && (
            <div className="grid mx-3 grid-cols-2 gap-2 sm:gap-3">
              <Card className="border border-border">
                <CardContent className="p-2 sm:p-3 flex items-center">
                  <div className="p-1.5 sm:p-2 bg-violet-500/20 rounded-lg mr-2 sm:mr-3">
                    <MessagesSquare className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Messages totaux
                    </p>
                    <div className="text-sm sm:text-lg font-bold text-foreground">
                      {totalMessages.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-2 sm:p-3 flex items-center">
                  <div className="p-1.5 sm:p-2 bg-pink-500/20 rounded-lg mr-2 sm:mr-3">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mots échangés
                    </p>
                    <div className="text-sm sm:text-lg font-bold text-foreground">
                      {totalWords.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container justify-center px-2 sm:px-4 py-3 sm:py-4 space-y-4 sm:space-y-6 no-scrollbar overflow-y-auto">
        {/* Import zone (only when no conversations) */}
        {!hasConversations && (
          <div className="mx-auto">
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/20 max-w-lg mx-auto">
            <AlertDescription className="text-destructive-foreground text-xs sm:text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          onConversationSelect={handleConversationSelect}
          onConversationRename={handleConversationRename}
          onConversationDelete={handleConversationDelete}
        />
      </div>

      {/* Add conversation button (only when conversations exist) */}
      {hasConversations && (
        <div className="fixed bottom-[80px] sm:bottom-[50%] right-[-5px] sm:left-[-5px] z-50 pointer-events-none">
          <Button
            variant="default"
            onClick={handleFileInput}
            className="pl-3 pr-4 sm:pl-4 sm:pr-3 pointer-events-auto"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      {/* Delete all button (only when conversations exist) */}
      {hasConversations && (
        <div className="fixed bottom-[30px] sm:bottom-[50%] right-[-5px] z-50 pointer-events-none">
          <Button
            variant="default"
            onClick={handleClearAll}
            className="pl-3 pr-4 pointer-events-auto"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      {/* Global Search */}
      <GlobalSearch
        conversations={conversations}
        onResultSelect={handleSearchResultSelect}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};

export default Index;
