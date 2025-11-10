import { Users, TrendingUp } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SearchBar } from '@/components/SearchBar';
import { StatsCard } from '@/components/StatsCard';
import { mockTeams } from '@/data/mockData';
import { Link } from 'react-router-dom';

const Teams = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <SectionTitle 
            title="Todos os Times" 
            subtitle="Análise completa de estatísticas"
            icon={Users}
          />
          <SearchBar placeholder="Buscar times..." />
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeams.map((team) => (
            <Link
              key={team.id}
              to={`/team/${team.id}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:glow-subtle transition-all group"
            >
              <div className="space-y-4">
                {/* Team Header */}
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{team.logo}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{team.league}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Gols</p>
                    <p className="text-lg font-bold text-foreground">
                      {team.statistics.goalsAverage}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Over</p>
                    <p className="text-lg font-bold text-primary">
                      {team.statistics.overPercentage}%
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">BTTS</p>
                    <p className="text-lg font-bold text-foreground">
                      {team.statistics.bttsPercentage}%
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Forma:</span>
                  <div className="flex gap-1">
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;
