import { Lightbulb, ShieldAlert } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { SEO } from '@/components/SEO';

const Metodologia = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Metodologia"
        description="Entenda como o FutStats estima probabilidades, o que é probabilidade implícita e como interpretar os mercados analisados."
        pathname="/metodologia"
      />
      <div className="container mx-auto px-4 py-8 space-y-10">
        <SectionTitle
          title="Metodologia"
          subtitle="Como o FutStats estima probabilidades e o que considerar antes de usar as análises."
          icon={Lightbulb}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              O que são as probabilidades do FutStats?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As probabilidades exibidas no site são <strong className="text-foreground">estimativas estatísticas</strong>{' '}
              baseadas no histórico recente dos times. Elas não representam uma “certeza” e
              podem variar conforme a amostra disponível e o contexto do jogo.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              Janela de jogos (amostra)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para cada equipe, consideramos os <strong className="text-foreground">últimos jogos finalizados</strong>{' '}
              disponíveis (por padrão, uma janela curta). Quando uma equipe tem poucos jogos
              com placar no histórico recente, a confiabilidade tende a ser menor — por isso
              exibimos um selo de qualidade da amostra.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              Mercados analisados hoje
            </h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Mais de 2.5 gols (Over 2.5)</strong>
              </li>
              <li>
                <strong className="text-foreground">Ambos marcam (BTTS)</strong>
              </li>
              <li>
                <strong className="text-foreground">Resultado 1X2</strong> (casa/empate/fora)
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Como calculamos (visão prática)
          </h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Over 2.5 e BTTS
              </h3>
              <p className="mt-1">
                Calculamos uma taxa para o mandante e outra para o visitante (com base nos
                últimos jogos) e usamos a <strong className="text-foreground">média</strong>{' '}
                como probabilidade estimada do jogo.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">1X2</h3>
              <p className="mt-1">
                Usamos um modelo simples que considera vantagem de jogar em casa e a
                diferença de desempenho (ex.: médias de gols), aplicando limites para evitar
                extremos.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">
                Probabilidade implícita e “valor”
              </h3>
              <p className="mt-1">
                Quando temos odds disponíveis, calculamos a <strong className="text-foreground">probabilidade implícita</strong>{' '}
                aproximada (100 / odd). Se a probabilidade estimada pelo FutStats for maior
                do que a implícita, isso pode indicar uma oportunidade de “valor” — mas não
                é garantia de resultado.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Aviso importante
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                O FutStats é uma ferramenta informativa. Apostas envolvem risco e perdas
                são possíveis. Use as análises como suporte, considere contexto (elencos,
                lesões, calendário, motivação) e faça gestão de banca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metodologia;

