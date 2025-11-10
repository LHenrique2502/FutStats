import { useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Flag,
  AlertCircle,
} from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { StatsCard } from '@/components/StatsCard';
import { TeamComparison } from '@/components/TeamComparison';
import { InsightsBox } from '@/components/InsightsBox';
import { MatchEventTimeline } from '@/components/MatchEventTimeline';
import { mockMatches } from '@/data/mockData';

const Match = () => {
  const { id } = useParams();
  const match = mockMatches.find((m) => m.id === id) || mockMatches[0];

  const comparisonStats = [
    {
      label: 'Média de Gols',
      homeValue: match.homeTeam.statistics.goalsAverage,
      awayValue: match.awayTeam.statistics.goalsAverage,
    },
    {
      label: 'Over 2.5%',
      homeValue: match.homeTeam.statistics.overPercentage,
      awayValue: match.awayTeam.statistics.overPercentage,
    },
    {
      label: 'BTTS%',
      homeValue: match.homeTeam.statistics.bttsPercentage,
      awayValue: match.awayTeam.statistics.bttsPercentage,
    },
    {
      label: 'Escanteios',
      homeValue: match.homeTeam.statistics.cornersAverage,
      awayValue: match.awayTeam.statistics.cornersAverage,
    },
  ];

  const mockEvents = [
    {
      id: 1,
      type: 'goal',
      minute: 12,
      team: match.homeTeam.name,
      player: 'Jogador A',
      description: 'Gol de cabeça',
    },
    {
      id: 2,
      type: 'corner',
      minute: 23,
      team: match.awayTeam.name,
      player: 'Escanteio',
    },
    {
      id: 3,
      type: 'card',
      minute: 34,
      team: match.homeTeam.name,
      player: 'Jogador B',
      description: 'Cartão amarelo',
    },
    {
      id: 4,
      type: 'goal',
      minute: 56,
      team: match.awayTeam.name,
      player: 'Jogador C',
      description: 'Gol de fora da área',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Match Header */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {match.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {match.time}
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {match.league}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-8 items-center">
            <div className="text-center space-y-3">
              <div className="text-6xl">{match.homeTeam.logo}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {match.homeTeam.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {match.homeTeam.league}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-muted/50 rounded-lg py-4 px-6">
                <p className="text-3xl font-bold text-muted-foreground">VS</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="text-6xl">{match.awayTeam.logo}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {match.awayTeam.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {match.awayTeam.league}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <section className="space-y-6">
          <SectionTitle
            title="Estatísticas dos Times"
            subtitle="Últimos 5 jogos de cada equipe"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={`${match.homeTeam.name} - Gols`}
              value={match.homeTeam.statistics.goalsAverage}
              subtitle="Média por jogo"
              icon={Target}
              trend="up"
            />
            <StatsCard
              title={`${match.awayTeam.name} - Gols`}
              value={match.awayTeam.statistics.goalsAverage}
              subtitle="Média por jogo"
              icon={Target}
              trend="up"
            />
            <StatsCard
              title={`${match.homeTeam.name} - Over`}
              value={`${match.homeTeam.statistics.overPercentage}%`}
              subtitle="Over 2.5 gols"
              icon={TrendingUp}
              trend="up"
            />
            <StatsCard
              title={`${match.awayTeam.name} - Over`}
              value={`${match.awayTeam.statistics.overPercentage}%`}
              subtitle="Over 2.5 gols"
              icon={TrendingUp}
              trend="up"
            />
          </div>
        </section>

        {/* Comparison */}
        <section className="space-y-6">
          <SectionTitle
            title="Comparativo Direto"
            subtitle="Head-to-head estatístico"
          />
          <TeamComparison
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            stats={comparisonStats}
          />
        </section>

        {/* Match Insights */}
        <section className="space-y-6">
          <SectionTitle
            title="Insights da Partida"
            subtitle="Análises e probabilidades"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {match.insights.map((insight) => (
              <InsightsBox
                key={insight.id}
                title={insight.title}
                description={insight.description}
                probability={insight.probability}
                trend={insight.trend}
              />
            ))}
          </div>
        </section>

        {/* Event Timeline (if match is live or finished) */}
        <section className="space-y-6">
          <SectionTitle
            title="Timeline de Eventos"
            subtitle="Principais acontecimentos da partida"
          />
          <div className="bg-card border border-border rounded-lg p-6">
            <MatchEventTimeline events={mockEvents} />
          </div>
        </section>

        {/* Betting Recommendations */}
        <section className="space-y-6">
          <SectionTitle
            title="Recomendações"
            subtitle="Baseado em análise estatística"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-primary/30 rounded-lg p-6 glow-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Over 2.5 Gols</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Alta probabilidade de mais de 2.5 gols baseado no histórico
              </p>
              <p className="text-2xl font-bold text-primary">82%</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Flag className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Escanteios</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Expectativa de muitos escanteios no jogo
              </p>
              <p className="text-2xl font-bold text-foreground">Over 10.5</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Cartões</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Jogo deve ter cartões amarelos
              </p>
              <p className="text-2xl font-bold text-foreground">Over 3.5</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Match;
