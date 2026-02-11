import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function tryLoadEnvFromDotenvFiles() {
  // Este script roda via `node` (fora do Vite), então `.env` não é carregado automaticamente.
  // Tentamos ler alguns arquivos comuns para preencher SITE_URL/VITE_SITE_URL em builds locais.
  const candidates = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env.production'),
    path.resolve(__dirname, '../.env.production.local'),
  ];

  const parse = (raw) => {
    const lines = String(raw || '').split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const idx = s.indexOf('=');
      if (idx <= 0) continue;
      const key = s.slice(0, idx).trim();
      let val = s.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  };

  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      const env = parse(raw);
      if (!process.env.SITE_URL && env.SITE_URL) process.env.SITE_URL = env.SITE_URL;
      if (!process.env.VITE_SITE_URL && env.VITE_SITE_URL)
        process.env.VITE_SITE_URL = env.VITE_SITE_URL;
      if (!process.env.VITE_OG_IMAGE_URL && env.VITE_OG_IMAGE_URL)
        process.env.VITE_OG_IMAGE_URL = env.VITE_OG_IMAGE_URL;
      if (process.env.SITE_URL || process.env.VITE_SITE_URL) return;
    } catch {
      // ignora (arquivo pode não existir)
    }
  }
}

await tryLoadEnvFromDotenvFiles();

const SITE_URL =
  process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://example.com';

const nowIso = new Date().toISOString();

async function loadBlogPosts() {
  try {
    const modPath = path.resolve(__dirname, '../src/data/blogPosts.js');
    const mod = await import(pathToFileURL(modPath).href);
    return Array.isArray(mod.blogPosts) ? mod.blogPosts : [];
  } catch {
    return [];
  }
}

async function loadLeagueSeo() {
  try {
    const modPath = path.resolve(__dirname, '../src/data/leagueSeo.js');
    const mod = await import(pathToFileURL(modPath).href);
    return Array.isArray(mod.leagueSeo) ? mod.leagueSeo : [];
  } catch {
    return [];
  }
}

function abs(urlPath) {
  const origin = SITE_URL.replace(/\/+$/, '');
  const p = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${origin}${p}`;
}

function buildSitemapXml(urls) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const u of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${u.loc}</loc>`);
    if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (typeof u.priority === 'number')
      lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${abs('/sitemap.xml')}`,
    '',
  ].join('\n');
}

async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  await fs.mkdir(publicDir, { recursive: true });

  const blogPosts = await loadBlogPosts();
  const leagueSeo = await loadLeagueSeo();

  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/matches', changefreq: 'daily', priority: 0.8 },
    { path: '/value-bets', changefreq: 'daily', priority: 0.9 },
    { path: '/value-bets-hoje', changefreq: 'daily', priority: 0.9 },
    { path: '/over-25-odds-hoje', changefreq: 'daily', priority: 0.8 },
    { path: '/btts-odds-hoje', changefreq: 'daily', priority: 0.8 },
    { path: '/1x2-odds-hoje', changefreq: 'daily', priority: 0.7 },
    ...leagueSeo.flatMap((l) => {
      const slug = l?.slug;
      if (!slug) return [];
      const base = [
        { path: `/odds/${slug}/over-25/hoje`, changefreq: 'daily', priority: 0.8 },
        { path: `/odds/${slug}/btts/hoje`, changefreq: 'daily', priority: 0.8 },
        { path: `/odds/${slug}/1x2/hoje`, changefreq: 'daily', priority: 0.7 },
      ];
      // Também gera alguns dias futuros para rotas dinâmicas por data (sem explodir URLs).
      const daysForward = 7;
      const markets = ['over-25', 'btts', '1x2'];
      const today = new Date();
      const dated = [];
      for (let i = 0; i <= daysForward; i += 1) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        for (const m of markets) {
          dated.push({
            path: `/odds/${slug}/${m}/${iso}`,
            changefreq: 'daily',
            priority: 0.6,
          });
        }
      }
      return [...base, ...dated];
    }),
    { path: '/ferramentas', changefreq: 'monthly', priority: 0.6 },
    {
      path: '/ferramentas/probabilidade-implicita',
      changefreq: 'monthly',
      priority: 0.6,
    },
    { path: '/ferramentas/value-checker', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias/over-25', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias/btts', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias/probabilidade-implicita', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias/value-bet', changefreq: 'monthly', priority: 0.6 },
    { path: '/guias/como-usar-futstats', changefreq: 'monthly', priority: 0.6 },
    { path: '/blog', changefreq: 'weekly', priority: 0.7 },
    { path: '/metodologia', changefreq: 'monthly', priority: 0.6 },
    { path: '/teams', changefreq: 'weekly', priority: 0.5 },
    { path: '/leagues', changefreq: 'weekly', priority: 0.4 },
  ];

  const urls = [
    ...staticRoutes.map((r) => ({
      loc: abs(r.path),
      lastmod: nowIso,
      changefreq: r.changefreq,
      priority: r.priority,
    })),
    ...blogPosts
      .filter((p) => p && (p.id || p.id === 0))
      .map((p) => ({
        loc: abs(`/blog/${p.id}`),
        lastmod: p.date ? new Date(p.date).toISOString() : nowIso,
        changefreq: 'monthly',
        priority: 0.5,
      })),
  ];

  const sitemapXml = buildSitemapXml(urls);
  const robotsTxt = buildRobotsTxt();

  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

  if (SITE_URL === 'https://example.com') {
    // eslint-disable-next-line no-console
    console.warn(
      '[seo] SITE_URL não definido; usando https://example.com (defina SITE_URL no ambiente de build)'
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(`[seo] sitemap.xml e robots.txt gerados para ${SITE_URL}`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seo] Falha ao gerar arquivos SEO:', err);
  process.exit(1);
});

