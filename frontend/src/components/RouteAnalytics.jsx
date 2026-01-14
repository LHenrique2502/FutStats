import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, trackPageView } from '@/lib/analytics';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

function getScrollPercent() {
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = doc.scrollTop || body.scrollTop || 0;
  const scrollHeight = (doc.scrollHeight || body.scrollHeight || 0) - doc.clientHeight;
  if (scrollHeight <= 0) return 100;
  return Math.round((scrollTop / scrollHeight) * 100);
}

export function RouteAnalytics() {
  const location = useLocation();
  const pathnameWithSearch = useMemo(() => {
    const search = location.search || '';
    return `${location.pathname}${search}`;
  }, [location.pathname, location.search]);

  const sentScrollDepthRef = useRef(new Set());

  // Page view per route change
  useEffect(() => {
    trackPageView(pathnameWithSearch, document.title);
    sentScrollDepthRef.current = new Set();
  }, [pathnameWithSearch]);

  // Scroll depth per page (25/50/75/100)
  useEffect(() => {
    const onScroll = () => {
      const pct = getScrollPercent();
      for (const threshold of SCROLL_THRESHOLDS) {
        if (pct >= threshold && !sentScrollDepthRef.current.has(threshold)) {
          sentScrollDepthRef.current.add(threshold);
          trackEvent('scroll_depth', {
            percent: threshold,
            page_path: pathnameWithSearch,
          });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // in case user loads mid-page
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathnameWithSearch]);

  // Helpful baseline event
  useEffect(() => {
    trackEvent('session_start_app', { page_path: pathnameWithSearch });
    // only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

