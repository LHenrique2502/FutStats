import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Flag, Info } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { SectionTitle } from '@/components/SectionTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { leagueSeo } from '@/data/leagueSeo';
import { trackEvent } from '@/lib/analytics';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

function impliedPct(odd) {
  const n = typeof odd === 'number' ? odd : Number(odd);
  if (!Number.isFinite(n) || n <= 1) return null;
  return (1 / n) * 100;
}

function fmtOdd(o) {
  const n = typeof o === 'number' ? o : Number(o);
  if (!Number.isFinite(n)) return '--';
  return n.toFixed(2);
}

function fmtPct(p) {
  const n = typeof p === 'number' ? p : Number(p);
  if (!Number.isFinite(n)) return '--';
  return `${n.toFixed(2)}%`;
}

function toOrigin() {
  if (typeof window === 'undefined') return '';
  return window.location.origin || '';
}

const FAQ = [
  {
    q: 'O que é Over 2.5?',
    a: 'Over 2.5 significa 3 ou mais gols somados no jogo (ex.: 2x1, 3x0, 2x2).',
  },
  {
    q: 'O que é BTTS?',
    a: 'BTTS (Ambos marcam) significa que os dois times fazem pelo menos 1 gol.',
  },
  {
    q: 'Como calcular probabilidade implícita da odd?',
    a: 'Em odds decimais, probabilidade implícita ≈ 1/odd. Ex.: odd 2.00 ≈ 50%.',
  },
  {
    q: 'O que é edge?',
    a: 'Edge é a diferença entre a probabilidade do FutStats e a probabilidade implícita da odd. Edge positivo pode indicar valor, mas não garante acerto.',
  },
  {
    q: 'Por que a lista muda?',
    a: 'Odds variam ao longo do dia; quando a odd muda, a implícita e o edge também mudam.',
  },
];

function marketMeta(displayLeague, marketSlug, dayLabel) {
  const when = dayLabel || 'hoje';
  if (marketSlug === 'btts') {
    return {
      key: 'btts_yes',
      title: `BTTS em ${displayLeague} ${when}: melhores odds + edge`,
      description: `Ranking de ${displayLeague} ${when} para BTTS (Sim) com melhor odd, probabilidade implícita, nossa probabilidade e edge.`,
      ga4Market: 'btts',
    };
  }
  if (marketSlug === '1x2') {
    return {
      key: '1x2',
      title: `1X2 em ${displayLeague} ${when}: odds + edge`,
      description: `Odds de 1X2 (casa/empate/fora) em ${displayLeague} ${when}, com probabilidade implícita e estimativa do FutStats.`,
      ga4Market: '1x2',
    };
  }
  return {
    key: 'over_25',
    title: `Over 2.5 em ${displayLeague} ${when}: melhores odds + edge`,
    description: `Ranking de ${displayLeague} ${when} para Over 2.5 com melhor odd, probabilidade implícita, nossa probabilidade e edge.`,
    ga4Market: 'over_25',
  };
}

