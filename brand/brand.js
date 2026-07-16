/**
 * Flyeasy brand — the single source of truth for the app's identity.
 *
 * CommonJS (not .ts) on purpose: this one file is loaded from three runtimes,
 * and app.config.ts's loader can only `require()` plain JS for its imports —
 *   - app.config.ts (Node, build time) — native name, ids, icon + splash config
 *   - components/ui/* (app runtime, via Metro) — the wordmark and mark
 *   - scripts/*.mjs (Node tooling)
 * Types are provided alongside in brand/brand.d.ts, so app code is fully typed.
 *
 * Design sources live in brand_designs/ (gitignored). The PNGs the OS needs are
 * generated into assets/ by `npm run brand:icons`.
 */

/** The app name — shown under the icon and in the wordmark. Change it here. */
const APP_NAME = 'Flyeasy';
const APP_TAGLINE = 'Two journeys, one point.';

const APP_SLUG = 'flyeasy';
const APP_SCHEME = 'flyeasy';
const APP_VERSION = '1.0.0';

const IOS_BUNDLE_ID = 'com.flyeasy.app';
const ANDROID_PACKAGE = 'com.flyeasy.app';

// Support / legal.
const SUPPORT_EMAIL = 'support@flyeasytogether.com';
const COMPANY_NAME = 'Flyeasy';
// Shown on the legal pages. Update when the Terms/Privacy copy changes.
const LEGAL_LAST_UPDATED = '16 July 2026';

/**
 * Brand palette — mirrors brand_designs/brand.json. The app's themeable accent
 * lives in theme/palettes.ts; these are the fixed brand constants used by the
 * logo art and by build-time asset generation.
 */
const brandColors = {
  cream: '#f5f1e8', // app background
  card: '#fbf9f3', // elevated surfaces
  ink: '#1f2420', // primary text, logo
  slate: '#4a5560', // secondary text, left plane
  green: '#5a8a4d', // brand / primary action, right plane
  greenDark: '#47723c', // pressed / plane fold shadow
  line: '#e0d9c8', // borders, dividers
};

/** Native splash background colors — kept in sync with the generated splash PNGs. */
const SPLASH_BG_LIGHT = brandColors.cream;
const SPLASH_BG_DARK = brandColors.ink;

/** Android adaptive-icon background (the solid layer behind the mark). */
const ADAPTIVE_ICON_BG = brandColors.cream;

module.exports = {
  APP_NAME,
  APP_TAGLINE,
  APP_SLUG,
  APP_SCHEME,
  APP_VERSION,
  IOS_BUNDLE_ID,
  ANDROID_PACKAGE,
  SUPPORT_EMAIL,
  COMPANY_NAME,
  LEGAL_LAST_UPDATED,
  brandColors,
  SPLASH_BG_LIGHT,
  SPLASH_BG_DARK,
  ADAPTIVE_ICON_BG,
};
