import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import MatchCard from '@/components/MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import axios from 'axios';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Index = () => {
  const [stats, setStats] = useState({
    total_jogos: 0,
    total_ligas: 0,
    total_times: 0,
    total_jogadores: 0,
    total_analises: 0,
    crescimento_jogos: 0,
    crescimento_times: 0,
    crescimento_jogadores: 0,
  });

  useEffect(() => {
    console.log('API URL em produção:', process.env.REACT_APP_API_URL_BACK);
    axios
      .get(`${API_URL_BACK}estatisticas/`)
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error('Erro ao carregar estatísticas:', error);
      });
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dados importados pela api
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL_BACK}ultimas_partidas/`)
      .then((response) => {
        const matches = response.data.map((match) => ({
          matchId: match.id,
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          homeLogo: match.home_logo,
          awayLogo: match.away_logo,
          homeScore: match.home_score,
          awayScore: match.away_score,
          date: match.date,
          stadium: match.stadium,
          league: match.league,
          status: match.status,
        }));
        setRecentMatches(matches);
      })
      .catch((error) => console.error('Erro ao carregar os jogos:', error));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 space-y-8 px-4">
        {/* Cabeçalho da Dashboard */}
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Dashboard de Análises
            </h2>
            <p className="text-base text-muted-foreground">
              Bem-vindo ao sistema de análise de futebol
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentTime.toLocaleDateString('pt-BR')} às{' '}
              {currentTime.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas - Grid restaurado */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <StatsCard
            title="Total de Jogos"
            value={stats.total_jogos}
            icon={Trophy}
            description={`${stats.crescimento_jogos >= 0 ? '+' : ''}${
              stats.crescimento_jogos
            }% este mês`}
            trend={stats.crescimento_jogos >= 0 ? 'up' : 'down'}
            href="/jogos"
          />
          <StatsCard
            title="Times Cadastrados"
            value={stats.total_times}
            icon={Users}
            description={`${stats.crescimento_times >= 0 ? '+' : ''}${
              stats.crescimento_times
            }% este mês`}
            trend={stats.crescimento_times >= 0 ? 'up' : 'down'}
            href="/times"
          />
          <StatsCard
            title="Jogadores"
            value={stats.total_jogadores}
            icon={Activity}
            description={`${stats.crescimento_jogadores >= 0 ? '+' : ''}${
              stats.crescimento_jogadores
            }% este mês`}
            trend={stats.crescimento_jogadores >= 0 ? 'up' : 'down'}
            href="/jogadores"
          />
          <StatsCard
            title="Análises Realizadas"
            value={stats.total_analises}
            icon={BarChart3}
            description="+23% este mês"
            trend="up"
            href="/scouts"
          />
        </div>

        {/* Seção de Jogos Recentes - Grid restaurado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-slide-in-right">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  <span>Jogos Recentes e Próximos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="space-y-6 animate-slide-in-right">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  <span>Estatísticas Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-foreground">
                      Média de Gols/Jogo
                    </span>
                    <span className="font-bold text-base text-foreground">
                      EM BREVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-foreground">
                      Time com Mais Vitórias
                    </span>
                    <span className="font-bold text-base text-foreground">
                      EM BREVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-foreground">
                      Artilheiro
                    </span>
                    <span className="font-bold text-base text-foreground">
                      EM BREVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-foreground">
                      Liga Mais Ativa
                    </span>
                    <span className="font-bold text-base text-foreground">
                      EM BREVE
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
                    <div className="font-medium text-base text-foreground">
                      Ver Análises Detalhadas
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      EM BREVE
                    </div>
                  </button>
                  <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
                    <div className="font-medium text-base text-foreground">
                      Comparar Times
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      EM BREVE
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
