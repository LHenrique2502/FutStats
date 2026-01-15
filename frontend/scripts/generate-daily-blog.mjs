import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BACKEND_API_URL_RAW = process.env.BACKEND_API_URL || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const BLOG_MAX_POSTS = Number(process.env.BLOG_MAX_POSTS || 60);
const POSTS_TIMEZONE = process.env.POSTS_TIMEZONE || 'America/Sao_Paulo';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase(); // debug|info|warn|error

if (!BACKEND_API_URL_RAW) throw new Error('BACKEND_API_URL não definido.');
if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY não definido.');

const BACKEND_API_URL = BACKEND_API_URL_RAW.replace(/\/+$/, '') + '/';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ts() {
  return new Date().toISOString();
}

function log(level, msg, extra) {
  const levels = { debug: 10, info: 20, warn: 30, error: 40 };
  const threshold = levels[LOG_LEVEL] ?? 20;
  const current = levels[level] ?? 20;
  if (current < threshold) return;

  const base = `[${ts()}] [${level.toUpperCase()}] ${msg}`;
  if (extra !== undefined) {
    // eslint-disable-next-line no-console
    console.log(base, extra);
  } else {
    // eslint-disable-next-line no-console
    console.log(base);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function todayIsoInTz(tz) {
  // YYYY-MM-DD no fuso desejado (ex.: America/Sao_Paulo)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

const todayISO = todayIsoInTz(POSTS_TIMEZONE);
const postId = `daily-${todayISO}`;

async function fetchWithTimeout(url, { timeoutMs = 15000, ...opts } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchJsonWithRetry(url, { tries = 4, timeoutMs = 15000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      log(
        'debug',
        `GET ${url} (attempt ${attempt}/${tries}, timeout ${timeoutMs}ms)`
      );
      const res = await fetchWithTimeout(url, { timeoutMs });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} em ${url}: ${txt.slice(0, 200)}`);
      }
      return await res.json();
    } catch (err) {
      lastErr = err;
      log(
        'warn',
        `Falha em GET ${url} (attempt ${attempt}/${tries})`,
        String(err?.message || err)
      );
      const backoff = Math.min(30000, 1000 * 2 ** (attempt - 1));
      log('debug', `Aguardando ${backoff}ms antes do retry`);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

async function pingBackend() {
  // Pinger leve antes do warm-up pesado (ajuda a "acordar" Render free tier)
  const endpoints = [
    `${BACKEND_API_URL}estatisticas/`,
    `${BACKEND_API_URL}matches/today/`,
  ];

  const maxTotalMs = 2 * 60 * 1000; // até 2 minutos
  const start = Date.now();
  let lastErr;

  log('info', `Ping backend (até ${Math.round(maxTotalMs / 1000)}s)`, {
    baseUrl: BACKEND_API_URL,
    endpoints,
  });

  while (Date.now() - start < maxTotalMs) {
    for (const url of endpoints) {
      try {
        await fetchJsonWithRetry(url, { tries: 1, timeoutMs: 8000 });
        log('info', `Ping OK: ${url}`);
        return;
      } catch (e) {
        lastErr = e;
        log('debug', `Ping falhou: ${url}`, String(e?.message || e));
      }
    }
    // backoff curto e progressivo
    const elapsed = Date.now() - start;
    const wait = elapsed < 30000 ? 2000 : elapsed < 60000 ? 4000 : 6000;
    log(
      'debug',
      `Backend ainda indisponível; aguardando ${wait}ms (elapsed ${elapsed}ms)`
    );
    await sleep(wait);
  }

  throw new Error(
    `Pinger falhou (backend ainda dormindo): ${lastErr?.message || lastErr}`
  );
}

async function warmUpBackend() {
  const warmUrl = `${BACKEND_API_URL}matches/today/`;
  const steps = [
    { tries: 1, timeoutMs: 10000 },
    { tries: 1, timeoutMs: 20000 },
    { tries: 1, timeoutMs: 30000 },
  ];
  let lastErr;
  log('info', 'Warm-up backend (Render wake-up)', { warmUrl, steps });
  for (const s of steps) {
    try {
      await fetchJsonWithRetry(warmUrl, s);
      log('info', 'Warm-up OK');
      return;
    } catch (e) {
      lastErr = e;
      log('warn', 'Warm-up step falhou', {
        ...s,
        error: String(e?.message || e),
      });
    }
  }
  throw new Error(
    `Backend não acordou a tempo: ${lastErr?.message || lastErr}`
  );
}

function indexProbabilities(probabilities) {
  const probsByMatch = {};
  for (const item of Array.isArray(probabilities) ? probabilities : []) {
    const id = String(item?.match_id);
    if (!id) continue;
    probsByMatch[id] = {
      over_25: item?.over_25,
      btts_yes: item?.btts_yes,
    };
  }
  return probsByMatch;
}

function pickTopMatches(matches, probsByMatch, limit = 6) {
  const list = (Array.isArray(matches) ? matches : []).map((m) => {
    const p = probsByMatch[String(m?.id)] || {};
    const a = Number(p.over_25);
    const b = Number(p.btts_yes);
    const score = Math.max(
      Number.isFinite(a) ? a : 0,
      Number.isFinite(b) ? b : 0
    );
    return { match: m, probs: p, score };
  });

  list.sort((x, y) => y.score - x.score);
  return list.slice(0, limit);
}

function extractJson(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  // tenta parse direto
  try {
    return JSON.parse(raw);
  } catch {
    // tenta extrair o primeiro objeto JSON do texto
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const sliced = raw.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    return null;
  }
}

function buildPrompt(payload) {
  return `
Você é redator do FutStats. Crie UM post diário em pt-BR.
Regra CRÍTICA: use SOMENTE os números fornecidos no JSON abaixo. Não invente odds, probabilidades, horários ou ligas.
Se algum dado estiver ausente, escreva "não disponível".

REGRAS IMPORTANTES (para evitar erros):
- NÃO escreva "probabilidade de vitória", NÃO use mercado 1X2, NÃO fale em mandante/visitante vencer.
- Use APENAS estes dados/mercados que existem no JSON: Over 2.5 (over_25), BTTS (btts_yes) e as Value Bets (odd + calculated_probability).

Retorne APENAS um JSON válido (sem markdown), no formato:
{
  "id": "${postId}",
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "date": "${todayISO}",
  "category": "Diário"
}

Regras do conteúdo:
- máximo ~900 palavras
- incluir um aviso de risco curto (apostas envolvem risco)
- não use linguagem de certeza (evite "garantido", "certeza", "100%"); se algum número vier muito alto, trate como estimativa e prefira no máximo "≈95%"
- formatação obrigatória do texto:
  - use parágrafos separados por "\\n\\n"
  - use listas com UMA linha por item, começando com "- "
  - não use markdown (sem "**" e sem "*"). Você PODE usar títulos simples começando com "# " (apenas isso).
- tom de voz:
  - comece com uma saudação curta e amigável (ex.: "Bom dia!" ou "Olá!")
  - termine com uma despedida curta e amigável (ex.: "Boa sorte e bons estudos!" ou "Até amanhã!")
- amostra:
  - quando o campo sample.quality for "baixa" ou o sample.min_sample_size for menor que sample.sample_limit, deixe claro que a amostra é pequena e que a confiança é menor.
- NÃO inclua CTAs/links no conteúdo do post. Os CTAs já existem como botões abaixo do texto no site.

Dados do dia (JSON):
${JSON.stringify(payload, null, 2)}
`.trim();
}

async function generateWithGroq(payload) {
  const prompt = buildPrompt(payload);

  const modelName = String(GROQ_MODEL || '').trim();

  log('info', 'Chamando Groq para gerar post', {
    model: modelName,
    postId,
    date: todayISO,
  });

  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      timeoutMs: 60000,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        // baixa temperatura melhora conformidade com JSON
        temperature: 0.2,
        max_tokens: 1400,
        // Força JSON válido quando suportado pelo provedor/modelo
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é um redator técnico. Responda SEMPRE com JSON válido puro (sem markdown e sem texto extra).',
          },
          { role: 'user', content: prompt },
        ],
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Groq falhou: ${res.status} ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  let parsed;
  try {
    parsed = extractJson(text);
  } catch (e) {
    // Log seguro: apenas um trecho para diagnosticar formatação inválida
    log(
      'error',
      'Falha ao parsear JSON do Groq (trecho inicial)',
      String(text || '').slice(0, 800)
    );
    throw e;
  }
  if (!parsed) {
    log(
      'error',
      'Groq retornou vazio/sem JSON (trecho inicial)',
      String(text || '').slice(0, 800)
    );
    throw new Error('Não foi possível parsear JSON retornado pela IA.');
  }
  log('info', 'Groq retornou conteúdo; JSON parseado com sucesso');
  return parsed;
}

function normalizePost(post) {
  const title = String(post?.title || '').trim();
  const excerpt = String(post?.excerpt || '').trim();
  const content = String(post?.content || '').trim();
  if (!title || !content) throw new Error('Post inválido (title/content).');

  return {
    id: postId,
    title,
    excerpt,
    content,
    date: todayISO,
    category: String(post?.category || 'Diário'),
  };
}

function jsString(str) {
  return JSON.stringify(String(str ?? ''));
}

function serializeBlogPosts(posts) {
  const lines = [];
  lines.push('export const blogPosts = [');
  for (const p of posts) {
    lines.push('  {');
    lines.push(`    id: ${jsString(p.id)},`);
    lines.push(`    title: ${jsString(p.title)},`);
    lines.push(`    excerpt: ${jsString(p.excerpt)},`);
    lines.push(`    content: ${jsString(p.content)},`);
    lines.push(`    date: ${jsString(p.date)},`);
    lines.push(`    category: ${jsString(p.category)},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

async function readExistingBlogPosts() {
  const dataPath = path.resolve(__dirname, '../src/data/blogPosts.js');
  const url = `${pathToFileURL(dataPath).href}?t=${Date.now()}`;
  const mod = await import(url);
  const list = Array.isArray(mod.blogPosts) ? mod.blogPosts : [];

  // normaliza campos que o site espera
  return list
    .map((p) => ({
      id: String(p?.id ?? '').trim(),
      title: String(p?.title ?? '').trim(),
      excerpt: String(p?.excerpt ?? '').trim(),
      content: String(p?.content ?? '').trim(),
      date: String(p?.date ?? '').trim(),
      category: String(p?.category ?? '').trim(),
    }))
    .filter((p) => p.id && p.title);
}

async function writeBlogPosts(posts) {
  const dataPath = path.resolve(__dirname, '../src/data/blogPosts.js');
  await fs.writeFile(dataPath, serializeBlogPosts(posts), 'utf8');
}

async function main() {
  log('info', 'Iniciando geração de post diário', {
    postId,
    todayISO,
    timezone: POSTS_TIMEZONE,
    blogMaxPosts: BLOG_MAX_POSTS,
  });

  await pingBackend();
  await warmUpBackend();

  log('info', 'Buscando dados do dia na API', { baseUrl: BACKEND_API_URL });
  const [matches, probabilities, valueBets] = await Promise.all([
    fetchJsonWithRetry(`${BACKEND_API_URL}matches/today/`, {
      tries: 4,
      timeoutMs: 20000,
    }),
    fetchJsonWithRetry(`${BACKEND_API_URL}probabilities/today/`, {
      tries: 4,
      timeoutMs: 20000,
    }),
    fetchJsonWithRetry(`${BACKEND_API_URL}value-bets/?limit=8`, {
      tries: 4,
      timeoutMs: 20000,
    }),
  ]);

  const probsByMatch = indexProbabilities(probabilities);
  const topMatches = pickTopMatches(matches, probsByMatch, 6);
  log('info', 'Dados carregados', {
    matches: Array.isArray(matches) ? matches.length : 0,
    probabilities: Array.isArray(probabilities) ? probabilities.length : 0,
    valueBets: Array.isArray(valueBets) ? valueBets.length : 0,
    topMatches: topMatches.length,
  });

  // Enriquecer topMatches com amostra (últimos 5 jogos) para evitar conclusões em amostra pequena
  const enrichedTopMatches = [];
  for (const x of topMatches) {
    const matchId = x?.match?.id;
    if (!matchId) continue;
    try {
      const summary = await fetchJsonWithRetry(
        `${BACKEND_API_URL}matches/${matchId}/?sample_limit=5`,
        { tries: 3, timeoutMs: 20000 }
      );

      const homeSize = Number(summary?.team_rates?.home?.sample_size);
      const awaySize = Number(summary?.team_rates?.away?.sample_size);
      const minSample = Math.min(
        Number.isFinite(homeSize) ? homeSize : 0,
        Number.isFinite(awaySize) ? awaySize : 0
      );
      const sampleLimit = Number(summary?.team_rates?.sample_limit) || 5;

      enrichedTopMatches.push({
        id: summary?.id ?? matchId,
        league: summary?.league ?? x.match?.league,
        date: summary?.date ?? x.match?.date,
        time: summary?.time ?? x.match?.time,
        home: summary?.homeTeam?.name ?? x.match?.homeTeam?.name,
        away: summary?.awayTeam?.name ?? x.match?.awayTeam?.name,
        probs: summary?.probabilities ?? x.probs,
        sample: {
          sample_limit: sampleLimit,
          home_sample_size: Number.isFinite(homeSize) ? homeSize : null,
          away_sample_size: Number.isFinite(awaySize) ? awaySize : null,
          min_sample_size: minSample,
          quality: summary?.team_rates?.quality ?? null,
        },
      });
    } catch (e) {
      // Se falhar, ainda envia o básico sem amostra (mas o prompt deve ser conservador)
      enrichedTopMatches.push({
        id: matchId,
        league: x.match?.league,
        date: x.match?.date,
        time: x.match?.time,
        home: x.match?.homeTeam?.name,
        away: x.match?.awayTeam?.name,
        probs: x.probs,
        sample: { sample_limit: 5, quality: 'indisponível' },
      });
    }
  }

  const payload = {
    date: todayISO,
    topMatches: enrichedTopMatches,
    valueBets: (Array.isArray(valueBets) ? valueBets : []).map((v) => ({
      match_id: v?.match_id,
      match: v?.match,
      league: v?.league,
      date: v?.date,
      bet_name: v?.bet_name,
      bet_type: v?.bet_type,
      odd: v?.odd,
      calculated_probability: v?.calculated_probability,
      implied_probability: v?.implied_probability,
      difference: v?.difference,
      best_bookmaker: v?.best_bookmaker,
      is_brazilian_bookmaker: v?.is_brazilian_bookmaker,
    })),
    notes: {
      source: 'FutStats API',
      api_base: BACKEND_API_URL,
      timezone: POSTS_TIMEZONE,
    },
  };

  const aiPostRaw = await generateWithGroq(payload);
  const aiPost = normalizePost(aiPostRaw);

  const existing = await readExistingBlogPosts();
  if (existing.some((p) => p.id === postId)) {
    log('info', 'Post do dia já existe; nada a fazer.');
    return;
  }

  const merged = [aiPost, ...existing.filter((p) => p.id !== postId)].slice(
    0,
    Number.isFinite(BLOG_MAX_POSTS) ? Math.max(10, BLOG_MAX_POSTS) : 60
  );

  await writeBlogPosts(merged);
  log('info', `Post diário gerado: ${postId}`, {
    totalPostsAfterWrite: merged.length,
    blogFile: 'frontend/src/data/blogPosts.js',
  });
}

main().catch((err) => {
  // Modo B: falha o workflow e NÃO commita
  log(
    'error',
    'Falha ao gerar post diário',
    String(err?.stack || err?.message || err)
  );
  process.exit(1);
});