const LeagueMarketToday = () => {
  const { leagueSlug, market, date } = useParams();
  const marketSlug = market || 'over-25';
  const dayParam = date || 'hoje';
  const dayLabel = useMemo(() => {
    if (!dayParam || dayParam === 'hoje') return 'hoje';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayParam);
    if (!m) return dayParam;
    return `${m[3]}/${m[2]}`;
  }, [dayParam]);

  const league = useMemo(() => {
    return leagueSeo.find((l) => l.slug === leagueSlug) || null;
  }, [leagueSlug]);

  const displayLeague = league?.displayName || 'Liga';
  const meta = useMemo(() => marketMeta(displayLeague, marketSlug, dayLabel), [
    displayLeague,
    marketSlug,
    dayLabel,
  ]);

  const pathname = `/odds/${leagueSlug}/${marketSlug}/${dayParam}`;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    trackEvent('league_market_open', {
      league: league?.ga4League || String(leagueSlug || ''),
      market: meta.ga4Market,
      page_path: pathname,
    });
  }, [league?.ga4League, leagueSlug, meta.ga4Market, pathname]);

  useEffect(() => {
    const load = async () => {
      if (!league?.leagueName) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const url =
          dayParam === 'hoje'
            ? `${API_URL_BACK}odds/today/?league=${encodeURIComponent(league.leagueName)}&days_ahead=1`
            : `${API_URL_BACK}odds/today/?league=${encodeURIComponent(
                league.leagueName
              )}&date=${encodeURIComponent(dayParam)}`;
        const res = await fetch(url);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Erro ao carregar odds do dia:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [league?.leagueName, dayParam]);

  const rows = useMemo(() => {
    const list = Array.isArray(items) ? items : [];

    if (meta.key === '1x2') {
      const score = (m) => {
        const p = m?.probabilities || {};
        const b = m?.best_by_market || {};
        const edges = ['home_win', 'draw', 'away_win'].map((k) => {
          const odd = b?.[k]?.odd;
          const imp = impliedPct(odd);
          const model = typeof p?.[k] === 'number' ? p[k] : null;
          if (imp === null || model === null) return null;
          return model - imp;
        });
        const valid = edges.filter((x) => typeof x === 'number' && Number.isFinite(x));
        return valid.length ? Math.max(...valid) : null;
      };

      const copy = [...list];
      copy.sort((a, b) => {
        const sa = score(a);
        const sb = score(b);
        if (sa === null && sb === null) return 0;
        if (sa === null) return 1;
        if (sb === null) return -1;
        return sb - sa;
      });
      return copy;
    }

    const key = meta.key;
    const copy = [...list];
    copy.sort((a, b) => {
      const pa = a?.probabilities?.[key];
      const pb = b?.probabilities?.[key];
      const oa = a?.best_by_market?.[key]?.odd;
      const ob = b?.best_by_market?.[key]?.odd;
      const ia = impliedPct(oa);
      const ib = impliedPct(ob);
      const ea = typeof pa === 'number' && ia !== null ? pa - ia : null;
      const eb = typeof pb === 'number' && ib !== null ? pb - ib : null;
      if (ea === null && eb === null) return 0;
      if (ea === null) return 1;
      if (eb === null) return -1;
      return eb - ea;
    });
    return copy;
  }, [items, meta.key]);

  const itemListSchema = useMemo(() => {
    const origin = toOrigin();
    const els = rows.slice(0, 25).map((m, idx) => {
      const home = m?.homeTeam?.name || 'Casa';
      const away = m?.awayTeam?.name || 'Fora';
      const nm =
        meta.key === '1x2'
          ? `${home} x ${away} — 1X2`
          : `${home} x ${away} — ${meta.key === 'over_25' ? 'Over 2.5' : 'BTTS'}`;
      const url = origin
        ? `${origin}/match/${m?.id}?utm_source=seo&utm_medium=itemlist&utm_campaign=${encodeURIComponent(
            `${leagueSlug}_${marketSlug}_hoje`
          )}`
        : `/match/${m?.id}`;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: nm,
        url,
      };
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: meta.title,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: Math.min(25, rows.length),
      itemListElement: els,
    };
  }, [rows, meta.title, leagueSlug, marketSlug]);

  const faqSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((x) => ({
        '@type': 'Question',
        name: x.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: x.a,
        },
      })),
    };
  }, []);

  const renderEdge = (modelPct, odd) => {
    const imp = impliedPct(odd);
    if (typeof modelPct !== 'number' || imp === null) return '--';
    const edge = modelPct - imp;
    const cls =
      edge >= 0 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground font-semibold';
    const sign = edge > 0 ? '+' : '';
    return <span className={cls}>{`${sign}${edge.toFixed(2)}%`}</span>;
  };

  if (!league) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Liga não encontrada"
          description="Essa liga não está configurada no FutStats."
          pathname={pathname}
          noIndex
        />
        <div className="container mx-auto px-4 py-10">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              Essa liga não está configurada.
            </p>
            <div className="mt-4">
              <Link to="/value-bets-hoje">
                <Button>Voltar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={meta.title} description={meta.description} pathname={pathname} />

      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title={meta.title}
          subtitle={`Liga: ${displayLeague}. Ranking por edge (probabilidade vs odd).`}
          icon={Flag}
        />

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Edge = probabilidade do FutStats − probabilidade implícita da odd (1/odd). Isso é informativo e não garante resultado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/ferramentas/value-checker" className="flex-1">
                  <Button
                    className="w-full"
                    onClick={() =>
                      trackEvent('cta_click_valuechecker', {
                        ui_source: 'league_market_today',
                        league: league.ga4League,
                        market: meta.ga4Market,
                      })
                    }
                  >
                    Abrir value checker
                  </Button>
                </Link>
                <Link to="/guias/value-bet" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      trackEvent('cta_click_guide_valuebet', {
                        ui_source: 'league_market_today',
                        league: league.ga4League,
                        market: meta.ga4Market,
                      })
                    }
                  >
                    Ler guia de value bet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Carregando...</div>
        ) : rows.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nenhum jogo/odd encontrado para {displayLeague} hoje. Se você acabou de configurar a liga, importe odds e tente novamente.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogo</TableHead>
                  <TableHead className="hidden md:table-cell">Hora</TableHead>
                  {meta.key === '1x2' ? (
                    <>
                      <TableHead className="text-right">1</TableHead>
                      <TableHead className="text-right">X</TableHead>
                      <TableHead className="text-right">2</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Edge (máx)</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-right">Odd</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Implícita</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Nossa</TableHead>
                      <TableHead className="text-right">Edge</TableHead>
                      <TableHead className="hidden lg:table-cell">Casa</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => {
                  const home = m?.homeTeam?.name || '';
                  const away = m?.awayTeam?.name || '';
                  const time = m?.time || '--';
                  const probs = m?.probabilities || {};
                  const best = m?.best_by_market || {};

                  if (meta.key === '1x2') {
                    const o1 = best?.home_win?.odd ?? null;
                    const ox = best?.draw?.odd ?? null;
                    const o2 = best?.away_win?.odd ?? null;
                    const e1 =
                      typeof probs?.home_win === 'number' && impliedPct(o1) !== null
                        ? probs.home_win - impliedPct(o1)
                        : null;
                    const ex =
                      typeof probs?.draw === 'number' && impliedPct(ox) !== null
                        ? probs.draw - impliedPct(ox)
                        : null;
                    const e2 =
                      typeof probs?.away_win === 'number' && impliedPct(o2) !== null
                        ? probs.away_win - impliedPct(o2)
                        : null;
                    const edges = [e1, ex, e2].filter(
                      (x) => typeof x === 'number' && Number.isFinite(x)
                    );
                    const eMax = edges.length ? Math.max(...edges) : null;
                    const eMaxStr =
                      eMax === null ? '--' : `${eMax > 0 ? '+' : ''}${eMax.toFixed(2)}%`;
                    const eMaxCls =
                      eMax !== null && eMax >= 0
                        ? 'text-emerald-600 font-semibold'
                        : 'text-muted-foreground font-semibold';

                    return (
                      <TableRow key={String(m?.id)}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/match/${m?.id}`}
                            className="hover:underline"
                            onClick={() =>
                              trackEvent('match_click', {
                                match_id: String(m?.id),
                                ui_source: 'league_market_today',
                                league: league.ga4League,
                                market: meta.ga4Market,
                              })
                            }
                          >
                            {home} x {away}
                          </Link>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {displayLeague}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {time}
                        </TableCell>
                        <TableCell className="text-right">{fmtOdd(o1)}</TableCell>
                        <TableCell className="text-right">{fmtOdd(ox)}</TableCell>
                        <TableCell className="text-right">{fmtOdd(o2)}</TableCell>
                        <TableCell className={`text-right hidden lg:table-cell ${eMaxCls}`}>
                          {eMaxStr}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const key = meta.key;
                  const odd = best?.[key]?.odd ?? null;
                  const bm = best?.[key]?.bookmaker || null;
                  const isBr = !!best?.[key]?.is_brazilian;
                  const imp = impliedPct(odd);
                  const model = typeof probs?.[key] === 'number' ? probs[key] : null;

                  return (
                    <TableRow key={String(m?.id)}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/match/${m?.id}`}
                          className="hover:underline"
                          onClick={() =>
                            trackEvent('match_click', {
                              match_id: String(m?.id),
                              ui_source: 'league_market_today',
                              league: league.ga4League,
                              market: meta.ga4Market,
                            })
                          }
                        >
                          {home} x {away}
                        </Link>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {bm ? (
                            <Badge variant={isBr ? 'secondary' : 'outline'}>{bm}</Badge>
                          ) : (
                            <Badge variant="outline">Sem odd</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {time}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{fmtOdd(odd)}</TableCell>
                      <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                        {imp === null ? '--' : fmtPct(imp)}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                        {model === null ? '--' : fmtPct(model)}
                      </TableCell>
                      <TableCell className="text-right">{renderEdge(model, odd)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {bm || '--'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground">Perguntas frequentes</h2>
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((x, idx) => (
                <AccordionItem key={x.q} value={`faq-${idx}`}>
                  <AccordionTrigger>{x.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{x.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/value-bets-hoje" className="flex-1">
            <Button className="w-full">Ver Value Bets (geral)</Button>
          </Link>
          <Link to="/over-25-odds-hoje" className="flex-1">
            <Button variant="outline" className="w-full">
              Over 2.5 (geral)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeagueMarketToday;

