import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Percent, Link2, Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

function toNumber(value) {
  const n = Number(String(value ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
}

function clamp01(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  return Math.max(0, Math.min(1, x));
}

function impliedProb(odd) {
  if (typeof odd !== 'number' || !Number.isFinite(odd) || odd <= 1) return null;
  return 1 / odd;
}

function fmtPct01(p) {
  if (typeof p !== 'number' || !Number.isFinite(p)) return '--';
  return `${(p * 100).toFixed(2)}%`;
}

function fmtPctSigned01(p) {
  if (typeof p !== 'number' || !Number.isFinite(p)) return '--';
  const sign = p > 0 ? '+' : '';
  return `${sign}${(p * 100).toFixed(2)}%`;
}

function fmtNumber(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return '--';
  return x.toFixed(4);
}

// EV por 1 unidade apostada (decimal):
// EV = p*(odd-1) - (1-p)
function expectedValue(odd, p) {
  if (typeof odd !== 'number' || !Number.isFinite(odd) || odd <= 1) return null;
  if (typeof p !== 'number' || !Number.isFinite(p)) return null;
  const b = odd - 1;
  const q = 1 - p;
  return p * b - q;
}

// Kelly (fração da banca): f* = (b*p - q) / b
function kellyFraction(odd, p) {
  if (typeof odd !== 'number' || !Number.isFinite(odd) || odd <= 1) return null;
  if (typeof p !== 'number' || !Number.isFinite(p)) return null;
  const b = odd - 1;
  const q = 1 - p;
  return (b * p - q) / b;
}

const ValueChecker = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [oddText, setOddText] = useState('');
  const [probText, setProbText] = useState(''); // em %
  const [kellyMultiplier, setKellyMultiplier] = useState('0.25'); // Kelly fracionado

  // pré-preencher via URL (?odd=2.10&p=57)
  useEffect(() => {
    const odd = searchParams.get('odd');
    const p = searchParams.get('p');
    const k = searchParams.get('k');
    if (odd && !oddText) setOddText(odd);
    if (p && !probText) setProbText(p);
    if (k && !kellyMultiplier) setKellyMultiplier(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calc = useMemo(() => {
    const odd = toNumber(oddText);
    const pPct = toNumber(probText);
    const p = pPct === null ? null : clamp01(pPct / 100);
    const imp = impliedProb(odd);
    const edge = p !== null && imp !== null ? p - imp : null;
    const ev = p !== null && odd !== null ? expectedValue(odd, p) : null;
    const kRaw = p !== null && odd !== null ? kellyFraction(odd, p) : null;
    const kMul = toNumber(kellyMultiplier);
    const kFrac =
      kRaw !== null && kMul !== null ? Math.max(0, kRaw) * Math.max(0, kMul) : null;

    return { odd, p, imp, edge, ev, kRaw, kMul, kFrac };
  }, [oddText, probText, kellyMultiplier]);

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (calc.odd !== null) params.set('odd', String(calc.odd));
    if (calc.p !== null) params.set('p', String((calc.p * 100).toFixed(2)));
    if (calc.kMul !== null) params.set('k', String(calc.kMul));
    const qs = params.toString();
    return `${window.location.origin}/ferramentas/value-checker${qs ? `?${qs}` : ''}`;
  }, [calc.odd, calc.p, calc.kMul]);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast('Link copiado', { description: 'Você pode colar e compartilhar agora.' });
    } catch {
      toast('Não foi possível copiar', {
        description: 'Seu navegador bloqueou o acesso à área de transferência.',
      });
    }
  };

  const onUpdateUrl = () => {
    const params = {};
    if (calc.odd !== null) params.odd = String(calc.odd);
    if (calc.p !== null) params.p = String((calc.p * 100).toFixed(2));
    if (calc.kMul !== null) params.k = String(calc.kMul);
    setSearchParams(params, { replace: true });
    toast('URL atualizada', { description: 'Os valores foram salvos na URL.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Value checker"
        description="Ferramenta gratuita: compare sua probabilidade com a odd (probabilidade implícita), veja edge, EV estimado e Kelly fracionado."
        pathname="/ferramentas/value-checker"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Value checker"
          subtitle="Compare sua probabilidade com a probabilidade implícita da odd."
          icon={Percent}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="odd">Odd (decimal)</Label>
                  <Input
                    id="odd"
                    inputMode="decimal"
                    placeholder="Ex.: 2.10"
                    value={oddText}
                    onChange={(e) => setOddText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p">Sua probabilidade (%)</Label>
                  <Input
                    id="p"
                    inputMode="decimal"
                    placeholder="Ex.: 57"
                    value={probText}
                    onChange={(e) => setProbText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="k">Kelly fracionado (multiplicador)</Label>
                <Input
                  id="k"
                  inputMode="decimal"
                  placeholder="Ex.: 0.25"
                  value={kellyMultiplier}
                  onChange={(e) => setKellyMultiplier(e.target.value)}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ex.: 0.25 = 1/4 de Kelly. Se você não usa Kelly, pode ignorar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2" onClick={onUpdateUrl}>
                  <Link2 className="w-4 h-4" />
                  Salvar na URL
                </Button>
                <Button className="gap-2" onClick={onCopyLink}>
                  <Sparkles className="w-4 h-4" />
                  Copiar link
                </Button>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                Apostas envolvem risco. Este cálculo é informativo e não garante resultado.
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Probabilidade implícita
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct01(calc.imp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Edge (p − implícita)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPctSigned01(calc.edge)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">EV (por 1 unidade)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {calc.ev === null ? '--' : `${fmtPctSigned01(calc.ev)}`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  EV aqui é um valor aproximado em % por unidade apostada (ex.: +3%).
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-foreground">Kelly</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kelly (bruto)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {calc.kRaw === null ? '--' : fmtNumber(calc.kRaw)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kelly fracionado</span>
                  <span className="text-sm font-semibold text-foreground">
                    {calc.kFrac === null ? '--' : fmtNumber(calc.kFrac)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kelly é sensível a erro de probabilidade. Muitos apostadores usam frações
                  pequenas (ex.: 0.25).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/ferramentas/probabilidade-implicita">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Abrir probabilidade implícita
                  </Button>
                </Link>
                <Link to="/guias/value-bet">
                  <Button className="w-full sm:w-auto">Ler guia de value bet</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValueChecker;

