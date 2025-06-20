import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp } from 'lucide-react';

const TeamCard = ({
  name,
  league,
  position,
  points,
  played,
  wins,
  draws,
  losses,
  players,
}) => {
  const getPositionColor = () => {
    if (position <= 4) return 'text-green-600';
    if (position <= 6) return 'text-blue-600';
    if (position >= 18) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-1">{name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {league}
            </Badge>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPositionColor()}`}>
              #{position}
            </div>
            <div className="text-xs text-muted-foreground">Posição</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-football-gold" />
            <span className="text-sm">Pontos</span>
          </div>
          <span className="font-bold text-lg">{points}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jogos:</span>
              <span className="font-medium">{played}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Vitórias:</span>
              <span className="font-medium">{wins}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-yellow-600">Empates:</span>
              <span className="font-medium">{draws}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Derrotas:</span>
              <span className="font-medium">{losses}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">Jogadores</span>
          </div>
          <span className="font-bold">{players}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
