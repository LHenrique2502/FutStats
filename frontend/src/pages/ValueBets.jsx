import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '@/components/SectionTitle';
import { ProbabilityBadge } from '@/components/ProbabilityBadge';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { SEO } from '@/components/SEO';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const ValueBets = () => {
  const [matches, setMatches] = useState([]);
  const [probabilitiesByMatch, setProbabilitiesByMatch] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // desc: maior->menor, asc: menor->maior

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) Todas as partidas do dia (base da listagem)
        const matchesRes = await fetch(`${API_URL_BACK}matches/today/`);
        const matchesData = await matchesRes.json();
        const dayMatches = Array.isArray(matchesData) ? matchesData : [];
        setMatches(dayMatches);

        // 2) Probabilidades para TODOS os jogos do dia (2 mercados: over_25 e btts_yes)
        const probsRes = await fetch(`${API_URL_BACK}probabilities/today/`);
        const probsData = await probsRes.json();
        const probsList = Array.isArray(probsData) ? probsData : [];

        const grouped = {};
        for (const item of probsList) {
          const matchId = Number(item?.match_id);
          if (!Number.isFinite(matchId)) continue;

          grouped[matchId] = {
            over_25: typeof item?.over_25 === 'number' ? item.over_25 : Number(item?.over_25),
            btts_yes: typeof item?.btts_yes === 'number' ? item.btts_yes : Number(item?.btts_yes),
          };
        }

        setProbabilitiesByMatch(grouped);
      } catch (err) {
        console.error('Erro ao carregar probabilidades:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sortedMatches = useMemo(() => {
    const getScore = (matchId) => {
      const p = probabilitiesByMatch?.[matchId];
      const a = typeof p?.over_25 === 'number' && Number.isFinite(p.over_25) ? p.over_25 : null;
      const b = typeof p?.btts_yes === 'number' && Number.isFinite(p.btts_yes) ? p.btts_yes : null;
      if (a === null && b === null) return null;
      if (a === null) return b;
      if (b === null) return a;
      return Math.max(a, b);
    };

    const withScore = matches.map((m) => ({ match: m, score: getScore(m.id) }));

    withScore.sort((x, y) => {
      const ax = x.score;
      const ay = y.score;

      // Sempre manter "sem probabilidade" no final
      const xNull = ax === null;
      const yNull = ay === null;
      if (xNull && yNull) return 0;
      if (xNull) return 1;
      if (yNull) return -1;

      return sortOrder === 'asc' ? ax - ay : ay - ax;
    });

    return withScore.map((x) => x.match);
  }, [matches, probabilitiesByMatch, sortOrder]);

  const renderProbability = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return (
        <span className="text-xs font-semibold text-muted-foreground">
          --
        </span>
      );
    }
    return <ProbabilityBadge percentage={value} size="sm" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Probabilidades do dia"
        description="Probabilidades estimadas para Mais de 2.5 gols (Over 2.5) e Ambos marcam (BTTS) em todas as partidas de hoje."
        pathname="/value-bets"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <SectionTitle
            title="Probabilidades do Dia"
            subtitle="Mais de 2.5 Gols e Ambos Marcam (BTTS) para todas as partidas de hoje"
            icon={Lightbulb}
          />

          <div className="pt-1">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                setSortOrder((s) => {
                  const next = s === 'desc' ? 'asc' : 'desc';
                  trackEvent('filter_used', {
                    page: 'value_bets',
                    filter: 'sort_order',
                    value: next,
                  });
                  return next;
                })
              }
              title="Ordenar"
            >
              <ArrowDownUp className="w-4 h-4" />
              {sortOrder === 'desc' ? 'Maior → menor' : 'Menor → maior'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando probabilidades...
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma partida disponível hoje
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMatches.map((match) => {
              const probs = probabilitiesByMatch?.[match.id];

              return (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="block bg-card border border-border rounded-lg p-4 hover:border-primary hover:glow-subtle transition-all group"
                  onClick={() =>
                    trackEvent('match_click', {
                      match_id: String(match.id),
                      source: 'value_bets_list',
                    })
                  }
                >
                  <div className="space-y-3">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {match.league}
                      </span>
                      <span className="text-xs text-primary font-medium">
                        {match.date}
                      </span>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-3 gap-3 items-center py-2">
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
                          <p className="text-lg font-bold text-muted-foreground">VS</p>
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

                    {/* Probabilidades */}
                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Mais de 2.5 Gols
                        </span>
                        <div className="flex-shrink-0">
                          {renderProbability(probs?.over_25)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Ambos marcam (BTTS)
                        </span>
                        <div className="flex-shrink-0">
                          {renderProbability(probs?.btts_yes)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValueBets;

