import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { SEO } from '@/components/SEO';
import { trackEvent } from '@/lib/analytics';

const formatDatePtBr = (isoDate) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
};

const contentToParagraphs = (content) => {
  if (typeof content !== 'string') return [];
  return content
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
};

const BlogPost = () => {
  const { id } = useParams();

  const post = useMemo(() => {
    const list = Array.isArray(blogPosts) ? blogPosts : [];
    return list.find((p) => String(p?.id) === String(id)) || null;
  }, [id, blogPosts]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Post não encontrado"
          description="Esse conteúdo não existe (ou foi removido)."
          pathname={`/blog/${id || ''}`}
          noIndex
        />
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6">
              <h1 className="text-xl font-semibold text-foreground">
                Post não encontrado
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Esse conteúdo não existe (ou foi removido).
              </p>
              <div className="mt-4">
                <Link to="/blog">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = contentToParagraphs(post.content);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.excerpt || 'Conteúdo do FutStats'}
        pathname={`/blog/${post.id}`}
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>

          <SectionTitle title={post.title} subtitle={post.excerpt} icon={Newspaper} />

          <div className="flex items-center gap-2 flex-wrap">
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
            {post.date && (
              <span className="text-xs text-muted-foreground">
                {formatDatePtBr(post.date)}
              </span>
            )}
          </div>

          <article className="bg-card border border-border rounded-lg p-6">
            {paragraphs.length > 0 ? (
              <div className="space-y-4">
                {paragraphs.map((p, idx) => (
                  <p
                    key={`${post.id}-p-${idx}`}
                    className="text-sm md:text-base text-foreground/90 leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este post ainda não tem conteúdo.
              </p>
            )}
          </article>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-base font-semibold text-foreground">
              Quer ver isso na prática?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use as páginas do FutStats para aplicar o conteúdo do post em jogos reais.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link to="/value-bets">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    trackEvent('cta_click_valuebets', { source: 'blog_post' })
                  }
                >
                  Ver Probabilidades do Dia
                </Button>
              </Link>
              <Link to="/matches">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    trackEvent('cta_click_partidas', { source: 'blog_post' })
                  }
                >
                  Ver Partidas
                </Button>
              </Link>
              <Link to="/metodologia">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    trackEvent('cta_click_metodologia', { source: 'blog_post' })
                  }
                >
                  Ler Metodologia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

