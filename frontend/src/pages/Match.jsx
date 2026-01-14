import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  AlertCircle,
  Star,
} from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { InsightsBox } from '@/components/InsightsBox';
import { ProbabilityBadge } from '@/components/ProbabilityBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { SEO } from '@/components/SEO';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Match = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    trackEvent('open_match', { match_id: id ? String(id) : undefined });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setFavorite(isFavorite(id));
  }, [id]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL_BACK}matches/${id}/`);
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.detail || `Erro ao carregar partida (${res.status})`);
        }
        const data = await res.json();
        setMatch(data);
      } catch (e) {
        setError(e?.message || 'Erro ao carregar partida');
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onToggleFavorite = () => {
    if (!match?.id) return;
    const favPayload = {
      id: String(match.id),
      title: `${match.homeTeam?.name || ''} x ${match.awayTeam?.name || ''}`.trim(),
      homeName: match.homeTeam?.name,
      awayName: match.awayTeam?.name,
      league: match.league,
      date: match.date,
      time: match.time,
      savedAt: new Date().toISOString(),
    };
    const result = toggleFavorite(favPayload);
    setFavorite(result.isFavorite);
    trackEvent('favorite_toggled', {
      match_id: String(match.id),
      is_favorite: result.isFavorite,
    });
  };

  const qualityBadge = useMemo(() => {
    const q = match?.team_rates?.quality;
    if (q === 'boa') return { label: 'Amostra boa', variant: 'secondary' };
    if (q === 'média') return { label: 'Amostra média', variant: 'secondary' };
    if (q === 'baixa') return { label: 'Amostra baixa', variant: 'outline' };
    return null;
  }, [match]);

  const insightCards = useMemo(() => {
    const insights = Array.isArray(match?.insights) ? match.insights : [];
    const mapDescription = (insightId) => {
      if (insightId === 'over25') return 'Probabilidade estimada para Mais de 2.5 gols (Over 2.5).';
      if (insightId === 'btts') return 'Probabilidade estimada para Ambos marcam (BTTS).';
      return 'Insight estatístico baseado no histórico recente.';
    };
    // Evitar misturar métricas (cartões/escanteios) com % na UI.
    return insights
      .filter((i) => i?.id === 'over25' || i?.id === 'btts')
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: mapDescription(i.id),
        probability: i.probability,
      }));
  }, [match]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={
          match?.homeTeam?.name && match?.awayTeam?.name
            ? `${match.homeTeam.name} x ${match.awayTeam.name}`
            : 'Partida'
        }
        description="Probabilidades estimadas e explicação baseada no histórico recente dos times."
        pathname={id ? `/match/${id}` : '/match'}
        noIndex={!id}
      />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando partida...
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">
                  Não foi possível carregar essa partida
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <div className="mt-4 flex gap-2">
                  <Link to="/matches">
                    <Button variant="outline">Voltar para Partidas</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : !match ? (
          <div className="text-center py-12 text-muted-foreground">
            Partida não encontrada.
          </div>
        ) : (
          <>
            {/* Match Header */}
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {match.date}
                    {match.time ? ` • ${match.time}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {qualityBadge && (
                    <Badge variant={qualityBadge.variant}>{qualityBadge.label}</Badge>
                  )}
                  <Button
                    variant={favorite ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={onToggleFavorite}
                    title={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  >
                    <Star className="w-4 h-4" />
                    {favorite ? 'Favorito' : 'Favoritar'}
                  </Button>
                </div>
              </div>

              {match.league && (
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {match.league}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-8 items-center">
                <div className="text-center space-y-3">
                  <img
                    src={match.homeTeam?.logo}
                    alt={match.homeTeam?.name}
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {match.homeTeam?.name}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-muted/50 rounded-lg py-4 px-6">
                    <p className="text-3xl font-bold text-muted-foreground">VS</p>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <img
                    src={match.awayTeam?.logo}
                    alt={match.awayTeam?.name}
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {match.awayTeam?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Probabilidades principais */}
            <section className="space-y-6">
              <SectionTitle
                title="Probabilidades da Partida"
                subtitle="Estimativas baseadas no histórico recente dos times"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Mais de 2.5 gols (Over 2.5)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Probabilidade estimada do jogo
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ProbabilityBadge percentage={match?.probabilities?.over_25} />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Ambos marcam (BTTS)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Probabilidade estimada do jogo
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ProbabilityBadge percentage={match?.probabilities?.btts_yes} />
                  </div>
                </div>
              </div>
            </section>

            {/* Match Insights */}
            <section className="space-y-6">
              <SectionTitle
                title="Insights da Partida"
                subtitle="Resumo rápido dos mercados principais"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insightCards.map((insight) => (
                  <InsightsBox
                    key={insight.id}
                    title={insight.title}
                    description={insight.description}
                    probability={insight.probability}
                  />
                ))}
              </div>
            </section>

            {/* Por que essa probabilidade? */}
            <section className="space-y-6">
              <SectionTitle
                title="Por que essa probabilidade?"
                subtitle="Como a estimativa é construída a partir do histórico recente"
              />

              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As taxas abaixo consideram os <strong className="text-foreground">últimos {match?.team_rates?.sample_limit || 5} jogos finalizados</strong>{' '}
                  disponíveis para cada equipe. Quando a amostra é menor, a confiança
                  tende a ser menor.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {match.homeTeam?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Amostra: {match?.team_rates?.home?.sample_size || 0} jogos
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Over 2.5</span>
                        <span className="text-sm font-semibold text-foreground">
                          {match?.team_rates?.home?.over_25 ?? '--'}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">BTTS</span>
                        <span className="text-sm font-semibold text-foreground">
                          {match?.team_rates?.home?.btts_yes ?? '--'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {match.awayTeam?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Amostra: {match?.team_rates?.away?.sample_size || 0} jogos
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Over 2.5</span>
                        <span className="text-sm font-semibold text-foreground">
                          {match?.team_rates?.away?.over_25 ?? '--'}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">BTTS</span>
                        <span className="text-sm font-semibold text-foreground">
                          {match?.team_rates?.away?.btts_yes ?? '--'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Gerado em {match.generated_at ? new Date(match.generated_at).toLocaleString('pt-BR') : '--'}
                  </p>
                  <Link to="/metodologia">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => trackEvent('cta_click_metodologia', { source: 'match_por_que' })}
                    >
                      Entender a metodologia
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Match;
