import { Link } from 'react-router-dom';
import { Calculator, Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Ferramentas"
        description="Ferramentas gratuitas do FutStats: calculadora de probabilidade implícita, margem do mercado e verificador de value bet."
        pathname="/ferramentas"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Ferramentas"
          subtitle="Calculadoras rápidas para odds, probabilidade implícita e value bet."
          icon={Calculator}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Probabilidade implícita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Converta odds em probabilidade, calcule overround (margem do mercado) e veja
                odds “justas” aproximadas.
              </p>
              <div>
                <Link to="/ferramentas/probabilidade-implicita">
                  <Button className="w-full">Abrir calculadora</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Value checker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare sua probabilidade com a implícita da odd e veja edge, EV estimado e
                Kelly fracionado (opcional).
              </p>
              <div className="space-y-2">
                <Link to="/ferramentas/value-checker">
                  <Button className="w-full">Verificar value</Button>
                </Link>
                <Link to="/guias/value-bet">
                  <Button variant="outline" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Ler guia de value bet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-base font-semibold text-foreground">Páginas do dia (com odds)</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Páginas mais buscáveis/compartilháveis: value bets e odds por mercado.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to="/value-bets-hoje">
              <Button className="w-full">Value Bets Hoje</Button>
            </Link>
            <Link to="/over-25-odds-hoje">
              <Button variant="outline" className="w-full">Over 2.5 (odds)</Button>
            </Link>
            <Link to="/btts-odds-hoje">
              <Button variant="outline" className="w-full">BTTS (odds)</Button>
            </Link>
            <Link to="/1x2-odds-hoje">
              <Button variant="outline" className="w-full">1X2 (odds)</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;

