import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideOver25 = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Over 2.5: como interpretar"
        description="Guia evergreen: o que é Over 2.5, como interpretar probabilidades e quais sinais observar antes de apostar."
        pathname="/guias/over-25"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Over 2.5 (Mais de 2,5 gols)"
          subtitle="O que significa, como interpretar e como usar com bom senso."
          icon={Flame}
        />

        <Card className="border-border">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Over 2.5</strong> significa que o jogo
              termina com <strong className="text-foreground">3 ou mais gols</strong>{' '}
              somados (ex.: 2x1, 3x0, 2x2).
            </p>
            <p>
              Quando você vê uma probabilidade (ex.: 62%), pense nisso como uma{' '}
              <strong className="text-foreground">estimativa</strong>. Em apostas, o que
              importa é comparar essa estimativa com o “preço” (odd) do mercado.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Como interpretar (rápido)
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  Probabilidade alta não significa certeza — pense em longo prazo.
                </li>
                <li>
                  Amostra pequena tende a ser mais instável (o número “balança” mais).
                </li>
                <li>
                  Contexto pesa: escalações, calendário, motivação, estilo de jogo.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                O que observar antes de apostar
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>médias de gols (a favor e contra)</li>
                <li>tendência recente (últimos jogos) e qualidade da amostra</li>
                <li>perfil do jogo (favorito vs azarão, ritmo, necessidade de resultado)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Próximo passo (aplicar na prática)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use a página de “Probabilidades do Dia” para filtrar jogos com Over 2.5 alto e
              depois compare com a odd usando a probabilidade implícita / value checker.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/value-bets" className="flex-1">
                <Button className="w-full">Probabilidades do Dia</Button>
              </Link>
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
      </div>
    </div>
  );
};

export default GuideOver25;

