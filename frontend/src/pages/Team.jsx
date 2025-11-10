import { useParams } from 'react-router-dom';
import { Target, TrendingUp, Flag, Shield, Activity } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { StatsCard } from '@/components/StatsCard';
import { InsightsBox } from '@/components/InsightsBox';
import { TeamComparison } from '@/components/TeamComparison';
import { mockTeams } from '@/data/mockData';

const Team = () => {
  const { id } = useParams();
  const team = mockTeams.find((t) => t.id === id) || mockTeams[0];

  const comparisonStats = [
    { label: 'Média de Gols', homeValue: 2.8, awayValue: 2.5 },
    { label: 'Escanteios', homeValue: 6.5, awayValue: 7.2 },
    { label: 'Cartões', homeValue: 2.1, awayValue: 1.8 },
    { label: 'Over 2.5%', homeValue: 75, awayValue: 70 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Team Header */}
        <div className="text-center space-y-4 py-8">
          <div className="text-7xl">{team.logo}</div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {team.name}
            </h1>
            <p className="text-lg text-muted-foreground">{team.league}</p>
          </div>

          {/* Form */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground">
              Últimos 5 jogos:
            </span>
            <div className="flex gap-2">
              {team.statistics.form.map((result, index) => (
                <span
                  key={index}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                    result === 'W'
                      ? 'bg-success/20 text-success'
                      : result === 'D'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <section className="space-y-6">
          <SectionTitle
            title="Estatísticas Principais"
            subtitle="Médias dos últimos jogos"
            icon={Activity}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Média de Gols"
              value={team.statistics.goalsAverage}
              subtitle="Por partida"
              icon={Target}
              trend="up"
            />
            <StatsCard
              title="Over 2.5"
              value={`${team.statistics.overPercentage}%`}
              subtitle="Dos últimos jogos"
              icon={TrendingUp}
              trend="up"
            />
            <StatsCard
              title="Escanteios"
              value={team.statistics.cornersAverage}
              subtitle="Por partida"
              icon={Flag}
              trend="stable"
            />
            <StatsCard
              title="Clean Sheets"
              value={`${team.statistics.cleanSheetPercentage}%`}
              subtitle="Sem sofrer gols"
              icon={Shield}
              trend="stable"
            />
          </div>
        </section>

        {/* Goals Distribution */}
        <section className="space-y-6">
          <SectionTitle
            title="Distribuição de Gols"
            subtitle="Quando o time marca e sofre"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Gols Marcados</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">1º Tempo</span>
                    <span className="font-bold text-foreground">
                      {team.statistics.goalsFirstHalf}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(team.statistics.goalsFirstHalf / team.statistics.goalsAverage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">2º Tempo</span>
                    <span className="font-bold text-foreground">
                      {team.statistics.goalsSecondHalf}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${(team.statistics.goalsSecondHalf / team.statistics.goalsAverage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                Outras Estatísticas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    BTTS (Ambos marcam)
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {team.statistics.bttsPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Média de Cartões
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {team.statistics.cardsAverage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Média de Escanteios
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {team.statistics.cornersAverage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison with Next Opponent */}
        <section className="space-y-6">
          <SectionTitle
            title="Comparativo com Próximo Adversário"
            subtitle="Análise detalhada do confronto"
          />
          <TeamComparison
            homeTeam={team}
            awayTeam={mockTeams[1]}
            stats={comparisonStats}
          />
        </section>

        {/* Insights */}
        <section className="space-y-6">
          <SectionTitle
            title="Insights do Time"
            subtitle="Análises baseadas em dados recentes"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsightsBox
              title={`${team.name} marca em ${team.statistics.overPercentage}% dos jogos`}
              description="Time tem alta consistência ofensiva nos últimos 10 jogos"
              probability={team.statistics.overPercentage}
              trend="up"
            />
            <InsightsBox
              title="Forte no segundo tempo"
              description="Marca mais gols após o intervalo"
              probability={85}
              trend="up"
            />
            <InsightsBox
              title={`Clean sheets em ${team.statistics.cleanSheetPercentage}% dos jogos`}
              description="Defesa sólida quando joga em casa"
              probability={team.statistics.cleanSheetPercentage}
              trend="stable"
            />
            <InsightsBox
              title="Domina escanteios"
              description={`Média de ${team.statistics.cornersAverage} escanteios por jogo`}
              probability={90}
              trend="up"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;
