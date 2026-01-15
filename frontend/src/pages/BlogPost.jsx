import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { SEO } from '@/components/SEO';
import { trackEvent } from '@/lib/analytics';

const parseLocalDate = (isoDate) => {
  if (typeof isoDate !== 'string') return null;
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const formatDatePtBr = (isoDate) => {
  const d = parseLocalDate(isoDate) || new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
};

const normalizeContent = (content) => {
  if (typeof content !== 'string') return '';
  let s = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove bold markdown **...** (mantém o texto) para não "poluir" a leitura
  s = s.replace(/\*\*(.+?)\*\*/g, '$1');

  // Heurística: quando a IA devolve "* item * item * item" na mesma linha, quebrar em linhas
  const inlineBullets = (s.match(/\s\*\s+/g) || []).length;
  if (inlineBullets >= 2) {
    // transforma " * " em nova linha "* "
    s = s.replace(/\s\*\s+/g, '\n* ');
  }

  // Normaliza listas para "- "
  s = s.replace(/^\*\s+/gm, '- ');

  // Normaliza múltiplas quebras
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
};

const contentToBlocks = (content) => {
  const text = normalizeContent(content);
  if (!text) return [];

  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  const pushParagraph = (paraLines) => {
    const t = paraLines.join(' ').replace(/\s+/g, ' ').trim();
    if (t) blocks.push({ type: 'p', text: t });
  };

  while (i < lines.length) {
    const lineRaw = lines[i];
    const line = String(lineRaw || '').trim();

    // pula linhas vazias
    if (!line) {
      i += 1;
      continue;
    }

    // heading (ex.: "Top Matches")
    if (/^#{1,6}\s+/.test(line)) {
      blocks.push({ type: 'h', text: line.replace(/^#{1,6}\s+/, '').trim() });
      i += 1;
      continue;
    }

    // lista
    if (/^-\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const l = String(lines[i] || '').trim();
        if (!l) break;
        if (/^-\s+/.test(l)) items.push(l.replace(/^-\s+/, '').trim());
        else break;
        i += 1;
      }
      if (items.length) blocks.push({ type: 'ul', items });
      continue;
    }

    // parágrafo: agrega até próxima linha vazia/heading/lista
    const paraLines = [];
    while (i < lines.length) {
      const l = String(lines[i] || '').trim();
      if (!l) break;
      if (/^#{1,6}\s+/.test(l) || /^-\s+/.test(l)) break;
      paraLines.push(l);
      i += 1;
    }
    pushParagraph(paraLines);
  }

  return blocks;
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

  const blocks = contentToBlocks(post.content);

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
            {blocks.length > 0 ? (
              <div className="space-y-4">
                {blocks.map((b, idx) => {
                  if (b.type === 'h') {
                    return (
                      <h3
                        key={`${post.id}-h-${idx}`}
                        className="text-base md:text-lg font-semibold text-foreground"
                      >
                        {b.text}
                      </h3>
                    );
                  }
                  if (b.type === 'ul') {
                    return (
                      <ul
                        key={`${post.id}-ul-${idx}`}
                        className="list-disc pl-5 space-y-2 text-sm md:text-base text-foreground/90"
                      >
                        {b.items.map((it, j) => (
                          <li key={`${post.id}-ul-${idx}-li-${j}`}>{it}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p
                      key={`${post.id}-p-${idx}`}
                      className="text-sm md:text-base text-foreground/90 leading-relaxed"
                    >
                      {b.text}
                    </p>
                  );
                })}
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

