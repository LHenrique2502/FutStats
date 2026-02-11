import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideComoUsarFutStats = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Como usar o FutStats"
        description="Guia evergreen: um fluxo simples para filtrar jogos do dia, interpretar probabilidades e comparar com odds."
        pathname="/guias/como-usar-futstats"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Como usar o FutStats (passo a passo)"
          subtitle="Um fluxo simples para priorizar jogos e reduzir ruído."
          icon={Map}
        />

        <Card className="border-border">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                Comece em <strong className="text-foreground">Probabilidades do Dia</strong>{' '}
                e ordene para ver os jogos no topo.
              </li>
              <li>
                Abra a partida e confira a <strong className="text-foreground">qualidade da amostra</strong>{' '}
                e o contexto (liga, fase, etc).
              </li>
              <li>
                Pegue as <strong className="text-foreground">odds reais</strong> e calcule a
                probabilidade implícita. Compare com a sua estimativa.
              </li>
              <li>
                Se fizer sentido, use gestão de banca (stake pequena, consistência e
                responsabilidade).
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Onde entram as ferramentas
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>probabilidade implícita: odd → prob + overround</li>
                <li>value checker: edge + EV + Kelly fracionado (opcional)</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/ferramentas/probabilidade-implicita" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Probabilidade implícita
                  </Button>
                </Link>
                <Link to="/ferramentas/value-checker" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Value checker
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Leituras recomendadas
              </h2>
              <div className="flex flex-col gap-2">
                <Link to="/guias/probabilidade-implicita">
                  <Button variant="outline" className="w-full">
                    Guia: Probabilidade implícita
                  </Button>
                </Link>
                <Link to="/guias/value-bet">
                  <Button variant="outline" className="w-full">
                    Guia: Value bet
                  </Button>
                </Link>
                <Link to="/metodologia">
                  <Button className="w-full">Metodologia</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Começar agora</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/value-bets" className="flex-1">
                <Button className="w-full">Probabilidades do Dia</Button>
              </Link>
              <Link to="/matches" className="flex-1">
                <Button variant="outline" className="w-full">
                  Partidas
                </Button>
              </Link>
              <Link to="/guias" className="flex-1">
                <Button variant="outline" className="w-full">
                  Ver guias
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Apostas envolvem risco. Não aposte mais do que você pode perder.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideComoUsarFutStats;

