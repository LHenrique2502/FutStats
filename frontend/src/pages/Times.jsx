import { useState } from "react";
import Header from "@/components/Header";
import TeamCard from "@/components/TeamCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Trophy, Target } from "lucide-react";

const Times = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");

  // Dados mockados dos times
  const teams = [
    {
      name: "Flamengo",
      league: "Brasileirão Série A",
      position: 1,
      points: 45,
      played: 20,
      wins: 14,
      draws: 3,
      losses: 3,
      players: 28,
    },
    {
      name: "Palmeiras",
      league: "Brasileirão Série A",
      position: 2,
      points: 42,
      played: 20,
      wins: 13,
      draws: 3,
      losses: 4,
      players: 26,
    },
    {
      name: "São Paulo",
      league: "Brasileirão Série A",
      position: 5,
      points: 35,
      played: 20,
      wins: 10,
      draws: 5,
      losses: 5,
      players: 25,
    },
    {
      name: "Corinthians",
      league: "Brasileirão Série A",
      position: 8,
      points: 28,
      played: 20,
      wins: 8,
      draws: 4,
      losses: 8,
      players: 27,
    },
    {
      name: "Grêmio",
      league: "Brasileirão Série A",
      position: 12,
      points: 25,
      played: 20,
      wins: 7,
      draws: 4,
      losses: 9,
      players: 24,
    },
    {
      name: "Internacional",
      league: "Brasileirão Série A",
      position: 6,
      points: 33,
      played: 20,
      wins: 9,
      draws: 6,
      losses: 5,
      players: 26,
    },
    {
      name: "Santos",
      league: "Brasileirão Série B",
      position: 3,
      points: 38,
      played: 20,
      wins: 11,
      draws: 5,
      losses: 4,
      players: 23,
    },
    {
      name: "Vasco",
      league: "Brasileirão Série A",
      position: 15,
      points: 22,
      played: 20,
      wins: 6,
      draws: 4,
      losses: 10,
      players: 25,
    },
  ];

  const leagues = [
    "all",
    "Brasileirão Série A",
    "Brasileirão Série B",
    "Copa do Brasil",
  ];

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLeague =
      selectedLeague === "all" || team.league === selectedLeague;

    return matchesSearch && matchesLeague;
  });

  const totalPlayers = teams.reduce((sum, team) => sum + team.players, 0);
  const avgPoints = Math.round(
    teams.reduce((sum, team) => sum + team.points, 0) / teams.length
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="animate-fade-in-up">
          <h2 className="title-responsive mb-2">Gestão de Times</h2>
          <p className="subtitle-responsive">
            Visualize e gerencie todos os times cadastrados no sistema
          </p>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{teams.length}</div>
              <div className="text-sm text-muted-foreground">
                Times Cadastrados
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-football-gold" />
              </div>
              <div className="text-2xl font-bold">{totalPlayers}</div>
              <div className="text-sm text-muted-foreground">
                Total de Jogadores
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{avgPoints}</div>
              <div className="text-sm text-muted-foreground">
                Média de Pontos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome do time..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {leagues.map((league) => (
                    <option key={league} value={league}>
                      {league === "all" ? "Todas as Ligas" : league}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Times */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Times ({filteredTeams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum time encontrado com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team, index) => (
                  <TeamCard key={index} {...team} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Times;
