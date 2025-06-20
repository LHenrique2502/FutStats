import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Calendar, Search, MapPin, Star } from 'lucide-react';

const Ligas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Dados mockados - substituir pela sua API Django
  const leagues = [
    {
      id: 1,
      name: 'Brasileirão Série A',
      country: 'Brasil',
      season: '2024',
      teams: 20,
      matches: 380,
      logo: '🇧🇷',
      status: 'Ativa',
      description: 'Campeonato Brasileiro de Futebol - Série A',
    },
    {
      id: 2,
      name: 'Copa Libertadores',
      country: 'América do Sul',
      season: '2024',
      teams: 32,
      matches: 125,
      logo: '🏆',
      status: 'Ativa',
      description: 'Principal competição sul-americana de clubes',
    },
    {
      id: 3,
      name: 'Premier League',
      country: 'Inglaterra',
      season: '2024/25',
      teams: 20,
      matches: 380,
      logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      status: 'Ativa',
      description: 'Liga inglesa de futebol',
    },
    {
      id: 4,
      name: 'La Liga',
      country: 'Espanha',
      season: '2024/25',
      teams: 20,
      matches: 380,
      logo: '🇪🇸',
      status: 'Ativa',
      description: 'Liga espanhola de futebol',
    },
    {
      id: 5,
      name: 'Copa do Brasil',
      country: 'Brasil',
      season: '2024',
      teams: 92,
      matches: 184,
      logo: '🇧🇷',
      status: 'Em andamento',
      description: 'Copa nacional brasileira',
    },
    {
      id: 6,
      name: 'Serie A',
      country: 'Itália',
      season: '2024/25',
      teams: 20,
      matches: 380,
      logo: '🇮🇹',
      status: 'Ativa',
      description: 'Liga italiana de futebol',
    },
  ];

  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLeagueClick = (league) => {
    navigate(`/jogos?liga=${encodeURIComponent(league.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Ligas de Futebol</h2>
          <p className="text-muted-foreground">
            Explore as principais competições de futebol ao redor do mundo
          </p>
        </div>

        {/* Estatísticas Gerais - Grid ajustado */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <StatsCard
            title="Total de Ligas"
            value={leagues.length}
            icon={Trophy}
            description="Competições monitoradas"
            trend="neutral"
          />
          <StatsCard
            title="Times Total"
            value={leagues.reduce((sum, league) => sum + league.teams, 0)}
            icon={Users}
            description="Across all leagues"
            trend="neutral"
          />
          <StatsCard
            title="Jogos Totais"
            value={leagues.reduce((sum, league) => sum + league.matches, 0)}
            icon={Calendar}
            description="Esta temporada"
            trend="neutral"
          />
          <StatsCard
            title="Países"
            value={new Set(leagues.map((l) => l.country)).size}
            icon={MapPin}
            description="Diferentes países"
            trend="neutral"
          />
        </div>

        {/* Busca */}
        <Card className="animate-slide-in-right">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ligas por nome ou país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ligas - Grid ajustado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredLeagues.map((league) => (
            <Card
              key={league.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              onClick={() => handleLeagueClick(league)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{league.logo}</div>
                  <Badge
                    variant={
                      league.status === 'Ativa' ? 'default' : 'secondary'
                    }
                    className="group-hover:scale-105 transition-transform"
                  >
                    {league.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {league.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {league.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {league.country}
                    </span>
                    <span className="text-muted-foreground">
                      {league.season}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {league.teams}
                      </div>
                      <div className="text-xs text-muted-foreground">Times</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {league.matches}
                      </div>
                      <div className="text-xs text-muted-foreground">Jogos</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-center text-muted-foreground group-hover:text-primary transition-colors">
                      Clique para ver jogos →
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeagues.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma liga encontrada
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar o termo de busca para encontrar as ligas
                desejadas.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Ligas;
