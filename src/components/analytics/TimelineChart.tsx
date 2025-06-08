
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimelineData } from '@/utils/analytics';

interface TimelineChartProps {
  data: TimelineData[];
  period: 'day' | 'week' | 'month';
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
}

const chartConfig = {
  messages: {
    label: 'Messages',
    color: '#1ed760',
  },
  words: {
    label: 'Mots',
    color: '#1db954',
  },
};

const TimelineChart: React.FC<TimelineChartProps> = ({ data, period, onPeriodChange }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'week':
        return `S${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      default:
        return dateStr;
    }
  };

  const maxMessages = Math.max(...data.map(d => d.messages));
  const maxWords = Math.max(...data.map(d => d.words));

  return (
    <Card className="spotify-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="spotify-text">Activité temporelle</CardTitle>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'default' : 'outline'}
                onClick={() => onPeriodChange(p)}
                className={period === p ? 'spotify-button' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            📈 {data.reduce((sum, d) => sum + d.messages, 0)} messages total
          </Badge>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            📝 {data.reduce((sum, d) => sum + d.words, 0)} mots total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis yAxisId="messages" orientation="left" stroke="#1ed760" fontSize={12} />
              <YAxis yAxisId="words" orientation="right" stroke="#1db954" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="messages"
                type="monotone"
                dataKey="messages"
                stroke="#1ed760"
                strokeWidth={3}
                dot={{ fill: '#1ed760', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1ed760', strokeWidth: 2 }}
              />
              <Line
                yAxisId="words"
                type="monotone"
                dataKey="words"
                stroke="#1db954"
                strokeWidth={3}
                dot={{ fill: '#1db954', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1db954', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;
