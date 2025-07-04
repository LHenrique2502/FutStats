import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Users,
  Target,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const MatchDetails = () => {
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`${API_URL}partida/${id}/`)
      .then((response) => {
        console.log('Dados recebidos:', response.data);
        setMatchData(response.data);
        console.log('Estado atualizado:', response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados da partida:', error);
      });
  }, [id]);

  const [matchData, setMatchData] = useState(null);

  const getCardIcon = (type) => {
    return type === 'yellow' ? '🟨' : '🟥';
  };

  if (!matchData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg animate-pulse">
          Carregando partida...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Botão de Voltar */}
        <div className="animate-fade-in-up">
          <Link
            to="/jogos"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Jogos</span>
          </Link>
        </div>

        {/* Cabeçalho da Partida */}
        <Card className="card-responsive">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Badge variant="outline" className="text-xs">
                {matchData.league}
              </Badge>
              <Badge className="bg-green-600 text-white text-xs">
                FINALIZADO
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <div className="font-bold text-2xl mb-2">
                  {matchData.homeTeam}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <img
                    src={matchData.home_logo}
                    alt={`${matchData.home_logo} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>

              <div className="text-center px-8">
                <div className="text-5xl font-bold mb-2">
                  {matchData.homeScore} - {matchData.awayScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  PLACAR FINAL
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="font-bold text-2xl mb-2">
                  {matchData.awayTeam}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <img
                    src={matchData.away_logo}
                    alt={`${matchData.away_logo} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-medium">Data</div>
                <div>{matchData.date}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Estádio</div>
                <div>{matchData.stadium}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Árbitro</div>
                <div>{matchData.referee}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Público</div>
                <div>{matchData.attendance}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abas com Detalhes */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Eventos da Partida</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="grid w-full grid-cols-3">
            {/* Gols */}
            <Card className="card-responsive m-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Target className="h-5 w-5" />
                  <span>Gols</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{goal.player}</div>
                        <div className="text-sm text-muted-foreground">
                          {goal.team === 'home'
                            ? matchData.homeTeam
                            : matchData.awayTeam}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{goal.minute}'</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cartões */}
            <Card className="card-responsive m-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Cartões</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchData.cards.map((card, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{getCardIcon(card.type)}</div>
                      <div>
                        <div className="font-medium">{card.player}</div>
                        <div className="text-sm text-muted-foreground">
                          {card.team === 'home'
                            ? matchData.homeTeam
                            : matchData.awayTeam}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{card.minute}'</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Substituições */}
            <Card className="card-responsive m-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Activity className="h-5 w-5" />
                  <span>Substituições</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchData.substitutions.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          <span className="text-red-500">
                            ↓ {sub.playerOut}
                          </span>
                          {' → '}
                          <span className="text-green-500">
                            ↑ {sub.playerIn}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sub.team === 'home'
                            ? matchData.homeTeam
                            : matchData.awayTeam}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{sub.minute}'</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <BarChart3 className="h-5 w-5" />
                    <span>Posse de Bola</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{matchData.homeTeam}</span>
                      <span className="text-2xl font-bold">
                        {matchData.stats.possession.home}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full"
                        style={{
                          width: `${matchData.stats.possession.home}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{matchData.awayTeam}</span>
                      <span className="text-2xl font-bold">
                        {matchData.stats.possession.away}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Target className="h-5 w-5" />
                    <span>Finalizações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{matchData.homeTeam}</div>
                        <div className="text-sm text-muted-foreground">
                          {matchData.stats.shotsOnTarget.home} no alvo
                        </div>
                      </div>
                      <span className="text-2xl font-bold">
                        {matchData.stats.shots.home}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{matchData.awayTeam}</div>
                        <div className="text-sm text-muted-foreground">
                          {matchData.stats.shotsOnTarget.away} no alvo
                        </div>
                      </div>
                      <span className="text-2xl font-bold">
                        {matchData.stats.shots.away}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Detalhadas */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Estatísticas Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    {
                      label: 'Escanteios',
                      home: matchData.stats.corners.home,
                      away: matchData.stats.corners.away,
                    },
                    {
                      label: 'Faltas',
                      home: matchData.stats.fouls.home,
                      away: matchData.stats.fouls.away,
                    },
                    {
                      label: 'Impedimentos',
                      home: matchData.stats.offsides.home,
                      away: matchData.stats.offsides.away,
                    },
                    {
                      label: 'Passes',
                      home: matchData.stats.passes.home,
                      away: matchData.stats.passes.away,
                    },
                    {
                      label: 'Precisão de Passes',
                      home: `${matchData.stats.passAccuracy.home}%`,
                      away: `${matchData.stats.passAccuracy.away}%`,
                    },
                    {
                      label: 'Desarmes',
                      home: matchData.stats.tackles.home,
                      away: matchData.stats.tackles.away,
                    },
                    {
                      label: 'Duelos Aéreos',
                      home: matchData.stats.aerialDuels.home,
                      away: matchData.stats.aerialDuels.away,
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="text-right w-20">
                        <span className="font-bold">{stat.home}</span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-sm font-medium">
                          {stat.label}
                        </span>
                      </div>
                      <div className="text-left w-20">
                        <span className="font-bold">{stat.away}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MatchDetails;
