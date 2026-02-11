const API_URL_BACK = import.meta.env.VITE_API_URL_BACK || '';
const PUBLIC_DATA_BASE = import.meta.env.VITE_PUBLIC_DATA_BASE || '/data';
const DISABLE_BACKEND = String(import.meta.env.VITE_DISABLE_BACKEND || '') === '1';

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

async function fetchJson(url, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Busca primeiro no snapshot público (frontend/public/data),
 * e só cai pro backend se o arquivo não existir.
 */
async function getJsonStaticFirst({ staticPath, apiPath, timeoutMs }) {
  const staticUrl = joinUrl(PUBLIC_DATA_BASE, staticPath);
  try {
    return await fetchJson(staticUrl, { timeoutMs });
  } catch (e) {
    // Se o snapshot não existir, tenta backend (p/ dev/retrocompat)
    if (!DISABLE_BACKEND && API_URL_BACK && apiPath) {
      const apiUrl = joinUrl(API_URL_BACK, apiPath);
      return await fetchJson(apiUrl, { timeoutMs: Math.max(timeoutMs || 5000, 8000) });
    }
    throw e;
  }
}

export function getMatchesToday() {
  return getJsonStaticFirst({
    staticPath: 'matches/today.json',
    apiPath: 'matches/today/',
    timeoutMs: 4000,
  });
}

export function getProbabilitiesToday() {
  return getJsonStaticFirst({
    staticPath: 'probabilities/today.json',
    apiPath: 'probabilities/today/',
    timeoutMs: 4000,
  });
}

export function getValueBetsWindow(daysAhead = 3) {
  const d = Number(daysAhead) || 3;
  return getJsonStaticFirst({
    staticPath: `value_bets/window_${d}d.json`,
    apiPath: `value-bets/?limit=500&days_ahead=${d}`,
    timeoutMs: 5000,
  });
}

export function getOddsWindow(daysAhead = 3) {
  const d = Number(daysAhead) || 3;
  return getJsonStaticFirst({
    staticPath: `odds/window_${d}d.json`,
    apiPath: `odds/today/?days_ahead=${d}`,
    timeoutMs: 5000,
  });
}

export function getTeamHighlights() {
  return getJsonStaticFirst({
    staticPath: 'teams/highlights.json',
    apiPath: 'times_destaque/',
    timeoutMs: 5000,
  });
}

export function getMatchSummary(matchId) {
  const id = String(matchId || '').trim();
  return getJsonStaticFirst({
    staticPath: `match/${id}/summary.json`,
    apiPath: `matches/${id}/`,
    timeoutMs: 5000,
  });
}

export function getMatchOdds(matchId) {
  const id = String(matchId || '').trim();
  return getJsonStaticFirst({
    staticPath: `match/${id}/odds.json`,
    apiPath: `matches/${id}/odds/`,
    timeoutMs: 5000,
  });
}

