import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import axios from 'axios';
import TeamCard from '@/components/TeamCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, Trophy, Target, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Times = () => {
  const [quantidade, setQuantidade] = useState(null);

  const [teams, setTeams] = useState([]);

  const listarTimes = async () => {
    try {
      const response = await axios.get(`${API_URL_BACK}times/`);
      setTeams(response.data);
    } catch (error) {
      console.error('Erro ao buscar times', error);
    }
  };

  useEffect(() => {
    async function fetchQuantidade() {
      try {
        const response = await axios.get(`${API_URL_BACK}contar_times/`);
        console.log('Quantidade recebida', response.data.quantidade);
        setQuantidade(response.data.quantidade);
      } catch (error) {
        console.error('Erro ao buscar quantidade de partidas:', error);
      }
    }

    fetchQuantidade();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  // const filteredTeams = teams.filter((team) => {
  //   const matchesSearch = team.name
  //     .toLowerCase()
  //     .includes(searchTerm.toLowerCase());
  //   const matchesLeague =
  //     selectedLeague === 'all' || team.league === selectedLeague;

  //   return matchesSearch && matchesLeague;
  // });

  const getPositionColor = (position) => {
    if (position <= 4) return 'text-green-600';
    if (position <= 6) return 'text-blue-600';
    if (position >= 18) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const filteredTeams = teams;

  useEffect(() => {
    listarTimes();
  }, []);
  // -------------------------------------------------

  // // Buscar ligas e times para filtros no load inicial
  // const [selectedLeague, setSelectedLeague] = useState('all');
  // const [selectedTeam, setSelectedTeam] = useState('all');
  // const [selectedDate, setSelectedDate] = useState(today);

  // const [leagues, setLeagues] = useState(['all']);
  // const [teams, setTeams] = useState(['all']);

  // const [activeTab, setActiveTab] = useState('all');

  // useEffect(() => {
  //   const fetchFiltros = async () => {
  //     try {
  //       const [ligasRes, timesRes] = await Promise.all([
  //         axios.get(`${API_URL_BACK}ligas/`),
  //         axios.get(`${API_URL_BACK}times/`),
  //       ]);
  //       setLeagues(['all', ...ligasRes.data]);
  //       setTeams(['all', ...timesRes.data]);
  //     } catch (error) {
  //       console.error('Erro ao buscar filtros:', error);
  //     }
  //   };

  //   fetchFiltros();
  // }, []);

  // const clearFilters = () => {
  //   setSelectedDate('');
  //   setSelectedLeague('all');
  //   setSelectedTeam('all');
  //   setActiveTab('all');
  // };

  // // Buscar partidas da API
  // const buscarPartidas = async () => {
  //   try {
  //     const response = await axios.get(`${API_URL_BACK}matches/`, {
  //       params: {
  //         date: selectedDate,
  //         league: selectedLeague !== 'all' ? selectedLeague : '',
  //         team: selectedTeam !== 'all' ? selectedTeam : '',
  //         page: currentPage,
  //         page_size: PAGE_SIZE,
  //       },
  //     });

  //     setMatches(response.data.results);
  //     setTotalPages(response.data.total_pages);
  //   } catch (error) {
  //     console.error('Erro ao buscar partidas:', error);
  //   }
  // };

  // // Resetar página para 1 quando filtros mudam
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [selectedDate, selectedLeague, selectedTeam, activeTab]);

  // // Buscar partidas quando filtros, página ou aba mudam
  // useEffect(() => {
  //   buscarPartidas();
  // }, [currentPage, selectedDate, selectedLeague, selectedTeam, activeTab]);

  // // Filtra os matches localmente conforme a aba ativa
  // const filteredMatches = useMemo(() => {
  //   if (activeTab === 'scheduled') {
  //     return matches.filter((m) => m.status === 'scheduled');
  //   }
  //   if (activeTab === 'completed') {
  //     return matches.filter((m) => m.status === 'completed');
  //   }
  //   return matches;
  // }, [matches, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="animate-fade-in-up">
          <h2 className="title-responsive mb-2">Gestão de Times</h2>
          <p className="subtitle-responsive">
            Times cadastrados: {quantidade !== null ? quantidade : '...'}
          </p>
        </div>

        {/* Filtros e Busca */}
        {/* <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="date-filter">Pesquisar</Label>
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
              </div>

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
        </Card> */}

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Liga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {team.logo ? (
                            <img
                              src={team.logo}
                              alt={`${team.nome} logo`}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {team.nome}
                        </TableCell>
                        <TableCell className="font-medium">
                          {team.pais}
                        </TableCell>
                        <TableCell className="font-medium">
                          {team.liga}
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

export default Times;
