import { useEffect, useState } from 'react';
import {
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { SectionTitle } from '@/components/SectionTitle';
import { InsightsBox } from '@/components/InsightsBox';
import { mockMatches, mockTeams, mockTrendingInsights } from '@/data/mockData';
import { Link } from 'react-router-dom';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [topProbabilities, setTopProbabilities] = useState([]);
  const [highlightTeams, setHighlightTeams] = useState([]);

  useEffect(() => {
    fetch(`${API_URL_BACK}matches/today/`)
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Erro ao carregar jogos:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL_BACK}value-bets/?limit=3`)
      .then((res) => res.json())
      .then((data) => {
        // Formatar dados para o formato esperado pelo InsightsBox
        const formatted = data.map((item, index) => ({
          id: item.match_id || index,
          title: item.match,
          description: `${item.bet_name} - ${item.league}`,
          percentage: item.calculated_probability,
          trend: item.calculated_probability >= 60 ? "up" : "down",
          date: item.date,
        }));
        setTopProbabilities(formatted);
      })
      .catch((err) => console.error('Erro ao carregar probabilidades:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL_BACK}times_destaque/`)
      .then((res) => res.json())
      .then((data) => setHighlightTeams(data))
      .catch((err) => console.error('Erro ao carregar times destaque:', err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section com Busca */}
        <div className="text-center space-y-6 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Análise Inteligente de{' '}
              <span className="text-primary">Apostas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estatísticas em tempo real, insights automáticos e probabilidades
              calculadas
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Próximas Partidas */}
        <section className="space-y-6">
          <SectionTitle
            title="Próximas Partidas"
            subtitle="Jogos com análises disponíveis"
            icon={Calendar}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Link
                key={match.id}
                to={`/match/${match.id}`}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:glow-subtle transition-all group"
              >
                <div className="space-y-4">
                  {/* Cabeçalho da partida */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {match.league}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {match.date} • {match.time}
                    </span>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <img
                        src={match.homeTeam.logo}
                        className="w-10 h-10 mx-auto"
                        alt={match.homeTeam.name}
                      />

                      <p className="text-sm font-semibold text-foreground">
                        {match.homeTeam.name}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">VS</p>
                    </div>
                    <div className="text-center">
                      <img
                        src={match.awayTeam.logo}
                        className="w-10 h-10 mx-auto"
                        alt={match.awayTeam.name}
                      />

                      <p className="text-sm font-semibold text-foreground">
                        {match.awayTeam.name}
                      </p>
                    </div>
                  </div>

                  {/* Quick insights */}
                  <div className="pt-3 border-t border-border space-y-2">
                    {match.insights.slice(0, 2).map((insight) => (
                      <div
                        key={insight.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {insight.title}
                        </span>
                        <span className="text-primary font-bold">
                          {insight.probability}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Maiores Probabilidades do Dia */}
        <section className="space-y-6">
          <SectionTitle
            title="Maiores Probabilidades do Dia"
            subtitle="Top 3 apostas com maior probabilidade calculada"
            icon={Lightbulb}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProbabilities.map((insight) => (
              <Link
                key={insight.id}
                to={`/match/${insight.id}`}
                className="block"
              >
                <InsightsBox
                  title={insight.title}
                  description={insight.description}
                  probability={insight.percentage}
                  trend={insight.trend}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Stats Overview */}
        <section className="space-y-6">
          <SectionTitle
            title="Times em Destaque"
            subtitle="Principais estatísticas"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlightTeams.map((team) => (
              <Link
                key={team.id}
                to={`/team/${team.id}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:glow-subtle transition-all"
              >
                <div className="text-center space-y-3">
                  {/* Logo do time */}
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-14 h-14 object-contain mx-auto"
                  />

                  {/* Nome + Liga */}
                  <div>
                    <p className="font-semibold text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.league}
                    </p>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">Gols</p>
                      <p className="font-bold text-foreground">
                        {team.goalsAverage}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">Over</p>
                      <p className="font-bold text-foreground">
                        {team.overPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
