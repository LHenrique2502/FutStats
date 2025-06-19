import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Target,
  User,
  Trophy,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";

const Scouts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");

  // Dados mockados dos jogadores
  const players = [
    {
      name: "Gabriel Barbosa",
      team: "Flamengo",
      position: "Atacante",
      age: 27,
      matches: 18,
      goals: 15,
      assists: 4,
      yellowCards: 2,
      redCards: 0,
      rating: 8.3,
      marketValue: "25M€",
      lastMatch: "2024-06-10",
    },
    {
      name: "Endrick",
      team: "Palmeiras",
      position: "Atacante",
      age: 17,
      matches: 16,
      goals: 12,
      assists: 2,
      yellowCards: 1,
      redCards: 0,
      rating: 7.9,
      marketValue: "35M€",
      lastMatch: "2024-06-09",
    },
    {
      name: "Lucas Paquetá",
      team: "Brasil/West Ham",
      position: "Meio-campo",
      age: 26,
      matches: 20,
      goals: 6,
      assists: 8,
      yellowCards: 3,
      redCards: 0,
      rating: 8.1,
      marketValue: "40M€",
      lastMatch: "2024-06-08",
    },
    {
      name: "Alisson Becker",
      team: "Brasil/Liverpool",
      position: "Goleiro",
      age: 30,
      matches: 22,
      goals: 0,
      assists: 1,
      yellowCards: 1,
      redCards: 0,
      rating: 8.5,
      marketValue: "45M€",
      lastMatch: "2024-06-11",
    },
    {
      name: "Casemiro",
      team: "Brasil/Manchester United",
      position: "Meio-campo",
      age: 31,
      matches: 19,
      goals: 3,
      assists: 5,
      yellowCards: 5,
      redCards: 1,
      rating: 7.6,
      marketValue: "30M€",
      lastMatch: "2024-06-07",
    },
    {
      name: "Vinicius Jr.",
      team: "Brasil/Real Madrid",
      position: "Atacante",
      age: 23,
      matches: 21,
      goals: 18,
      assists: 12,
      yellowCards: 4,
      redCards: 0,
      rating: 8.7,
      marketValue: "120M€",
      lastMatch: "2024-06-12",
    },
    {
      name: "Marquinhos",
      team: "Brasil/PSG",
      position: "Zagueiro",
      age: 29,
      matches: 24,
      goals: 2,
      assists: 3,
      yellowCards: 2,
      redCards: 0,
      rating: 8.2,
      marketValue: "50M€",
      lastMatch: "2024-06-10",
    },
    {
      name: "Rodrygo",
      team: "Brasil/Real Madrid",
      position: "Atacante",
      age: 22,
      matches: 19,
      goals: 14,
      assists: 7,
      yellowCards: 1,
      redCards: 0,
      rating: 8.0,
      marketValue: "80M€",
      lastMatch: "2024-06-11",
    },
  ];

  const positions = ["all", "Goleiro", "Zagueiro", "Meio-campo", "Atacante"];
  const teams = ["all", ...new Set(players.map((p) => p.team))];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPosition =
      selectedPosition === "all" || player.position === selectedPosition;
    const matchesTeam = selectedTeam === "all" || player.team === selectedTeam;

    return matchesSearch && matchesPosition && matchesTeam;
  });

  const getPositionColor = (position) => {
    switch (position) {
      case "Goleiro":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Zagueiro":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Meio-campo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Atacante":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return "text-green-600 font-bold";
    if (rating >= 8.0) return "text-green-500 font-semibold";
    if (rating >= 7.5) return "text-yellow-600 font-semibold";
    return "text-red-500 font-semibold";
  };

  const totalGoals = players.reduce((sum, player) => sum + player.goals, 0);
  const totalAssists = players.reduce((sum, player) => sum + player.assists, 0);
  const avgRating = (
    players.reduce((sum, player) => sum + player.rating, 0) / players.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-background outline">
      <Header />

      <main className="container mx-auto py-8 space-y-8 px-4 ">
        <div className="animate-fade-in-up">
          <h2 className="title-responsive mb-2">Scout de Jogadores</h2>
          <p className="subtitle-responsive">
            Análise detalhada e estatísticas dos jogadores
          </p>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{players.length}</div>
              <div className="text-sm text-muted-foreground">Jogadores</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <div className="text-sm text-muted-foreground">Total de Gols</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{totalAssists}</div>
              <div className="text-sm text-muted-foreground">
                Total de Assistências
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-football-gold" />
              </div>
              <div className="text-2xl font-bold">{avgRating}</div>
              <div className="text-sm text-muted-foreground">Nota Média</div>
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
                    placeholder="Buscar por nome do jogador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position === "all" ? "Todas as Posições" : position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team === "all" ? "Todos os Times" : team}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Jogadores */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Jogadores ({filteredPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum jogador encontrado com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map((player, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {player.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {player.team}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                className={getPositionColor(player.position)}
                              >
                                {player.position}
                              </Badge>
                              <Badge variant="outline">{player.age} anos</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {player.matches}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Jogos
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {player.goals}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Gols
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {player.assists}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Assistências
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">
                                {player.yellowCards}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Cartões Amarelos
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600">
                                {player.redCards}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Cartões Vermelhos
                              </div>
                            </div>

                            <div className="text-center">
                              <div
                                className={`text-lg font-bold ${getRatingColor(
                                  player.rating
                                )}`}
                              >
                                {player.rating}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Nota
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-48 space-y-2 text-right lg:text-center">
                          <div className="text-lg font-bold text-primary">
                            {player.marketValue}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Valor de Mercado
                          </div>
                          <div className="flex items-center justify-end lg:justify-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Último jogo: {player.lastMatch}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Scouts;
