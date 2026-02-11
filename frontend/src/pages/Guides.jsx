import { Link } from 'react-router-dom';
import { BookOpen, Calculator, Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const guides = [
  {
    to: '/guias/over-25',
    title: 'Over 2.5: como interpretar',
    desc: 'O que é Over 2.5, quando faz sentido e como ler probabilidades.',
  },
  {
    to: '/guias/btts',
    title: 'BTTS (Ambos marcam): guia rápido',
    desc: 'Como interpretar BTTS e evitar armadilhas comuns.',
  },
  {
    to: '/guias/probabilidade-implicita',
    title: 'Probabilidade implícita',
    desc: 'Como converter odd em probabilidade e entender overround.',
  },
  {
    to: '/guias/value-bet',
    title: 'Value bet: conceito e prática',
    desc: 'O que é valor, edge e como usar EV/odds com cuidado.',
  },
  {
    to: '/guias/como-usar-futstats',
    title: 'Como usar o FutStats (passo a passo)',
    desc: 'Um fluxo simples para filtrar jogos do dia e priorizar análises.',
  },
];

const Guides = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Guias"
        description="Guias evergreen do FutStats: Over 2.5, BTTS, probabilidade implícita e value bet."
        pathname="/guias"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Guias"
          subtitle="Conteúdos evergreen para aprender e tomar decisões melhores."
          icon={BookOpen}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Card key={g.to} className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">{g.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                <Link to={g.to}>
                  <Button className="w-full">Ler guia</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Ferramentas gratuitas
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se você quer aplicar os guias na prática, use as calculadoras do FutStats.
              </p>
              <Link to="/ferramentas">
                <Button variant="outline" className="w-full">
                  Ver ferramentas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Dica de uso
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use “Probabilidades do Dia” para filtrar jogos e depois confira odds e value
                em cada partida.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/value-bets" className="flex-1">
                  <Button className="w-full">Probabilidades do Dia</Button>
                </Link>
                <Link to="/metodologia" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Metodologia
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Guides;

