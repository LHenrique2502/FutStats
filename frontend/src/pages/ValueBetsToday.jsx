import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackEvent } from '@/lib/analytics';
import { getValueBetsWindow } from '@/lib/publicData';

const BET_LABEL = {
  over_25: 'Over 2.5',
  btts_yes: 'BTTS (Sim)',
  home_win: 'Casa (1)',
  draw: 'Empate (X)',
  away_win: 'Fora (2)',
};

function fmtPct(p) {
  const n = typeof p === 'number' ? p : Number(p);
  if (!Number.isFinite(n)) return '--';
  return `${n.toFixed(2)}%`;
}

function fmtOdd(o) {
  const n = typeof o === 'number' ? o : Number(o);
  if (!Number.isFinite(n)) return '--';
  return n.toFixed(2);
}

const ValueBetsToday = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getValueBetsWindow(3);
        const list = Array.isArray(data) ? data : [];
        setRows(list.slice(0, limit));
      } catch (e) {
        console.error('Erro ao carregar value bets:', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit]);

  const byType = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const grouped = {
      all: list,
      over_25: list.filter((r) => r?.bet_type === 'over_25'),
      btts_yes: list.filter((r) => r?.bet_type === 'btts_yes'),
      oneXtwo: list.filter(
        (r) => r?.bet_type === 'home_win' || r?.bet_type === 'draw' || r?.bet_type === 'away_win'
      ),
    };
    return grouped;
  }, [rows]);

  const renderTable = (list, uiSource) => {
    if (loading) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          Carregando value bets...
        </div>
      );
    }
    if (!list || list.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          Nenhuma oportunidade encontrada.
        </div>
      );
    }

    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogo</TableHead>
              <TableHead className="hidden lg:table-cell">Liga</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Mercado</TableHead>
              <TableHead className="text-right">Odd</TableHead>
              <TableHead className="text-right hidden md:table-cell">Implícita</TableHead>
              <TableHead className="text-right hidden md:table-cell">Nossa</TableHead>
              <TableHead className="text-right">Edge</TableHead>
              <TableHead className="hidden lg:table-cell">Casa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((r) => (
              <TableRow key={`${r?.match_id}-${r?.bet_type}`}>
                <TableCell className="font-medium">
                  <Link
                    to={`/match/${r?.match_id}`}
                    className="hover:underline"
                    onClick={() =>
                      trackEvent('match_click', {
                        match_id: String(r?.match_id),
                        ui_source: uiSource,
                      })
                    }
                  >
                    {r?.match}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {r?.is_brazilian_bookmaker ? (
                      <Badge variant="secondary">BR</Badge>
                    ) : (
                      <Badge variant="outline">Global</Badge>
                    )}
                    {Array.isArray(r?.available_bookmakers) && r.available_bookmakers.length > 1 ? (
                      <span className="text-xs text-muted-foreground">
                        +{r.available_bookmakers.length - 1} casas
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {r?.league || '--'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {r?.date || '--'}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-foreground">
                    {BET_LABEL[r?.bet_type] || r?.bet_name || r?.bet_type}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">{fmtOdd(r?.odd)}</TableCell>
                <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                  {fmtPct(r?.implied_probability)}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                  {fmtPct(r?.calculated_probability)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      typeof r?.difference === 'number' && r.difference >= 0
                        ? 'text-emerald-600 font-semibold'
                        : 'text-muted-foreground font-semibold'
                    }
                  >
                    {fmtPct(r?.difference)}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {r?.best_bookmaker || '--'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Value Bets Hoje"
        description="Value bets de hoje: melhores oportunidades (probabilidade vs odd), com edge e comparação por casa de apostas."
        pathname="/value-bets-hoje"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <SectionTitle
            title="Value Bets Hoje"
            subtitle="Probabilidade vs odd (implícita) e edge para os mercados principais."
            icon={TrendingUp}
          />

          <div className="pt-1 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLimit((x) => (x === 25 ? 50 : 25));
                trackEvent('filter_used', {
                  page: 'value_bets_today',
                  filter: 'limit',
                  value: limit === 25 ? '50' : '25',
                });
              }}
              title="Ajustar quantidade"
            >
              {limit === 25 ? 'Mostrar 50' : 'Mostrar 25'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            “Edge” aqui é a diferença entre nossa probabilidade e a probabilidade implícita
            da odd. Isso é informativo e não é garantia de resultado.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link to="/ferramentas/value-checker" className="flex-1">
              <Button className="w-full">Abrir value checker</Button>
            </Link>
            <Link to="/guias/value-bet" className="flex-1">
              <Button variant="outline" className="w-full">
                Ler guia de value bet
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full flex flex-wrap h-auto">
            <TabsTrigger value="all">Geral</TabsTrigger>
            <TabsTrigger value="over_25">Over 2.5</TabsTrigger>
            <TabsTrigger value="btts_yes">BTTS</TabsTrigger>
            <TabsTrigger value="oneXtwo">1X2</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderTable(byType.all, 'value_bets_today_all')}</TabsContent>
          <TabsContent value="over_25">
            {renderTable(byType.over_25, 'value_bets_today_over25')}
          </TabsContent>
          <TabsContent value="btts_yes">
            {renderTable(byType.btts_yes, 'value_bets_today_btts')}
          </TabsContent>
          <TabsContent value="oneXtwo">
            {renderTable(byType.oneXtwo, 'value_bets_today_1x2')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ValueBetsToday;

