/**
 * IT SUPPORT - Google Tag Manager (GTM) & Google Analytics 4 (GA4) Integration
 * Safe, privacy-preserving tracking configured via:
 * - GTM Container ID: GTM-N8XQFGK3 (installed via index.html)
 * - Optional Direct GA4: VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX)
 *
 * Respects Do Not Track (DNT), avoids sending PII, and prevents duplicate page views or events.
 */

export const GTM_CONTAINER_ID = 'GTM-N8XQFGK3';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
    google_tag_manager?: Record<string, unknown>;
  }
}

let isInitialized = false;
let lastTrackedPageKey: string | null = null;

/**
 * Checks whether user has enabled Do-Not-Track in their browser.
 */
export function isDoNotTrackEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' ||
    (window as unknown as { doNotTrack?: string }).doNotTrack === '1'
  );
}

/**
 * Extracts and strictly validates the GA4 Measurement ID.
 * Rejects GTM container IDs (GTM-*) to prevent accidental duplication.
 */
export function getMeasurementId(): string | undefined {
  let id: unknown;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      id = import.meta.env.VITE_GA_MEASUREMENT_ID;
    }
  } catch {
    // Fall back to process.env if in Node environment
  }
  if (!id && typeof process !== 'undefined' && process.env) {
    id = process.env.VITE_GA_MEASUREMENT_ID;
  }

  if (!id || typeof id !== 'string') {
    return undefined;
  }

  const cleanId = id.trim();

  // Strictly reject empty, placeholder, or GTM container IDs
  if (
    !cleanId ||
    cleanId === 'G-XXXXXXXXXX' ||
    cleanId.toUpperCase().startsWith('GTM-') ||
    !cleanId.toUpperCase().startsWith('G-')
  ) {
    return undefined;
  }

  return cleanId;
}

/**
 * Pushes a structured event object to the Google Tag Manager dataLayer.
 * Respects Do Not Track and guarantees window.dataLayer array exists.
 */
export function pushToDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Initializes direct Google Analytics 4 if a valid Measurement ID is configured
 * and user has not enabled Do-Not-Track.
 *
 * When only GTM is used (default), this exits gracefully without loading extra scripts.
 */
export function initGA(): void {
  if (typeof window === 'undefined' || isInitialized || isDoNotTrackEnabled()) return;

  const measurementId = getMeasurementId();
  if (!measurementId) {
    // GTM handles tags via dataLayer; direct GA4 is not configured
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // Prevent duplicate initial page view; SPA router controls view timing
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    isInitialized = true;
  } catch {
    // Fail gracefully without breaking application UI
  }
}

/**
 * Track SPA route changes with sanitized title and path.
 * Deduplicates rapid consecutive identical triggers and notifies both GTM and direct GA4.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) return;

  const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const pageLocation = typeof window !== 'undefined' ? window.location.href : '';

  // Prevent duplicate page view events for rapid re-renders on the same route
  const currentKey = `${path}:::${pageTitle}`;
  if (lastTrackedPageKey === currentKey) {
    return;
  }
  lastTrackedPageKey = currentKey;

  // 1. Notify GTM container via dataLayer virtual_page_view event
  pushToDataLayer({
    event: 'virtual_page_view',
    page_path: path,
    page_title: pageTitle,
    page_location: pageLocation,
  });

  // 2. If direct GA4 is configured, send targeted page_view directly to measurementId
  const measurementId = getMeasurementId();
  if (measurementId && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: pageTitle,
      page_location: pageLocation,
      send_to: measurementId,
    });
  }
}

/**
 * Track custom engagement events (internal search, runbook reading, WhatsApp contact click, AI tool use).
 * Pushes event to GTM dataLayer and forwards to direct GA4 if active, redacting any PII.
 */
export function trackEvent(
  eventName: string,
  eventParams: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) return;

  // Sanitize params - remove undefined/null/PII
  const cleanParams: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(eventParams)) {
    if (val !== undefined && val !== null) {
      const strVal = String(val);
      // Redact email addresses
      if (/@/.test(strVal) && strVal.length < 100) {
        cleanParams[key] = '[REDACTED_EMAIL]';
      }
      // Redact phone numbers
      else if (
        key.toLowerCase().includes('phone') ||
        key.toLowerCase().includes('mobile') ||
        /\b\d{10,15}\b/.test(strVal.replace(/[\s\-\(\)\+]/g, ''))
      ) {
        cleanParams[key] = '[REDACTED_PHONE]';
      } else {
        cleanParams[key] = val;
      }
    }
  }

  // 1. Push custom event to Google Tag Manager dataLayer
  pushToDataLayer({
    event: eventName,
    ...cleanParams,
  });

  // 2. If direct GA4 is configured, send directly via gtag scoped to measurementId
  const measurementId = getMeasurementId();
  if (measurementId && window.gtag) {
    window.gtag('event', eventName, {
      ...cleanParams,
      send_to: measurementId,
    });
  }
}

/**
 * Reset internal state for test runner suites
 */
export function resetAnalyticsForTesting(): void {
  isInitialized = false;
  lastTrackedPageKey = null;
}

