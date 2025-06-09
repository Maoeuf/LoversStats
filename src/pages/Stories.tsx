
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, Heart, Star, Zap } from 'lucide-react';
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

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentSlide < slides.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentSlide === slides.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentSlide]);

  // Calculer les statistiques
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const totalWords = conversations.reduce((sum, conv) => sum + conv.wordCount, 0);
  const mostActiveConv = conversations.reduce((max, conv) => 
    conv.messageCount > (max?.messageCount || 0) ? conv : max, null);
  
  const averageMessagesPerDay = conversations.length > 0 
    ? Math.round(totalMessages / conversations.length / 30) 
    : 0;
  
  const longestConversation = conversations.reduce((max, conv) => {
    const duration = new Date(conv.endDate).getTime() - new Date(conv.startDate).getTime();
    const maxDuration = max ? new Date(max.endDate).getTime() - new Date(max.startDate).getTime() : 0;
    return duration > maxDuration ? conv : max;
  }, null);

  const participantCount = new Set(conversations.flatMap(conv => conv.participants)).size;

  const slides = [
    {
      title: "Bienvenue dans vos Stories",
      content: "Découvrons ensemble l'histoire de vos conversations...",
      type: "intro",
      icon: <Heart className="h-16 w-16 mx-auto mb-4 text-pink-500" />,
      gradient: "from-pink-500 to-purple-600"
    },
    {
      title: "Volume de messages",
      content: `Incroyable ! Vous avez échangé ${totalMessages.toLocaleString()} messages`,
      subtitle: "Chaque message raconte une histoire",
      type: "stat",
      value: totalMessages.toLocaleString(),
      label: "messages échangés",
      icon: <Zap className="h-12 w-12 mx-auto mb-2 text-yellow-500" />,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "Mots partagés",
      content: `${totalWords.toLocaleString()} mots ont tissé vos liens`,
      subtitle: "L'équivalent d'un roman entier !",
      type: "stat",
      value: totalWords.toLocaleString(),
      label: "mots échangés",
      icon: <Star className="h-12 w-12 mx-auto mb-2 text-blue-500" />,
      gradient: "from-blue-400 to-indigo-600"
    },
    {
      title: "Conversation la plus active",
      content: mostActiveConv ? 
        `"${mostActiveConv.customName || mostActiveConv.name}" remporte la palme !` : 
        "Aucune conversation trouvée",
      subtitle: mostActiveConv ? `${mostActiveConv.messageCount.toLocaleString()} messages` : "",
      type: "highlight",
      icon: <Heart className="h-12 w-12 mx-auto mb-2 text-red-500" />,
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "Vos habitudes",
      content: `${averageMessagesPerDay} messages par jour en moyenne`,
      subtitle: `Avec ${participantCount} personnes différentes`,
      type: "habit",
      icon: <Star className="h-12 w-12 mx-auto mb-2 text-green-500" />,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Votre bilan",
      content: `${conversations.length} conversations analysées avec amour`,
      subtitle: "Merci de faire vivre vos relations !",
      type: "conclusion",
      icon: <Heart className="h-12 w-12 mx-auto mb-2 text-purple-500" />,
      gradient: "from-purple-400 to-pink-500"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchEnd(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const progress = ((currentSlide + 1) / slides.length) * 100;
  const currentGradient = slides[currentSlide]?.gradient || "from-purple-900 to-blue-900";

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Heart className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucune story disponible</h2>
          <p className="mb-4">Importez des conversations pour créer vos stories</p>
          <Button onClick={() => navigate('/')} variant="outline" className="text-white border-white">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentGradient} flex items-center justify-center p-4 transition-all duration-1000 relative`}>
      {/* Navigation arrows for desktop */}
      <div className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="lg"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white hover:bg-white/20 disabled:opacity-50 h-16 w-16 rounded-full"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>

      <div className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="lg"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-white hover:bg-white/20 disabled:opacity-50 h-16 w-16 rounded-full"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

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
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="text-white text-sm font-medium">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Story Card */}
        <Card 
          className="bg-white/10 backdrop-blur-lg border-white/20 text-white min-h-[500px] flex flex-col justify-center shadow-2xl cursor-pointer md:cursor-default"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            if (window.innerWidth < 768) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const width = rect.width;
              
              if (x < width / 2 && currentSlide > 0) {
                prevSlide();
              } else if (x > width / 2 && currentSlide < slides.length - 1) {
                nextSlide();
              }
            }
          }}
        >
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              {/* Icon */}
              {slides[currentSlide].icon}
              
              <h2 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h2>
              
              {slides[currentSlide].type === 'stat' && slides[currentSlide].value && (
                <div className="space-y-4">
                  <div className="text-5xl font-bold text-white animate-pulse">
                    {slides[currentSlide].value}
                  </div>
                  <div className="text-lg text-white/80">
                    {slides[currentSlide].label}
                  </div>
                </div>
              )}
              
              <p className="text-xl text-white/90 leading-relaxed font-medium">
                {slides[currentSlide].content}
              </p>
              
              {slides[currentSlide].subtitle && (
                <p className="text-lg text-white/70 italic">
                  {slides[currentSlide].subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile navigation hint */}
        <div className="md:hidden text-center text-white/60 text-sm mt-4">
          Tapez à gauche ou à droite pour naviguer
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
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
