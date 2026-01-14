import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL;
const OG_IMAGE_URL =
  import.meta.env.VITE_OG_IMAGE_URL ||
  'https://lovable.dev/opengraph-image-p98pqg.png';
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION;

function absoluteUrl(pathname = '/') {
  const origin =
    SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) return pathname;
  return `${origin.replace(/\/+$/, '')}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

export function SEO({
  title,
  description,
  pathname = '/',
  imageUrl,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | FutStats` : 'FutStats';
  const canonical = absoluteUrl(pathname);
  const ogImage = imageUrl || OG_IMAGE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Google Search Console */}
      {GSC_VERIFICATION && (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      )}
    </Helmet>
  );
}

