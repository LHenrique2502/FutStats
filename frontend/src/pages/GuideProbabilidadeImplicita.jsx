import { Link } from 'react-router-dom';
import { Sigma } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideProbabilidadeImplicita = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Probabilidade implícita"
        description="Guia evergreen: como converter odds em probabilidade implícita, entender overround (margem) e estimar odds justas."
        pathname="/guias/probabilidade-implicita"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Probabilidade implícita (odd → probabilidade)"
          subtitle="A base para comparar suas estimativas com o preço do mercado."
          icon={Sigma}
        />

        <Card className="border-border">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              A <strong className="text-foreground">probabilidade implícita</strong> é uma
              aproximação do que a odd está “precificando”.
            </p>
            <p>
              Regra prática (odds decimais):{' '}
              <strong className="text-foreground">p ≈ 1 / odd</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Ex.: odd 2.00 → 50%; odd 1.50 → 66,7%; odd 3.00 → 33,3%.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">Overround (margem)</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Em mercados com várias seleções (ex.: 1X2), a soma das implícitas costuma
                passar de 100%. Esse excedente é o{' '}
                <strong className="text-foreground">overround</strong> (margem do mercado).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>2 vias: overround ≈ (pA + pB) − 1</li>
                <li>3 vias: overround ≈ (p1 + pX + p2) − 1</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">Odds “justas”</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Uma forma simples de estimar odds “justas” é normalizar as probabilidades
                implícitas (dividir cada p pela soma). Isso remove a margem de forma
                aproximada.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depois, a odd justa ≈ 1 / p_normalizada.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Aplicar na prática (em 30 segundos)
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>pegue a odd do mercado</li>
              <li>converta em probabilidade implícita</li>
              <li>compare com a sua estimativa (ou do modelo)</li>
              <li>se sua probabilidade for maior, pode existir “edge”</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to="/ferramentas/probabilidade-implicita" className="flex-1">
                <Button className="w-full">Abrir calculadora</Button>
              </Link>
              <Link to="/ferramentas/value-checker" className="flex-1">
                <Button variant="outline" className="w-full">
                  Ir para o value checker
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideProbabilidadeImplicita;

