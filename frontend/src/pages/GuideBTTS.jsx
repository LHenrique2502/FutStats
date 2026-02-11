import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideBTTS = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="BTTS: como interpretar"
        description="Guia evergreen: o que é BTTS (Ambos marcam), como interpretar probabilidades e quais armadilhas evitar."
        pathname="/guias/btts"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="BTTS (Ambos marcam)"
          subtitle="O que significa e como usar esse mercado com responsabilidade."
          icon={Users}
        />

        <Card className="border-border">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">BTTS</strong> (Both Teams To Score / Ambos
              marcam) significa que os <strong className="text-foreground">dois times fazem pelo menos um gol</strong>{' '}
              (ex.: 1x1, 2x1, 2x2).
            </p>
            <p>
              Esse mercado costuma ser sensível a contexto: um time pode ser forte ofensivo,
              mas também pode “matar” o BTTS se o adversário cria pouco.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Sinais que ajudam o BTTS
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>ambos os times finalizam/criam chances com frequência</li>
                <li>defesas concedem oportunidades (gols sofridos/chances cedidas)</li>
                <li>jogo com necessidade de resultado (não “serve” empate)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Armadilhas comuns
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>um time “mata” o jogo cedo e administra</li>
                <li>diferença grande de nível (um lado cria quase nada)</li>
                <li>amostra pequena (probabilidades instáveis)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Próximo passo (comparar com odds)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Depois de selecionar jogos com BTTS alto, compare sua estimativa com a odd
              usando probabilidade implícita e o value checker.
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

export default GuideBTTS;

