import { useEffect } from 'react';
import { DEVELOPER_BRANDING } from './developerBranding';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface PageSEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: BreadcrumbItem[];
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

function setMetaContent(selector: string, content: string): void {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export const CANONICAL_SITE_ORIGIN = 'https://it-support-engg.vercel.app';

export function getCanonicalUrl(canonicalPath: string): string {
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  // Prefer the production canonical site URL for search engines
  return `${CANONICAL_SITE_ORIGIN}${cleanPath}`;
}

export function buildDefaultWebPageSchema(fullTitle: string, description: string, fullUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description,
    url: fullUrl,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'IT SUPPORT',
      alternateName: 'Your Complete IT Troubleshooting Guide',
      url: `${CANONICAL_SITE_ORIGIN}/`,
      description: 'Public IT troubleshooting knowledge base with 325+ real-world step-by-step solutions, Windows/Linux/AD/M365 guides, IT commands library, subnet calculators, interview prep, learning roadmap, and IT SUPPORT AI.',
      author: {
        '@type': 'Person',
        name: DEVELOPER_BRANDING.fullCreditName,
        jobTitle: DEVELOPER_BRANDING.role,
        url: CANONICAL_SITE_ORIGIN,
      },
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${CANONICAL_SITE_ORIGIN}${crumb.item}`,
    })),
  };
}

export function usePageSEO({
  title,
  description,
  canonicalPath,
  jsonLd,
  breadcrumbs,
  ogType = 'website',
  publishedTime,
  modifiedTime,
}: PageSEOConfig): void {
  useEffect(() => {
    const fullTitle = title.includes('IT SUPPORT') ? title : `${title} | IT SUPPORT`;
    document.title = fullTitle;

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', fullTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:type"]', ogType);
    setMetaContent('meta[name="twitter:title"]', fullTitle);
    setMetaContent('meta[name="twitter:description"]', description);

    const fullUrl = getCanonicalUrl(canonicalPath);

    setMetaContent('meta[property="og:url"]', fullUrl);

    // Update canonical link element
    let canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.querySelector('link[rel="canonical"]');
    }
    if (canonicalEl) {
      canonicalEl.href = fullUrl;
    }

    // Article published / modified times
    if (ogType === 'article') {
      const pubDate = publishedTime || '2025-01-01T00:00:00Z';
      const modDate = modifiedTime || new Date().toISOString();
      setMetaContent('meta[property="article:published_time"]', pubDate);
      setMetaContent('meta[property="article:modified_time"]', modDate);
      setMetaContent('meta[property="article:author"]', DEVELOPER_BRANDING.fullCreditName);
    }

    // JSON-LD structured data injection
    const schemaEl = document.getElementById('schema-jsonld');
    if (schemaEl) {
      const schemas: Record<string, unknown>[] = [];

      // Primary page / article schema
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd);
      } else if (jsonLd) {
        schemas.push(jsonLd);
      } else {
        schemas.push(buildDefaultWebPageSchema(fullTitle, description, fullUrl));
      }

      // BreadcrumbList schema if breadcrumbs provided
      if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push(buildBreadcrumbSchema(breadcrumbs));
      }

      schemaEl.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
    }
  }, [title, description, canonicalPath, jsonLd, breadcrumbs, ogType, publishedTime, modifiedTime]);
}
