import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Info } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function toNumber(value) {
  const n = Number(String(value ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
}

function impliedProb(odd) {
  if (typeof odd !== 'number' || !Number.isFinite(odd) || odd <= 1) return null;
  return 1 / odd;
}

function fmtPct(p) {
  if (typeof p !== 'number' || !Number.isFinite(p)) return '--';
  return `${(p * 100).toFixed(2)}%`;
}

function fmtOdd(o) {
  if (typeof o !== 'number' || !Number.isFinite(o) || o <= 0) return '--';
  return o.toFixed(2);
}

const ImpliedProbability = () => {
  const [singleOdd, setSingleOdd] = useState('');
  const [twoA, setTwoA] = useState('');
  const [twoB, setTwoB] = useState('');
  const [threeA, setThreeA] = useState('');
  const [threeB, setThreeB] = useState('');
  const [threeC, setThreeC] = useState('');

  const single = useMemo(() => {
    const odd = toNumber(singleOdd);
    const p = impliedProb(odd);
    return { odd, p };
  }, [singleOdd]);

  const twoWay = useMemo(() => {
    const aOdd = toNumber(twoA);
    const bOdd = toNumber(twoB);
    const pa = impliedProb(aOdd);
    const pb = impliedProb(bOdd);
    const sum = (pa ?? 0) + (pb ?? 0);
    const overround = pa !== null && pb !== null ? sum - 1 : null;
    const na = pa !== null && pb !== null && sum > 0 ? pa / sum : null;
    const nb = pa !== null && pb !== null && sum > 0 ? pb / sum : null;
    return {
      aOdd,
      bOdd,
      pa,
      pb,
      sum: pa !== null && pb !== null ? sum : null,
      overround,
      na,
      nb,
      fairA: na ? 1 / na : null,
      fairB: nb ? 1 / nb : null,
    };
  }, [twoA, twoB]);

  const threeWay = useMemo(() => {
    const aOdd = toNumber(threeA);
    const bOdd = toNumber(threeB);
    const cOdd = toNumber(threeC);
    const pa = impliedProb(aOdd);
    const pb = impliedProb(bOdd);
    const pc = impliedProb(cOdd);
    const sum = (pa ?? 0) + (pb ?? 0) + (pc ?? 0);
    const allOk = pa !== null && pb !== null && pc !== null;
    const overround = allOk ? sum - 1 : null;
    const na = allOk && sum > 0 ? pa / sum : null;
    const nb = allOk && sum > 0 ? pb / sum : null;
    const nc = allOk && sum > 0 ? pc / sum : null;
    return {
      aOdd,
      bOdd,
      cOdd,
      pa,
      pb,
      pc,
      sum: allOk ? sum : null,
      overround,
      na,
      nb,
      nc,
      fairA: na ? 1 / na : null,
      fairB: nb ? 1 / nb : null,
      fairC: nc ? 1 / nc : null,
    };
  }, [threeA, threeB, threeC]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Probabilidade implícita"
        description="Calculadora gratuita para converter odds em probabilidade implícita, estimar overround (margem do mercado) e odds justas."
        pathname="/ferramentas/probabilidade-implicita"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Probabilidade implícita"
          subtitle="Converta odds em probabilidade e estime a margem do mercado (overround)."
          icon={Calculator}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Odd única</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="odd-single">Odd (decimal)</Label>
                <Input
                  id="odd-single"
                  inputMode="decimal"
                  placeholder="Ex.: 2.10"
                  value={singleOdd}
                  onChange={(e) => setSingleOdd(e.target.value)}
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Probabilidade implícita
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(single.p)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fórmula</span>
                  <span className="text-sm text-foreground">p ≈ 1 / odd</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Mercado 2 vias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="odd-2a">Odd A</Label>
                  <Input
                    id="odd-2a"
                    inputMode="decimal"
                    placeholder="Ex.: 1.80"
                    value={twoA}
                    onChange={(e) => setTwoA(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odd-2b">Odd B</Label>
                  <Input
                    id="odd-2b"
                    inputMode="decimal"
                    placeholder="Ex.: 2.05"
                    value={twoB}
                    onChange={(e) => setTwoB(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implícita (A)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(twoWay.pa)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implícita (B)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(twoWay.pb)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm text-muted-foreground">Overround</span>
                  <span className="text-sm font-semibold text-foreground">
                    {twoWay.overround === null ? '--' : `${(twoWay.overround * 100).toFixed(2)}%`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Overround ≈ (pA + pB) − 1. Quanto maior, maior a margem do mercado.
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  Odds “justas” aproximadas (normalizadas)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">A</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtOdd(twoWay.fairA)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">B</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtOdd(twoWay.fairB)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Mercado 3 vias (1X2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="odd-3a">Casa</Label>
                  <Input
                    id="odd-3a"
                    inputMode="decimal"
                    placeholder="Ex.: 2.10"
                    value={threeA}
                    onChange={(e) => setThreeA(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odd-3b">Empate</Label>
                  <Input
                    id="odd-3b"
                    inputMode="decimal"
                    placeholder="Ex.: 3.20"
                    value={threeB}
                    onChange={(e) => setThreeB(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odd-3c">Fora</Label>
                  <Input
                    id="odd-3c"
                    inputMode="decimal"
                    placeholder="Ex.: 3.60"
                    value={threeC}
                    onChange={(e) => setThreeC(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implícita (Casa)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(threeWay.pa)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implícita (Empate)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(threeWay.pb)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implícita (Fora)</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtPct(threeWay.pc)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm text-muted-foreground">Overround</span>
                  <span className="text-sm font-semibold text-foreground">
                    {threeWay.overround === null ? '--' : `${(threeWay.overround * 100).toFixed(2)}%`}
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  Odds “justas” aproximadas (normalizadas)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Casa</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtOdd(threeWay.fairA)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Empate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtOdd(threeWay.fairB)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fora</span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmtOdd(threeWay.fairC)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  Interpretação rápida
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A probabilidade implícita é uma aproximação. Em mercados com várias
                  seleções (2 vias/3 vias), a soma das implícitas costuma passar de 100% por
                  causa da margem (overround).
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link to="/guias/probabilidade-implicita">
                    <Button variant="outline">Ler guia completo</Button>
                  </Link>
                  <Link to="/ferramentas/value-checker">
                    <Button>Ir para o value checker</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImpliedProbability;

