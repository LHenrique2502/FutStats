import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, User, Trophy, Calendar, Activity } from 'lucide-react';

const Jogadores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Dados mockados dos jogadores
  const players = [
    {
      id: 1,
      name: 'Gabriel Barbosa',
      team: 'Flamengo',
      position: 'Atacante',
      age: 27,
      matches: 18,
      goals: 15,
      assists: 4,
      yellowCards: 2,
      redCards: 0,
      rating: 8.3,
      marketValue: '25M€',
      nationality: 'Brasil',
      height: '1.78m',
      weight: '72kg',
    },
    {
      id: 2,
      name: 'Endrick',
      team: 'Palmeiras',
      position: 'Atacante',
      age: 17,
      matches: 16,
      goals: 12,
      assists: 2,
      yellowCards: 1,
      redCards: 0,
      rating: 7.9,
      marketValue: '35M€',
      nationality: 'Brasil',
      height: '1.74m',
      weight: '68kg',
    },
    {
      id: 3,
      name: 'Lucas Paquetá',
      team: 'Brasil/West Ham',
      position: 'Meio-campo',
      age: 26,
      matches: 20,
      goals: 6,
      assists: 8,
      yellowCards: 3,
      redCards: 0,
      rating: 8.1,
      marketValue: '40M€',
      nationality: 'Brasil',
      height: '1.80m',
      weight: '73kg',
    },
    {
      id: 4,
      name: 'Alisson Becker',
      team: 'Brasil/Liverpool',
      position: 'Goleiro',
      age: 30,
      matches: 22,
      goals: 0,
      assists: 1,
      yellowCards: 1,
      redCards: 0,
      rating: 8.5,
      marketValue: '45M€',
      nationality: 'Brasil',
      height: '1.91m',
      weight: '85kg',
    },
    {
      id: 5,
      name: 'Casemiro',
      team: 'Brasil/Manchester United',
      position: 'Meio-campo',
      age: 31,
      matches: 19,
      goals: 3,
      assists: 5,
      yellowCards: 5,
      redCards: 1,
      rating: 7.6,
      marketValue: '30M€',
      nationality: 'Brasil',
      height: '1.85m',
      weight: '84kg',
    },
    {
      id: 6,
      name: 'Vinicius Jr.',
      team: 'Brasil/Real Madrid',
      position: 'Atacante',
      age: 23,
      matches: 21,
      goals: 18,
      assists: 12,
      yellowCards: 4,
      redCards: 0,
      rating: 8.7,
      marketValue: '120M€',
      nationality: 'Brasil',
      height: '1.76m',
      weight: '73kg',
    },
    {
      id: 7,
      name: 'Marquinhos',
      team: 'Brasil/PSG',
      position: 'Zagueiro',
      age: 29,
      matches: 24,
      goals: 2,
      assists: 3,
      yellowCards: 2,
      redCards: 0,
      rating: 8.2,
      marketValue: '50M€',
      nationality: 'Brasil',
      height: '1.83m',
      weight: '75kg',
    },
    {
      id: 8,
      name: 'Rodrygo',
      team: 'Brasil/Real Madrid',
      position: 'Atacante',
      age: 22,
      matches: 19,
      goals: 14,
      assists: 7,
      yellowCards: 1,
      redCards: 0,
      rating: 8.0,
      marketValue: '80M€',
      nationality: 'Brasil',
      height: '1.74m',
      weight: '64kg',
    },
  ];

  const positions = ['all', 'Goleiro', 'Zagueiro', 'Meio-campo', 'Atacante'];
  const teams = ['all', ...new Set(players.map((p) => p.team))];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPosition =
      selectedPosition === 'all' || player.position === selectedPosition;
    const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;

    return matchesSearch && matchesPosition && matchesTeam;
  });

  const getPositionColor = (position) => {
    switch (position) {
      case 'Goleiro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Zagueiro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Meio-campo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Atacante':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'text-green-600 font-bold';
    if (rating >= 8.0) return 'text-green-500 font-semibold';
    if (rating >= 7.5) return 'text-yellow-600 font-semibold';
    return 'text-red-500 font-semibold';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Jogadores Cadastrados</h2>
          <p className="text-muted-foreground">
            Lista completa de todos os jogadores do sistema
          </p>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{players.length}</div>
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
              <div className="text-2xl font-bold">
                {players.reduce((sum, player) => sum + player.goals, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Gols Marcados</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">
                {players.reduce((sum, player) => sum + player.assists, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Assistências</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">
                {(
                  players.reduce((sum, player) => sum + player.rating, 0) /
                  players.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Nota Média</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
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

              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position === 'all' ? 'Todas as Posições' : position}
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
                        {team === 'all' ? 'Todos os Times' : team}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Jogadores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Jogadores ({filteredPlayers.length})</CardTitle>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Jogos</TableHead>
                      <TableHead>Gols</TableHead>
                      <TableHead>Assistências</TableHead>
                      <TableHead>Cartões</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player) => (
                      <TableRow key={player.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.nationality}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </TableCell>
                        <TableCell>{player.age} anos</TableCell>
                        <TableCell>{player.matches}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {player.goals}
                        </TableCell>
                        <TableCell className="text-blue-600 font-semibold">
                          {player.assists}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <span className="text-yellow-600">
                              {player.yellowCards}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-red-600">
                              {player.redCards}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getRatingColor(player.rating)}>
                            {player.rating}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {player.marketValue}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Jogadores;
