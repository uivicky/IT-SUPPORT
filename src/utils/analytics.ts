/**
 * IT SUPPORT - Google Analytics 4 (GA4) Integration
 * Safe, privacy-preserving tracking configured via VITE_GA_MEASUREMENT_ID.
 * Respects Do Not Track (DNT) and avoids sending any Personally Identifiable Information (PII).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let isInitialized = false;

export function getMeasurementId(): string | undefined {
  // Support Vite client-side import.meta.env and Node test runner environments
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

  if (!id || typeof id !== 'string' || !id.trim() || id === 'G-XXXXXXXXXX') {
    return undefined;
  }
  return id.trim();
}

/**
 * Initializes Google Analytics 4 if a valid Measurement ID is configured
 * and the user has not enabled Do-Not-Track.
 */
export function initGA(): void {
  if (typeof window === 'undefined' || isInitialized) return;

  const measurementId = getMeasurementId();
  if (!measurementId) {
    return;
  }

  // Respect browser Do Not Track setting
  if (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1') {
    return;
  }

  try {
    // Append GA4 script tag asynchronously
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
      send_page_view: false, // Page views tracked on route changes
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    isInitialized = true;
  } catch {
    // Fail gracefully without breaking application UI
  }
}

/**
 * Track page view with sanitized title and path
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  const measurementId = getMeasurementId();
  if (!measurementId) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    send_to: measurementId,
  });
}

/**
 * Track custom engagement events (internal search, runbook reading, WhatsApp contact click, AI tool use)
 */
export function trackEvent(
  eventName: string,
  eventParams: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Sanitize params - remove undefined/null/PII
  const cleanParams: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(eventParams)) {
    if (val !== undefined && val !== null) {
      // Ensure no raw email or phone string is passed accidentally
      const strVal = String(val);
      if (/@/.test(strVal) && strVal.length < 100) {
        cleanParams[key] = '[REDACTED_EMAIL]';
      } else {
        cleanParams[key] = val;
      }
    }
  }

  window.gtag('event', eventName, cleanParams);
}
