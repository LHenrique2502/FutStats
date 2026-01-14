import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { getFavorites, removeFavorite } from '@/lib/favorites';
import { trackEvent } from '@/lib/analytics';

const Favoritos = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  const sorted = useMemo(() => {
    const copy = [...items];
    // tenta ordenar por data (quando existir), mantendo estável caso falhe
    copy.sort((a, b) => String(b?.savedAt || '').localeCompare(String(a?.savedAt || '')));
    return copy;
  }, [items]);

  const onRemove = (id) => {
    removeFavorite(id);
    setItems(getFavorites());
    trackEvent('favorite_removed', { match_id: String(id) });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Favoritos"
        description="Partidas favoritas salvas no seu navegador."
        pathname="/favoritos"
        noIndex
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SectionTitle
          title="Favoritos"
          subtitle="Salvos neste navegador (localStorage)"
          icon={Bookmark}
        />

        {sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não salvou nenhuma partida.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/value-bets">
                <Button
                  onClick={() =>
                    trackEvent('cta_click_valuebets', { source: 'favoritos_empty' })
                  }
                >
                  Ver Probabilidades do Dia
                </Button>
              </Link>
              <Link to="/matches">
                <Button
                  variant="outline"
                  onClick={() =>
                    trackEvent('cta_click_partidas', { source: 'favoritos_empty' })
                  }
                >
                  Ver Partidas
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((f) => (
              <div
                key={String(f?.id)}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {f?.title || `${f?.homeName || ''} x ${f?.awayName || ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f?.league ? `${f.league} • ` : ''}
                      {f?.date || '--'}
                      {f?.time ? ` • ${f.time}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Remover"
                    onClick={() => onRemove(f?.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-4">
                  <Link to={`/match/${f?.id}`}>
                    <Button
                      className="w-full"
                      onClick={() =>
                        trackEvent('favorite_opened', { match_id: String(f?.id) })
                      }
                    >
                      Abrir partida
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;

