const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

let isInitialized = false;

function ensureDataLayer() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
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

  ensureDataLayer();
  loadGtagScript(GA_ID);

  // Base config (page_view manual via SPA router)
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  isInitialized = true;
}

export function trackEvent(name, params = {}) {
  if (!GA_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  // GA4 recommends snake_case event names
  window.gtag('event', name, {
    ...params,
  });
}

export function trackPageView(path, title) {
  if (!GA_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document?.title,
  });
}

