import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { analyticsEnabled, setAnalyticsConsent } from "./analytics";

const syncAnalytics = () => setAnalyticsConsent(CookieConsent.acceptedCategory("analytics"));
const analyticsCookies = [
  { name: "_ga, _ga_* (cookie)", purpose: "Google Analytics: tells visits apart so pages can be compared.", duration: "2 years" },
  { name: "_clck (cookie)", purpose: "Microsoft Clarity: remembers a random visitor ID.", duration: "1 year" },
  { name: "_clsk (cookie)", purpose: "Microsoft Clarity: groups page views into one session.", duration: "1 day" },
];

let cookieSetup: Promise<void> | undefined;
function setupCookies() {
  return cookieSetup ??= CookieConsent.run({
    root: "#cookie-consent-root",
    mode: "opt-in",
    // Banner only appears when there is something optional to accept.
    autoShow: analyticsEnabled,
    hideFromBots: false,
    revision: analyticsEnabled ? 2 : 1,
    cookie: { name: "portfolio_cookie_choices", expiresAfterDays: 182 },
    categories: {
      necessary: { enabled: true, readOnly: true },
      ...(analyticsEnabled && { analytics: {} }),
    },
    onConsent: syncAnalytics,
    onChange: syncAnalytics,
    guiOptions: {
      consentModal: { layout: "box", position: "bottom right", equalWeightButtons: true },
      preferencesModal: { layout: "box", equalWeightButtons: true },
    },
    language: {
      default: "en",
      translations: {
        en: {
          consentModal: {
            title: "Your privacy choices",
            description: analyticsEnabled
              ? "I use Google Analytics and Microsoft Clarity to see which pages help and where visitors get stuck. They set cookies only if you accept. No advertising."
              : "This portfolio currently uses only essential browser storage. No analytics or advertising trackers are installed.",
            ...(analyticsEnabled && { acceptAllBtn: "Accept analytics" }),
            acceptNecessaryBtn: "Essential only",
            showPreferencesBtn: "Cookie choices",
          },
          preferencesModal: {
            title: "Cookie choices",
            savePreferencesBtn: "Save choices",
            ...(analyticsEnabled && { acceptAllBtn: "Accept analytics", acceptNecessaryBtn: "Essential only" }),
            closeIconLabel: "Close cookie choices",
            sections: [
              {
                title: "A small footprint",
                description: analyticsEnabled
                  ? "Essential storage is always on. Analytics stays off until you accept it, and you can change your choice here at any time."
                  : "This portfolio currently has no optional analytics or advertising cookies. There are no optional categories to enable. You can review the storage used below.",
              },
              {
                title: "Essential storage",
                description: "These settings support the choices you request. You can remove them in your browser settings. Clearing them resets your saved preferences.",
                linkedCategory: "necessary",
                cookieTable: {
                  caption: "Storage used by this website",
                  headers: { name: "Name", purpose: "Purpose", duration: "Duration" },
                  body: [
                    { name: "theme (local storage)", purpose: "Remembers your selected Light, Dark or Auto appearance on this device.", duration: "Until cleared in your browser" },
                    { name: "language (local storage)", purpose: "Remembers your selected language on this device.", duration: "Until cleared in your browser" },
                    { name: "portfolio_cookie_choices (cookie)", purpose: "Remembers your saved cookie choices on this website.", duration: "182 days" },
                  ],
                },
              },
              ...(analyticsEnabled ? [{
                title: "Analytics",
                description: "Google Analytics counts visits and which pages lead to contact. Microsoft Clarity records clicks and scrolling, with form fields masked, to find confusing parts of the site.",
                linkedCategory: "analytics",
                cookieTable: {
                  caption: "Analytics cookies",
                  headers: { name: "Name", purpose: "Purpose", duration: "Duration" },
                  body: analyticsCookies,
                },
              }] : []),
              {
                title: "Questions?",
                description: 'Contact <a href="mailto:pedronogueiranunes@gmail.com">pedronogueiranunes@gmail.com</a> about privacy or storage settings.',
              },
            ],
          },
        },
      },
    },
  }).catch((error) => { cookieSetup = undefined; throw error; });
}

function closeLegal(dialog: HTMLDialogElement) {
  dialog.close();
  document.documentElement.classList.remove("legal-modal-open");
}

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;
  const opener = event.target.closest<HTMLElement>("[data-open-legal]");
  if (opener) {
    const dialog = document.getElementById(opener.dataset.openLegal!) as HTMLDialogElement | null;
    if (dialog && !dialog.open) {
      dialog.scrollTop = 0;
      dialog.showModal();
      document.documentElement.classList.add("legal-modal-open");
    }
    return;
  }
  const closer = event.target.closest("[data-close-legal]");
  if (closer) {
    const dialog = closer.closest("dialog");
    if (dialog) closeLegal(dialog);
    return;
  }
  if (event.target.closest("[data-open-cookies]")) {
    document.querySelectorAll<HTMLDialogElement>(".legal-dialog[open]").forEach(closeLegal);
    const trigger = event.target.closest<HTMLButtonElement>("button");
    if (trigger) trigger.disabled = true;
    try {
      await setupCookies();
      CookieConsent.showPreferences();
    } finally {
      if (trigger) trigger.disabled = false;
    }
    return;
  }
  if (event.target instanceof HTMLDialogElement && event.target.matches(".legal-dialog")) {
    const bounds = event.target.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeLegal(event.target);
  }
});

document.addEventListener("close", (event) => {
  if (event.target instanceof HTMLDialogElement && event.target.matches(".legal-dialog")) {
    document.documentElement.classList.remove("legal-modal-open");
  }
}, true);

document.addEventListener("astro:before-swap", () => {
  document.querySelectorAll<HTMLDialogElement>(".legal-dialog[open]").forEach(closeLegal);
  CookieConsent.hidePreferences();
  // The banner root persists across navigations, so an open banner stays until answered.
  if (!analyticsEnabled) CookieConsent.hide();
});

// First visit: show the banner once the page has settled, so it never competes with first paint.
if (analyticsEnabled) {
  const start = () => setupCookies().catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 1500);
}
