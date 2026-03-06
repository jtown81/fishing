# Native App Deployment Guide

## Overview

The Fishing Tournament app ships as a native iOS and Android app using [Capacitor](https://capacitorjs.com/). The web build is wrapped in a native shell that provides access to device hardware (camera, push notifications, native share sheet).

## Prerequisites

- **iOS**: macOS, Xcode 15+, Apple Developer account
- **Android**: Android Studio Hedgehog+, JDK 17+
- Node.js 18+, pnpm

## Build Pipeline

### 1. Install native platforms (one-time setup)
```bash
pnpm install
npx cap init "Fishing Tournament" "com.fishingTournament.app" --web-dir dist
npx cap add ios
npx cap add android
```

### 2. Build and sync
```bash
npm run build:native    # tsc + vite build + cap sync
```

This runs: `tsc -b && vite build && npx cap sync`

### 3. Open in IDE
```bash
npm run cap:ios         # npx cap open ios  → opens Xcode
npm run cap:android     # npx cap open android → opens Android Studio
```

### 4. After web changes
```bash
npm run cap:sync        # npx cap sync — copies web build into native projects
```

---

## iOS Deployment

### Building and Archiving
1. Open Xcode via `npm run cap:ios`
2. Select your Apple Developer Team in **Signing & Capabilities**
3. Set the active scheme to **Release**
4. Product → **Archive**
5. In the Organizer, click **Distribute App** → App Store Connect
6. Follow the Xcode upload wizard

### APNs (Push Notifications) Setup
1. Go to [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles
2. Create an **APNs Auth Key** (p8 file) — one key works for all apps
3. In Supabase dashboard → Settings → Edge Functions → Secrets:
   - `APNS_KEY_ID` — the 10-char key ID
   - `APNS_TEAM_ID` — your 10-char Team ID
   - `APNS_KEY` — contents of the p8 file (base64 or raw)
4. Enable Push Notifications capability in Xcode

---

## Android Deployment

### Building and Signing
1. Open Android Studio via `npm run cap:android`
2. Build → **Generate Signed Bundle / APK**
3. Select **Android App Bundle (AAB)**
4. Create or select a keystore file
5. Build the release bundle
6. Upload to [Google Play Console](https://play.google.com/console)

### FCM (Push Notifications) Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing) → Add Android app with package `com.fishingTournament.app`
3. Download `google-services.json` → place in `android/app/`
4. In Firebase Console → Project Settings → Cloud Messaging → copy **Server Key**
5. In Supabase dashboard → Settings → Edge Functions → Secrets:
   - `FCM_SERVER_KEY` — the Firebase Cloud Messaging server key

---

## Environment Variables

For production native builds, ensure `.env.local` (or build-time env injection) includes:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

These are baked into the web bundle at build time.

---

## Capacitor Plugin Reference

| Plugin | Purpose | Web Fallback |
|--------|---------|--------------|
| `@capacitor/camera` | Weigh-in photo capture | File `<input type="file">` |
| `@capacitor/share` | Native share sheet | Web Share API → clipboard |
| `@capacitor/push-notifications` | Billing/sync alerts | No-op |

---

## Updating the App

After any code change:
```bash
npm run build:native    # rebuild web + sync to native
# Then in Xcode/Android Studio: re-run on device or archive
```

For native plugin changes (adding/removing `@capacitor/*` packages), run `npx cap sync` after `pnpm install`.
