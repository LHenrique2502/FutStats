import { Calendar, Clock } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SearchBar } from '@/components/SearchBar';
import { mockMatches } from '@/data/mockData';
import { Link } from 'react-router-dom';

const Matches = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <SectionTitle
            title="Todas as Partidas"
            subtitle="Análises completas e probabilidades"
            icon={Calendar}
          />
          <SearchBar placeholder="Buscar partidas..." />
        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockMatches.map((match) => (
            <Link
              key={match.id}
              to={`/match/${match.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary hover:glow-subtle transition-all group"
            >
              <div className="space-y-4">
                {/* Match Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {match.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {match.time}
                    </span>
                  </div>
                </div>

                {/* League */}
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {match.league}
                </div>

                {/* Teams */}
                <div className="grid grid-cols-3 gap-6 items-center py-4">
                  <div className="text-center space-y-2">
                    <div className="text-5xl">{match.homeTeam.logo}</div>
                    <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {match.homeTeam.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.homeTeam.league}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-muted/50 rounded-lg py-3 px-4">
                      <p className="text-2xl font-bold text-muted-foreground">
                        VS
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-5xl">{match.awayTeam.logo}</div>
                    <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {match.awayTeam.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.awayTeam.league}
                    </p>
                  </div>
                </div>

                {/* Insights */}
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Principais Insights
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {match.insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="bg-muted/30 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {insight.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        </div>
                        <div className="ml-3">
                          <span className="text-xl font-bold text-primary">
                            {insight.probability}%
                          </span>
                        </div>
                      </div>
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

export default Matches;
