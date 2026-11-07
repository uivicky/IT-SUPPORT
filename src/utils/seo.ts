import { useEffect } from 'react';

export interface PageSEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown>;
}

function setMetaContent(selector: string, content: string): void {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export function usePageSEO({ title, description, canonicalPath, jsonLd }: PageSEOConfig): void {
  useEffect(() => {
    const fullTitle = title.includes('IT SUPPORT') ? title : `${title} | IT SUPPORT`;
    document.title = fullTitle;

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', fullTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', fullTitle);
    setMetaContent('meta[name="twitter:description"]', description);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://itsupport.example.com';
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullUrl = `${origin}${cleanPath}`;

    const canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
    if (canonicalEl) {
      canonicalEl.href = fullUrl;
    }

    const schemaEl = document.getElementById('schema-jsonld');
    if (schemaEl) {
      const payload = jsonLd || {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: fullTitle,
        description,
        url: fullUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'IT SUPPORT',
          alternateName: 'Your Complete IT Troubleshooting Guide',
          url: `${origin}/`,
        },
      };
      schemaEl.textContent = JSON.stringify(payload);
    }
  }, [title, description, canonicalPath, jsonLd]);
}
