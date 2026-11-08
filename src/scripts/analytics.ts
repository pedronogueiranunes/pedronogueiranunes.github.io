// Google Analytics 4 + Microsoft Clarity. Both load only when their ID is set at build time.
// Until the visitor accepts "Analytics" in the cookie banner they run cookieless
// (GA consent mode / Clarity consentv2 denied); accepting switches cookies on.
const GA_ID = import.meta.env.PUBLIC_GA_ID;
const CLARITY_ID = import.meta.env.PUBLIC_CLARITY_ID;
export const analyticsEnabled = Boolean(GA_ID || CLARITY_ID);

type Fn = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer: unknown[]; gtag?: Fn; clarity?: Fn & { q?: unknown[] } }
}

function savedConsent() {
  const match = document.cookie.match(/(?:^|; )portfolio_cookie_choices=([^;]+)/);
  try {
    return Boolean(match && JSON.parse(decodeURIComponent(match[1])).categories.includes("analytics"));
  } catch {
    return false;
  }
}

function load(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.append(script);
}

export function setAnalyticsConsent(granted: boolean) {
  const state = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", { analytics_storage: state });
  window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: state });
}

export function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", name, params);
  window.clarity?.("event", name);
}

if (GA_ID) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag needs the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: savedConsent() ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  load(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
}

if (CLARITY_ID) {
  const clarity = (window.clarity ||= function (...args: unknown[]) {
    (clarity.q ||= []).push(args);
  } as Fn & { q?: unknown[] });
  load(`https://www.clarity.ms/tag/${CLARITY_ID}`);
  setAnalyticsConsent(savedConsent());
}

// Page views on client-side navigation are picked up by GA enhanced measurement and
// Clarity's history tracking. Outbound links and the CV PDF are GA enhanced measurement too.
if (analyticsEnabled) {
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (!link) return;
    const from = { link_text: link.textContent?.trim().slice(0, 60), page_path: location.pathname };
    if (link.protocol === "mailto:") track("contact_email", from);
    else if (link.hostname.endsWith("calendly.com")) track("book_call_calendly", from);
    else if (link.origin === location.origin && /\/contact\/?$/.test(link.pathname)) track("cta_contact", from);
  }, { capture: true });
}
