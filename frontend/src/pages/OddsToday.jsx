import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ExternalLink } from 'lucide-react';
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

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const MARKET = {
  over_25: {
    slug: 'over-25',
    title: 'Over 2.5 (Odds hoje)',
    desc: 'Comparação de odds e edge para Over 2.5 nos jogos do dia.',
  },
  btts_yes: {
    slug: 'btts',
    title: 'BTTS (Odds hoje)',
    desc: 'Comparação de odds e edge para BTTS (Sim) nos jogos do dia.',
  },
  oneXtwo: {
    slug: '1x2',
    title: '1X2 (Odds hoje)',
    desc: 'Odds por resultado (1X2) para jogos do dia, com foco em edge.',
  },
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

function usePathname() {
  const loc = useLocation();
  return loc?.pathname || '/';
}

const OddsToday = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(50);

  const page = useMemo(() => {
    if (pathname.includes('/over-25-odds-hoje')) return 'over_25';
    if (pathname.includes('/btts-odds-hoje')) return 'btts_yes';
    if (pathname.includes('/1x2-odds-hoje')) return 'oneXtwo';
    return 'over_25';
  }, [pathname]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL_BACK}value-bets/?limit=${limit}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Erro ao carregar odds/value:', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit]);

  const filtered = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (page === 'over_25') return list.filter((r) => r?.bet_type === 'over_25');
    if (page === 'btts_yes') return list.filter((r) => r?.bet_type === 'btts_yes');
    return list.filter(
      (r) => r?.bet_type === 'home_win' || r?.bet_type === 'draw' || r?.bet_type === 'away_win'
    );
  }, [rows, page]);

  const meta = MARKET[page] || MARKET.over_25;
  const canonical = page === 'over_25' ? '/over-25-odds-hoje' : page === 'btts_yes' ? '/btts-odds-hoje' : '/1x2-odds-hoje';

  return (
    <div className="min-h-screen bg-background">
      <SEO title={meta.title} description={meta.desc} pathname={canonical} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <SectionTitle title={meta.title} subtitle={meta.desc} icon={BarChart3} />
          <div className="pt-1 flex items-center gap-2">
            <Button variant="outline" onClick={() => setLimit((x) => (x === 50 ? 100 : 50))}>
              {limit === 50 ? 'Mostrar 100' : 'Mostrar 50'}
            </Button>
            <Link to="/value-bets-hoje">
              <Button className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver geral
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Nenhum dado disponível.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogo</TableHead>
                  <TableHead className="hidden lg:table-cell">Liga</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Mercado</TableHead>
                  <TableHead className="text-right">Melhor odd</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Implícita</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Nossa</TableHead>
                  <TableHead className="text-right">Edge</TableHead>
                  <TableHead className="hidden lg:table-cell">Casa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`${r?.match_id}-${r?.bet_type}`}>
                    <TableCell className="font-medium">
                      <Link to={`/match/${r?.match_id}`} className="hover:underline">
                        {r?.match}
                      </Link>
                      <div className="mt-1">
                        {r?.is_brazilian_bookmaker ? (
                          <Badge variant="secondary">BR</Badge>
                        ) : (
                          <Badge variant="outline">Global</Badge>
                        )}
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
                        {r?.bet_name || r?.bet_type}
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
                      <span className="text-emerald-600 font-semibold">
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
        )}
      </div>
    </div>
  );
};

export default OddsToday;

