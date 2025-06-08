
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Smile, Frown, MessageCircle } from 'lucide-react';
import { EmotionalMetrics } from '@/utils/analytics';

interface EmotionalAnalysisProps {
  metrics: EmotionalMetrics;
}

const EmotionalAnalysis: React.FC<EmotionalAnalysisProps> = ({ metrics }) => {
  const getMoodColor = (score: number) => {
    if (score > 50) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    if (score > -50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMoodLabel = (score: number) => {
    if (score > 50) return 'Très positif';
    if (score > 20) return 'Positif';
    if (score > 0) return 'Plutôt positif';
    if (score > -20) return 'Neutre';
    if (score > -50) return 'Plutôt négatif';
    return 'Négatif';
  };

  const getMoodEmoji = (score: number) => {
    if (score > 50) return '😍';
    if (score > 20) return '😊';
    if (score > 0) return '🙂';
    if (score > -20) return '😐';
    if (score > -50) return '😔';
    return '😢';
  };

  const positivePercentage = Math.max(0, metrics.moodScore + 100) / 2;

  return (
    <Card className="spotify-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 spotify-text">
          <Heart className="h-5 w-5 text-pink-500" />
          <span>Analyse émotionnelle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score d'humeur principal */}
        <div className="text-center space-y-3">
          <div className="text-4xl">{getMoodEmoji(metrics.moodScore)}</div>
          <div className={`text-2xl font-bold ${getMoodColor(metrics.moodScore)}`}>
            {metrics.moodScore > 0 ? '+' : ''}{metrics.moodScore}
          </div>
          <Badge 
            variant="outline" 
            className={`${
              metrics.moodScore > 0 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {getMoodLabel(metrics.moodScore)}
          </Badge>
        </div>

        {/* Barre de progression émotionnelle */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="spotify-muted">Humeur générale</span>
            <span className={getMoodColor(metrics.moodScore)}>{positivePercentage.toFixed(0)}%</span>
          </div>
          <Progress value={positivePercentage} className="h-3" />
        </div>

        {/* Métriques détaillées */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Smile className="h-4 w-4 text-green-500" />
              <span className="text-sm spotify-muted">Sentiments positifs</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {metrics.positiveScore}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Frown className="h-4 w-4 text-red-500" />
              <span className="text-sm spotify-muted">Sentiments négatifs</span>
            </div>
            <div className="text-xl font-bold text-red-400">
              {metrics.negativeScore}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm spotify-muted">Mots d'affection</span>
            </div>
            <div className="text-xl font-bold text-pink-400">
              {metrics.affectionWords}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm spotify-muted">Emojis total</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">
              {metrics.totalEmojis}
            </div>
          </div>
        </div>

        {/* Ratio positif/négatif */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="text-sm spotify-muted mb-2">Ratio émotionnel</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-green-500/20 h-2 rounded-l">
              <div 
                className="bg-green-500 h-full rounded-l"
                style={{
                  width: `${(metrics.positiveScore / (metrics.positiveScore + metrics.negativeScore + 1)) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex-1 bg-red-500/20 h-2 rounded-r">
              <div 
                className="bg-red-500 h-full rounded-r ml-auto"
                style={{
                  width: `${(metrics.negativeScore / (metrics.positiveScore + metrics.negativeScore + 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionalAnalysis;
