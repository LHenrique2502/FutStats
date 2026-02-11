import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideValueBet = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Value bet: conceito e prática"
        description="Guia evergreen: o que é value bet, edge, EV e como comparar odds com probabilidade implícita."
        pathname="/guias/value-bet"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Value bet (aposta de valor)"
          subtitle="Como pensar em preço vs probabilidade (sem promessas)."
          icon={Sparkles}
        />

        <Card className="border-border">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Value bet</strong> é quando o preço
              (odd) oferece um retorno esperado positivo de acordo com a sua estimativa de
              probabilidade.
            </p>
            <p>
              Em termos simples: se a sua probabilidade é maior do que a probabilidade
              implícita da odd, pode existir <strong className="text-foreground">edge</strong>.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">Edge (diferença)</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Edge ≈ p_modelo − p_implícita. Ex.: sua prob é 57% e a implícita é 50% →
                edge de +7 pontos percentuais.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Edge não é garantia de acerto no jogo — é uma ideia de “vantagem” no preço.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">EV (valor esperado)</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                EV é o retorno esperado por unidade apostada, dado p e odd. Ele ajuda a
                comparar apostas diferentes com a mesma régua.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                EV positivo não elimina variância. Gestão de banca continua obrigatória.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Checklist rápido (antes de apostar)
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>qual é a odd e qual a probabilidade implícita?</li>
              <li>de onde vem sua probabilidade (amostra, modelo, contexto)?</li>
              <li>a margem do mercado está alta (overround)?</li>
              <li>qual tamanho de stake faz sentido para sua banca?</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Aplicar no FutStats</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use o value checker para comparar sua probabilidade com a odd e salvar o link
              para compartilhar/consultar depois.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/ferramentas/value-checker" className="flex-1">
                <Button className="w-full">Abrir value checker</Button>
              </Link>
              <Link to="/ferramentas/probabilidade-implicita" className="flex-1">
                <Button variant="outline" className="w-full">
                  Probabilidade implícita
                </Button>
              </Link>
              <Link to="/metodologia" className="flex-1">
                <Button variant="outline" className="w-full">
                  Metodologia
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Apostas envolvem risco. Faça gestão de banca e jogue com responsabilidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideValueBet;

