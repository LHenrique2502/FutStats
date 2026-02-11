const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const INTERNAL_TRAFFIC_TOKEN = import.meta.env.VITE_INTERNAL_TRAFFIC_TOKEN;

const INTERNAL_TRAFFIC_STORAGE_KEY = 'internal_traffic';
const INTERNAL_TRAFFIC_QUERY_PARAM = 'internal';

let isInitialized = false;

function safeGetUrlParam(name) {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveLocalStorage(key) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function safeGetLocalStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveQueryParam(name) {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(name)) return;
    url.searchParams.delete(name);
    window.history.replaceState({}, document?.title || '', url.toString());
  } catch {
    // ignore
  }
}

function isTruthyOffValue(value) {
  if (!value) return false;
  return ['0', 'false', 'off', 'no', 'disable', 'disabled'].includes(
    String(value).trim().toLowerCase()
  );
}

function maybeToggleInternalTrafficFromUrl() {
  const internalParam = safeGetUrlParam(INTERNAL_TRAFFIC_QUERY_PARAM);
  if (!internalParam) return;

  // Allow turning it off without needing the token.
  if (isTruthyOffValue(internalParam)) {
    safeRemoveLocalStorage(INTERNAL_TRAFFIC_STORAGE_KEY);
    safeRemoveQueryParam(INTERNAL_TRAFFIC_QUERY_PARAM);
    return;
  }

  // Only enable when token matches. Token should be provided via env to avoid
  // hardcoding it in the repository.
  if (INTERNAL_TRAFFIC_TOKEN && internalParam === INTERNAL_TRAFFIC_TOKEN) {
    safeSetLocalStorage(INTERNAL_TRAFFIC_STORAGE_KEY, '1');
    safeRemoveQueryParam(INTERNAL_TRAFFIC_QUERY_PARAM);
  }
}

function getTrafficTypeParam() {
  const enabled = safeGetLocalStorage(INTERNAL_TRAFFIC_STORAGE_KEY) === '1';
  return enabled ? 'internal' : undefined;
}

function withTrafficType(params = {}) {
  const trafficType = getTrafficTypeParam();
  return trafficType ? { ...params, traffic_type: trafficType } : params;
}

function ensureDataLayer() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
}

function loadGtagScript(measurementId) {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector(
    `script[src^="https://www.googletagmanager.com/gtag/js?id="]`
  );
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId
  )}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (!GA_ID) return;
  if (isInitialized) return;

  // If user accesses the site with ?internal=TOKEN, enable internal traffic mode.
  // To disable: ?internal=off
  maybeToggleInternalTrafficFromUrl();

  ensureDataLayer();
  loadGtagScript(GA_ID);

  // Base config (page_view manual via SPA router)
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
    ...withTrafficType(),
  });

  isInitialized = true;
}

export function trackEvent(name, params = {}) {
  if (!GA_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  // GA4 recommends snake_case event names
  window.gtag('event', name, {
    ...withTrafficType(params),
  });
}

export function trackPageView(path, title) {
  if (!GA_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    ...withTrafficType({
      page_path: path,
      page_title: title || document?.title,
    }),
  });
}

