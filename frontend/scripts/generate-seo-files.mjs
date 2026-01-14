import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://example.com';

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

  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/matches', changefreq: 'daily', priority: 0.8 },
    { path: '/value-bets', changefreq: 'daily', priority: 0.9 },
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

