
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Conversation } from '@/utils/conversationParser';

const Stories: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Charger les conversations depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('loversstats');
      if (saved) {
        const parsed = JSON.parse(saved);
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
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Calculer les statistiques
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const totalWords = conversations.reduce((sum, conv) => sum + conv.wordCount, 0);
  const mostActiveConv = conversations.reduce((max, conv) => 
    conv.messageCount > (max?.messageCount || 0) ? conv : max, null);

  const slides = [
    {
      title: "Vos conversations en chiffres",
      content: "Découvrons ensemble l'histoire de vos échanges...",
      type: "intro"
    },
    {
      title: "Volume de messages",
      content: `Vous avez échangé ${totalMessages.toLocaleString()} messages ! 📱`,
      type: "stat",
      value: totalMessages.toLocaleString(),
      label: "messages totaux"
    },
    {
      title: "Mots partagés",
      content: `${totalWords.toLocaleString()} mots échangés ! 📚`,
      type: "stat",
      value: totalWords.toLocaleString(),
      label: "mots échangés"
    },
    {
      title: "Conversation la plus active",
      content: mostActiveConv ? `${mostActiveConv.customName || mostActiveConv.name} - Le record ! 🔥` : "Aucune conversation trouvée",
      type: "highlight"
    },
    {
      title: "Votre résumé",
      content: `${conversations.length} conversations analysées ! ❤️`,
      type: "conclusion"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-white text-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-1 bg-white/20" />
        </div>

        {/* Story Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white min-h-[400px] flex flex-col justify-center">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">{slides[currentSlide].title}</h2>
              
              {slides[currentSlide].type === 'stat' && slides[currentSlide].value && (
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-yellow-400">
                    {slides[currentSlide].value}
                  </div>
                  <div className="text-lg text-white/80">
                    {slides[currentSlide].label}
                  </div>
                </div>
              )}
              
              <p className="text-lg text-white/90 leading-relaxed">
                {slides[currentSlide].content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stories;
