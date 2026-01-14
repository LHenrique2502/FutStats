import { useEffect, useState } from 'react';
import {
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { SectionTitle } from '@/components/SectionTitle';
import { InsightsBox } from '@/components/InsightsBox';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

const API_URL_BACK = import.meta.env.VITE_API_URL_BACK;

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [topProbabilities, setTopProbabilities] = useState([]);
  const [highlightTeams, setHighlightTeams] = useState([]);
  const viewAllButtonClass =
    'text-muted-foreground hover:text-primary hover:bg-transparent p-0 h-auto font-normal';

  useEffect(() => {
    fetch(`${API_URL_BACK}matches/today/`)
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Erro ao carregar jogos:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL_BACK}value-bets/?limit=3`)
      .then((res) => res.json())
      .then((data) => {
        // Formatar dados para o formato esperado pelo InsightsBox
        const formatted = data.map((item, index) => ({
          id: item.match_id || index,
          title: item.match,
          description: `${item.bet_name} - ${item.league}`,
          percentage: item.calculated_probability,
          trend: item.calculated_probability >= 60 ? "up" : "down",
          date: item.date,
        }));
        setTopProbabilities(formatted);
      })
      .catch((err) => console.error('Erro ao carregar probabilidades:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL_BACK}times_destaque/`)
      .then((res) => res.json())
      .then((data) => setHighlightTeams(data))
      .catch((err) => console.error('Erro ao carregar times destaque:', err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section com Busca */}
        <div className="text-center space-y-6 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Análise Inteligente de{' '}
              <span className="text-primary">Apostas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estatísticas em tempo real, insights automáticos e probabilidades
              calculadas
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Próximas Partidas */}
        <section className="space-y-6">
          <SectionTitle
            title="Próximas Partidas"
            subtitle="Jogos com análises disponíveis"
            icon={Calendar}
          />
          {matches.length > 0 ? (
            <div className="relative px-12">
              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {matches.map((match) => (
                    <CarouselItem key={match.id} className="pl-2 md:pl-4 md:basis-1/3">
                      <Link
                        to={`/match/${match.id}`}
                        className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:glow-subtle transition-all group block h-full"
                      >
                        <div className="space-y-4">
                          {/* Cabeçalho da partida */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                              {match.league}
                            </span>
                            <span className="text-xs text-primary font-medium">
                              {match.date}
                            </span>
                          </div>

                          {/* Times */}
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <img
                                src={match.homeTeam.logo}
                                className="w-10 h-10 mx-auto"
                                alt={match.homeTeam.name}
                              />
                              <p className="text-sm font-semibold text-foreground mt-2">
                                {match.homeTeam.name}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">VS</p>
                            </div>
                            <div className="text-center">
                              <img
                                src={match.awayTeam.logo}
                                className="w-10 h-10 mx-auto"
                                alt={match.awayTeam.name}
                              />
                              <p className="text-sm font-semibold text-foreground mt-2">
                                {match.awayTeam.name}
                              </p>
                            </div>
                          </div>

                          {/* Quick insights */}
                          <div className="pt-3 border-t border-border space-y-2">
                            {match.insights?.slice(0, 2).map((insight) => (
                              <div
                                key={insight.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {insight.title}
                                </span>
                                <span className="text-primary font-bold">
                                  {insight.probability}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {matches.length > 3 && (
                  <>
                    <CarouselPrevious className="-left-12" />
                    <CarouselNext className="-right-12" />
                  </>
                )}
              </Carousel>
              <div className="flex justify-end mt-6">
                <Link to="/matches">
                  <Button 
                    variant="ghost" 
                    className={viewAllButtonClass}
                  >
                    Ver tudo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma partida disponível hoje
            </div>
          )}
        </section>

        {/* Maiores Probabilidades do Dia */}
        <section className="space-y-6">
          <SectionTitle
            title="Maiores Probabilidades do Dia"
            subtitle="Top 3 apostas com maior probabilidade calculada"
            icon={Lightbulb}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProbabilities.map((insight) => (
              <Link
                key={insight.id}
                to={`/match/${insight.id}`}
                className="block"
              >
                <InsightsBox
                  title={insight.title}
                  description={insight.description}
                  probability={insight.percentage}
                  trend={insight.trend}
                />
              </Link>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Link to="/value-bets">
              <Button variant="ghost" className={viewAllButtonClass}>
                Ver tudo
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick Stats Overview */}
        <section className="space-y-6">
          <SectionTitle
            title="Times em Destaque"
            subtitle="Principais estatísticas"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlightTeams.map((team) => (
              <Link
                key={team.id}
                to={`/team/${team.id}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:glow-subtle transition-all"
              >
                <div className="text-center space-y-3">
                  {/* Logo do time */}
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-14 h-14 object-contain mx-auto"
                  />

                  {/* Nome + Liga */}
                  <div>
                    <p className="font-semibold text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.league}
                    </p>
                  </div>

                  {/* Estatísticas */}
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-muted-foreground text-xs">
                      {team.stat_label}
                    </p>
                    <p className="font-bold text-foreground text-lg">
                      {team.stat_type === 'ambas_marcam' 
                        ? `${team.stat_value}%` 
                        : team.stat_value}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Texto informativo (final da página) */}
        <section className="space-y-6">
          <SectionTitle
            title="Sobre o FutStats"
            subtitle="Entenda o que você encontra aqui, como as probabilidades são estimadas e quais mercados analisamos."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Do que se trata o site
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O FutStats é uma plataforma de análise de futebol focada em transformar
                estatísticas em <strong className="text-foreground">probabilidades</strong> e{' '}
                <strong className="text-foreground">insights</strong> para apoiar decisões em
                apostas esportivas. Aqui você encontra jogos do dia, comparações e destaques
                automáticos para priorizar as partidas com melhor contexto estatístico.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Como calculamos as probabilidades
              </h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  As probabilidades exibidas são estimativas baseadas no desempenho recente
                  dos times (ex.: frequência de jogos com muitos gols e de “ambos marcam”).
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Over 2.5</strong> e{' '}
                    <strong className="text-foreground">BTTS (Sim)</strong>: calculamos uma
                    taxa para o mandante e outra para o visitante e usamos a média como
                    probabilidade estimada do jogo.
                  </li>
                  <li>
                    <strong className="text-foreground">1X2</strong>: usamos um modelo
                    simples que considera vantagem de jogar em casa e a diferença de médias
                    de gols, com limites para evitar extremos.
                  </li>
                  <li>
                    <strong className="text-foreground">Comparação com odds</strong>:
                    quando há odds disponíveis, também calculamos a{' '}
                    <strong className="text-foreground">probabilidade implícita</strong>{' '}
                    (aprox. 100 / odd) para identificar “valor” quando a nossa
                    estimativa supera a do mercado.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Mercados disponíveis no site
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No momento, as análises e insights contemplam principalmente:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Mais de 2.5 gols (Over 2.5)</strong>
                </li>
                <li>
                  <strong className="text-foreground">
                    Ambos marcam (BTTS) — Sim
                  </strong>
                </li>
                <li>
                  <strong className="text-foreground">Resultado 1X2</strong>: Vitória do
                  mandante, Empate, Vitória do visitante
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
