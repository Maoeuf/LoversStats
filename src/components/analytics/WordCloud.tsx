
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Hash } from 'lucide-react';
import { WordFrequency } from '@/utils/analytics';

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: string) => void;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, onWordClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const maxCount = Math.max(...words.map(w => w.count));
  
  const getWordSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-3xl';
    if (ratio > 0.6) return 'text-2xl';
    if (ratio > 0.4) return 'text-xl';
    if (ratio > 0.2) return 'text-lg';
    return 'text-base';
  };
  
  const getWordColor = (category: string, count: number) => {
    const opacity = Math.max(0.6, count / maxCount);
    switch (category) {
      case 'positive':
        return `text-green-400 hover:text-green-300`;
      case 'negative':
        return `text-red-400 hover:text-red-300`;
      default:
        return `text-blue-400 hover:text-blue-300`;
    }
  };

  const totalWords = words.reduce((sum, word) => sum + word.count, 0);
  const uniqueWords = words.length;
  const mostUsedWord = words[0];

  return (
    <Card className="spotify-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 spotify-text">
          <Hash className="h-5 w-5 text-blue-500" />
          <span>Nuage de mots</span>
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            📝 {uniqueWords} mots uniques
          </Badge>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            🏆 Plus utilisé : "{mostUsedWord?.word}" ({mostUsedWord?.count}x)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 spotify-muted" />
          <Input
            placeholder="Rechercher un mot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Nuage de mots */}
        <div className="min-h-[300px] p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {filteredWords.slice(0, 100).map((word, index) => (
              <button
                key={`${word.word}-${index}`}
                onClick={() => onWordClick(word.word)}
                className={`
                  ${getWordSize(word.count)} ${getWordColor(word.category, word.count)}
                  font-semibold transition-all duration-200 hover:scale-110 cursor-pointer
                  px-2 py-1 rounded-md hover:bg-zinc-800/50
                `}
                title={`"${word.word}" utilisé ${word.count} fois`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {word.word}
              </button>
            ))}
          </div>
          
          {filteredWords.length === 0 && searchTerm && (
            <div className="text-center py-12 spotify-muted">
              Aucun mot trouvé pour "{searchTerm}"
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="spotify-muted">Positif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="spotify-muted">Négatif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="spotify-muted">Neutre</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCloud;
