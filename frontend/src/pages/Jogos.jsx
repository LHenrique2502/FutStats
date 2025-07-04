import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import MatchCard from '@/components/MatchCard';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Trophy,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react';

const API_URL_BACK = process.env.REACT_APP_API_URL_BACK;

const Jogos = () => {
  const today = new Date().toISOString().split('T')[0];

  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedDate, setSelectedDate] = useState(today);

  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState(['all']);
  const [teams, setTeams] = useState(['all']);

  const [leagueStats, setLeagueStats] = useState([]);

  const buscarPartidas = async () => {
    try {
      const response = await axios.get(`${API_URL_BACK}matches/`, {
        params: {
          date: selectedDate,
          league: selectedLeague !== 'all' ? selectedLeague : '',
          team: selectedTeam !== 'all' ? selectedTeam : '',
        },
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    }
  };

  const clearFilters = () => {
    setSelectedLeague('all');
    setSelectedTeam('all');
    setSelectedDate(today);
    buscarPartidas();
  };

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [ligasRes, timesRes] = await Promise.all([
          axios.get(`${API_URL_BACK}ligas/`),
          axios.get(`${API_URL_BACK}times/`),
        ]);
        setLeagues(['all', ...ligasRes.data]);
        setTeams(['all', ...timesRes.data]);
      } catch (error) {
        console.error('Erro ao buscar filtros:', error);
      }
    };

    fetchFiltros();
    buscarPartidas(); // carrega os jogos iniciais
  }, []);

  const filteredMatches = matches;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Análise de Jogos</h2>
          <p className="text-muted-foreground">
            Estatísticas detalhadas e informações dos jogos
          </p>
        </div>

        {/* Estatísticas Gerais dos Jogos */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <StatsCard
            title="Jogos Filtrados"
            value={filteredMatches.length}
            icon={Clock}
            description={`de ${matches.length} total`}
            trend="neutral"
          />
          <StatsCard
            title="Média de Gols"
            value="2.4"
            icon={Target}
            description="+0.2 vs última semana"
            trend="up"
          />
          <StatsCard
            title="Total de Partidas"
            value="1,247"
            icon={Trophy}
            description="Esta temporada"
            trend="neutral"
          />
          <StatsCard
            title="Ligas Ativas"
            value={leagues.length - 1}
            icon={BarChart3}
            description="Em 8 países"
            trend="neutral"
          />
        </div>

        {/* Filtros */}
        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-filter">Data</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Liga</Label>
                <Select
                  value={selectedLeague}
                  onValueChange={setSelectedLeague}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por liga" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league} value={league}>
                        {league === 'all' ? 'Todas as Ligas' : league}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team === 'all' ? 'Todos os Times' : team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={buscarPartidas}
                  className="px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 rounded-md transition-colors w-full"
                >
                  Buscar
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors w-full"
                >
                  Limpar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs dos Jogos */}
        <div className="animate-slide-in-right">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="live">Ao Vivo</TabsTrigger>
              <TabsTrigger value="completed">Finalizados</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="live" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches
                  .filter((match) => match.status === 'live')
                  .map((match, index) => (
                    <MatchCard key={index} {...match} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches
                  .filter((match) => match.status === 'completed')
                  .map((match, index) => (
                    <MatchCard key={index} {...match} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Estatísticas por Liga</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leagues
                  .filter((league) => league !== 'all')
                  .map((league) => {
                    const leagueMatches = matches.filter(
                      (match) => match.league === league
                    );
                    const completedMatches = leagueMatches.filter(
                      (match) => match.status === 'completed'
                    );
                    const totalGoals = completedMatches.reduce(
                      (sum, match) =>
                        sum + (match.homeScore || 0) + (match.awayScore || 0),
                      0
                    );
                    const avgGoals =
                      completedMatches.length > 0
                        ? (totalGoals / completedMatches.length).toFixed(1)
                        : '0.0';

                    return (
                      <div
                        key={league}
                        className="flex justify-between items-center p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{league}</div>
                          <div className="text-sm text-muted-foreground">
                            {leagueMatches.length} jogos • Média: {avgGoals}{' '}
                            gols
                          </div>
                        </div>
                        <Badge variant="outline">
                          {completedMatches.length} finalizados
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Tendências</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg border">
                  <div className="font-medium text-green-600">
                    Time em Melhor Forma
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Flamengo • 5 vitórias consecutivas
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-medium text-blue-600">Maior Goleada</div>
                  <div className="text-sm text-muted-foreground">
                    Santos 4 x 0 Botafogo • Rodada 15
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-medium text-purple-600">
                    Clássico da Rodada
                  </div>
                  <div className="text-sm text-muted-foreground">
                    São Paulo vs Corinthians • Hoje 21:45
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-medium text-orange-600">
                    Artilheiro da Rodada
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pedro (Flamengo) • 2 gols contra o Palmeiras
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Jogos;
