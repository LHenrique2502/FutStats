import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SearchBar } from '@/components/SearchBar';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { trackEvent } from '@/lib/analytics';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL_BACK}matches/today/`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar partidas:', err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return matches;
    return (Array.isArray(matches) ? matches : []).filter((m) => {
      const hay = [
        m?.league,
        m?.homeTeam?.name,
        m?.awayTeam?.name,
        m?.date,
        m?.time,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [matches, query]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Partidas de hoje"
        description="Lista de partidas do dia com insights e análises rápidas."
        pathname="/matches"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <SectionTitle
            title="Todas as Partidas"
            subtitle="Análises completas e probabilidades"
            icon={Calendar}
          />
          <SearchBar
            placeholder="Buscar partidas..."
            value={query}
            onSearch={(v) => setQuery(v)}
          />
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando partidas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {String(query || '').trim()
              ? 'Nenhuma partida encontrada para sua busca'
              : 'Nenhuma partida disponível hoje'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((match) => (
            <Link
              key={match.id}
              to={`/match/${match.id}`}
              className="block bg-card border border-border rounded-lg p-4 hover:border-primary hover:glow-subtle transition-all group"
              onClick={() =>
                trackEvent('match_click', {
                  match_id: String(match.id),
                  source: 'matches_list',
                })
              }
            >
              <div className="space-y-3">
                {/* Match Header */}
                <div className="flex items-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {match.date}
                    </span>
                  </div>
                </div>

                {/* League */}
                <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {match.league}
                </div>

                {/* Teams */}
                <div className="grid grid-cols-3 gap-3 items-center py-3">
                  <div className="text-center space-y-1.5">
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-12 h-12 mx-auto object-contain"
                    />
                    <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {match.homeTeam.name}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-muted/50 rounded-lg py-2 px-2">
                      <p className="text-lg font-bold text-muted-foreground">
                        VS
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-12 h-12 mx-auto object-contain"
                    />
                    <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {match.awayTeam.name}
                    </p>
                  </div>
                </div>

                {/* Insights */}
                {match.insights && match.insights.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Principais Insights
                    </p>
                    <div className="space-y-2">
                      {match.insights.slice(0, 2).map((insight) => (
                        <div
                          key={insight.id}
                          className="bg-muted/30 rounded-lg p-2 flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {insight.title}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {insight.probability}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
