import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import MatchCard from '@/components/MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter } from 'lucide-react';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Jogos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;

  const today = new Date();
  const todayLocal = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split('T')[0];

  const [matches, setMatches] = useState([]);
  const [quantidade, setQuantidade] = useState(null);

  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('Todos os Times');
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [leagues, setLeagues] = useState(['all']);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function fetchQuantidade() {
      try {
        const response = await axios.get(`${API_URL_BACK}contar_jogos/`);
        setQuantidade(response.data.quantidade);
      } catch (error) {
        console.error('Erro ao buscar quantidade de jogos:', error);
      }
    }

    fetchQuantidade();
  }, []);

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [ligasRes, timesRes] = await Promise.all([
          axios.get(`${API_URL_BACK}ligas/`),
          axios.get(`${API_URL_BACK}times/`),
        ]);

        setLeagues(['all', ...ligasRes.data]);
        const allTeam = {
          nome: 'Todos os Times',
          pais: '',
          logo: '',
          liga: '',
        };
        setTeams([allTeam, ...timesRes.data]);
      } catch (error) {
        console.error('Erro ao buscar filtros:', error);
      }
    };

    fetchFiltros();
  }, []);

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedLeague('all');
    setSelectedTeam('Todos os Times');
    setActiveTab('all');
  };

  const buscarPartidas = async () => {
    try {
      const response = await axios.get(`${API_URL_BACK}matches/`, {
        params: {
          date: selectedDate,
          league: selectedLeague !== 'all' ? selectedLeague : '',
          team: selectedTeam !== 'Todos os Times' ? selectedTeam : '',
          page: currentPage,
          page_size: PAGE_SIZE,
        },
      });

      setMatches(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedLeague, selectedTeam, activeTab]);

  useEffect(() => {
    buscarPartidas();
  }, [currentPage, selectedDate, selectedLeague, selectedTeam, activeTab]);

  const filteredMatches = useMemo(() => {
    if (activeTab === 'scheduled') {
      return matches.filter((m) => m.status === 'scheduled');
    }
    if (activeTab === 'completed') {
      return matches.filter((m) => m.status === 'completed');
    }
    return matches;
  }, [matches, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Análise de Jogos</h2>
          <p className="text-muted-foreground">
            Jogos cadastrados: {quantidade !== null ? quantidade : '...'}
          </p>
        </div>

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
                      <SelectItem key={team.nome} value={team.nome}>
                        {team.nome}
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

        <div className="animate-slide-in-right">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="scheduled">Agendado</TabsTrigger>
              <TabsTrigger value="completed">Finalizados</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-secondary rounded hover:bg-secondary/80 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="flex items-center">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-secondary rounded hover:bg-secondary/80 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </main>
    </div>
  );
};

export default Jogos;
