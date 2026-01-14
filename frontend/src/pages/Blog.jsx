import { useMemo, useState } from 'react';
import { ArrowDownUp, Newspaper } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { Link } from 'react-router-dom';

const formatDatePtBr = (isoDate) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
};

const Blog = () => {
  const [sortOrder, setSortOrder] = useState('desc'); // desc: mais novo -> mais antigo

  const sortedPosts = useMemo(() => {
    const copy = [...(Array.isArray(blogPosts) ? blogPosts : [])];
    copy.sort((a, b) => {
      const da = new Date(a?.date).getTime();
      const db = new Date(b?.date).getTime();

      const aInvalid = !Number.isFinite(da);
      const bInvalid = !Number.isFinite(db);
      if (aInvalid && bInvalid) return 0;
      if (aInvalid) return 1;
      if (bInvalid) return -1;

      return sortOrder === 'asc' ? da - db : db - da;
    });
    return copy;
  }, [sortOrder]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <SectionTitle
            title="Blog"
            subtitle="Notícias, atualizações e conteúdos do FutStats"
            icon={Newspaper}
          />

          <div className="pt-1">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
              title="Ordenar por data"
            >
              <ArrowDownUp className="w-4 h-4" />
              {sortOrder === 'desc'
                ? 'Mais novo → mais antigo'
                : 'Mais antigo → mais novo'}
            </Button>
          </div>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma publicação ainda.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {sortedPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="block">
                <article className="bg-card border border-border rounded-lg p-5 hover:border-primary hover:glow-subtle transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.category && (
                          <Badge variant="secondary">{post.category}</Badge>
                        )}
                        {post.date && (
                          <span className="text-xs text-muted-foreground">
                            {formatDatePtBr(post.date)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-lg font-semibold text-foreground leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="mt-3 text-sm text-primary font-medium">
                        Ler →
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

