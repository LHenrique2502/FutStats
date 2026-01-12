import { Trophy, TrendingUp } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { mockTeams } from '@/data/mockData';
import { Link } from 'react-router-dom';

const League = () => {
  const leagues = [...new Set(mockTeams.map((team) => team.league))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <SectionTitle
            title="Ligas"
            subtitle="Análise por competição"
            icon={Trophy}
          />
        </div>

        {/* Leagues */}
        {leagues.map((league) => {
          const leagueTeams = mockTeams.filter(
            (team) => team.league === league
          );

          return (
            <section key={league} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{league}</h2>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Média Gols
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Over 2.5%
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          BTTS%
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Escanteios
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Forma
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leagueTeams.map((team) => (
                        <tr
                          key={team.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/team/${team.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <span className="text-2xl">{team.logo}</span>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {team.name}
                              </span>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-foreground font-semibold">
                              {team.statistics.goalsAverage}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {team.statistics.overPercentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-foreground font-semibold">
                              {team.statistics.bttsPercentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-foreground font-semibold">
                              {team.statistics.cornersAverage}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-1">
                              {team.statistics.form.map((result, index) => (
                                <span
                                  key={index}
                                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default League;
