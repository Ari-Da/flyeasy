import type { ExpoConfig } from 'expo/config';
import {
  ADAPTIVE_ICON_BG,
  ANDROID_PACKAGE,
  APP_NAME,
  APP_SCHEME,
  APP_SLUG,
  APP_VERSION,
  IOS_BUNDLE_ID,
  SPLASH_BG_DARK,
  SPLASH_BG_LIGHT,
} from './brand/brand.js';

/**
 * Native app config, driven by the single source of truth in brand/brand.ts.
 * The icon/splash PNGs are generated from brand_designs/ via `npm run brand:icons`
 * (see scripts/generate-brand-assets.mjs). Change the name/ids/colors in brand.ts,
 * change the art in brand_designs/ + regenerate — nothing is hardcoded here.
 */
const config: ExpoConfig = {
  name: APP_NAME,
  slug: APP_SLUG,
  scheme: APP_SCHEME,
  version: APP_VERSION,
  orientation: 'portrait',
  // Base icon (web / Android fallback). iOS uses the appearance variants below.
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  // New Architecture is default-on in SDK 56; no explicit flag needed.
  ios: {
    supportsTablet: true,
    bundleIdentifier: IOS_BUNDLE_ID,
    // iOS 18 appearance variants — light/dark/tinted, supported since SDK 56.
    // @expo/config-types lags the runtime schema here, so cast the object form.
    icon: {
      light: './assets/ios-icon-light.png',
      dark: './assets/ios-icon-dark.png',
      tinted: './assets/ios-icon-tinted.png',
    } as unknown as string,
  },
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: ADAPTIVE_ICON_BG,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    // Runtime-supported flags that @expo/config-types doesn't yet declare.
    ...({ edgeToEdgeEnabled: true, predictiveBackGestureEnabled: false } as object),
  },
  web: {
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: SPLASH_BG_LIGHT,
        dark: {
          image: './assets/splash-icon-dark.png',
          backgroundColor: SPLASH_BG_DARK,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
