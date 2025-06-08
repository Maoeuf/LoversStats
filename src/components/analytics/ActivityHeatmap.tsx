
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HourlyActivity } from '@/utils/analytics';

interface ActivityHeatmapProps {
  data: HourlyActivity[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const maxActivity = Math.max(...data.map(d => d.count));
  
  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-zinc-800';
    const intensity = count / maxActivity;
    if (intensity > 0.8) return 'bg-green-500';
    if (intensity > 0.6) return 'bg-green-400';
    if (intensity > 0.4) return 'bg-green-300';
    if (intensity > 0.2) return 'bg-green-200';
    return 'bg-green-100';
  };

  const getTextColor = (count: number) => {
    const intensity = count / maxActivity;
    return intensity > 0.4 ? 'text-black' : 'text-white';
  };

  const mostActiveHour = data.reduce((max, current) => 
    current.count > max.count ? current : max
  );

  return (
    <Card className="spotify-card">
      <CardHeader>
        <CardTitle className="spotify-text">Heatmap d'activité</CardTitle>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 w-fit">
          🔥 Pic d'activité : {mostActiveHour.hour}h ({mostActiveHour.count} messages)
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {data.map((item) => (
            <div
              key={item.hour}
              className={`
                h-12 rounded-lg flex flex-col items-center justify-center text-xs font-medium
                transition-all duration-300 hover:scale-105 cursor-pointer
                ${getIntensity(item.count)} ${getTextColor(item.count)}
              `}
              title={`${item.hour}h: ${item.count} messages`}
            >
              <div className="text-[10px]">{item.hour}h</div>
              <div className="text-[8px]">{item.count}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs spotify-muted">
          <span>0h</span>
          <span>Moins actif</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-zinc-800 rounded"></div>
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
          </div>
          <span>Plus actif</span>
          <span>23h</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
