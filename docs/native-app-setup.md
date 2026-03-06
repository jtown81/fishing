# Native App Setup Guide (Capacitor)

Build, package, and deploy Fishing Tournament Manager as native iOS and Android apps using **Capacitor**.

## Prerequisites

### System Requirements
- **macOS** (for iOS builds)
- **Xcode** 14+ (for iOS)
- **Android Studio** (for Android)
- **Node.js** 16+ and npm
- **Java Development Kit** (JDK 11+) for Android
- **Android SDK** 31+

### Install Capacitor CLI
```bash
npm install -g @capacitor/cli
```

---

## Project Setup

### 1. Initialize Capacitor
```bash
cd /home/jpl/projects/fishing
npm install @capacitor/core @capacitor/cli
npx cap init
```

**When prompted:**
```
App name: Fishing Tournament Manager
App Package ID: com.fishingtourney.app
```

### 2. Configure Capacitor (capacitor.config.ts)

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fishingtourney.app',
  appName: 'Fishing Tournament Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
```

### 3. Build Web App for Production
```bash
npm run build
```

### 4. Add Platforms
```bash
# Add iOS
npx cap add ios

# Add Android
npx cap add android
```

---

## iOS Setup & Build

### 1. Configure iOS Project

**Navigate to iOS project:**
```bash
cd ios/App
```

**Update App Name:**
1. Open `Podfile`
2. Change platform target to iOS 14.0+

### 2. Install Dependencies
```bash
# From project root
npx cap sync ios
```

### 3. Open in Xcode
```bash
npx cap open ios
```

**In Xcode:**

1. Select the **App** target
2. Go to **Signing & Capabilities**
3. Select your Team
4. Change Bundle Identifier: `com.fishingtourney.app`

### 4. Configure Native Features

**Camera & Geolocation (Info.plist):**

In Xcode, add to `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Camera is used to capture weigh-in photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location is used to record fishing location</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Location is used to record fishing location</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library is used to select weigh-in images</string>
```

### 5. Build & Archive

**For Development Testing:**
```bash
# In Xcode: Product → Build
```

**For App Store Submission (Archive):**
```bash
# In Xcode: Product → Archive
```

### 6. App Store Submission

1. Create App Store Connect account (developer.apple.com)
2. Create App ID: `com.fishingtourney.app`
3. Create Certificate Signing Request (CSR)
4. Sign app with certificate
5. Build archive in Xcode
6. Use Transporter to upload to App Store

---

## Android Setup & Build

### 1. Configure Android Project

**Prerequisites:**
- Android SDK installed (API 31+)
- ANDROID_HOME environment variable set

```bash
# Verify Android SDK
echo $ANDROID_HOME
# Should output: /path/to/Android/sdk
```

### 2. Install Dependencies
```bash
# From project root
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```

**In Android Studio:**

1. Select **App** module
2. Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**

### 4. Configure Native Features

**permissions (AndroidManifest.xml):**

In Android Studio, ensure permissions exist in `src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 5. Build APK/AAB

**For Testing (APK):**
```bash
# In Android Studio: Build → Build APK(s)
```

**For Play Store (AAB):**
```bash
# In Android Studio: Build → Build Bundle(s)
```

### 6. Google Play Store Submission

1. Create Google Play Developer account ($25 one-time fee)
2. Create app entry: `com.fishingtourney.app`
3. Upload signed AAB (Android App Bundle)
4. Add app screenshots, description, privacy policy
5. Submit for review (typically 24-48 hours)

---

## Native Features Configuration

### Camera (Already Integrated)

The app uses `@capacitor/camera` plugin. Configuration is in code:

```typescript
import { Camera, CameraResultType } from '@capacitor/camera'

const photo = await Camera.getPhoto({
  quality: 80,
  resultType: CameraResultType.DataUrl,
  source: 'camera'
})
```

### Geolocation (Already Integrated)

The app uses `@capacitor/geolocation` plugin:

```typescript
import { Geolocation } from '@capacitor/geolocation'

const position = await Geolocation.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 10000
})
```

### Push Notifications (Already Integrated)

Configured in `@lib/push-notifications.ts` using `@capacitor/push-notifications`.

### Offline Storage (PWA)

Service workers and local storage work seamlessly on native via Capacitor's WebView.

---

## Local Development & Testing

### Run on iOS Simulator
```bash
npx cap run ios
```

App opens in iOS Simulator. Changes to web code require rebuild:
```bash
npm run build
npx cap sync ios
```

### Run on Android Emulator
```bash
npx cap run android
```

### Run on Physical Device

**iOS:**
1. Plug in device
2. Xcode → Product → Scheme → Select your device
3. Product → Run

**Android:**
1. Enable Developer Mode (Settings → About → tap Build Number 7x)
2. Enable USB Debugging
3. Plug in device
4. Android Studio → Run → Select device

---

## Version Bumping

### Update App Version

**iOS (Xcode):**
- Build Settings → Version (CFBundleShortVersionString)
- Build Number (CFBundleVersion)

**Android (build.gradle):**
```gradle
android {
  defaultConfig {
    versionCode 1          // Increment for each release
    versionName "1.0.0"    // Semantic versioning
  }
}
```

**Web:**
Update `package.json`:
```json
{
  "version": "1.0.0"
}
```

---

## Deployment Checklist

- [ ] Update version numbers (iOS, Android, web)
- [ ] Update `docs/CHANGELOG.md` with changes
- [ ] Run `npm run build` and verify production build
- [ ] Test on physical devices (iOS and Android)
- [ ] Add app icons (512x512 minimum)
- [ ] Add app screenshots (5-8 per platform)
- [ ] Write compelling app description
- [ ] Include privacy policy URL
- [ ] Set app rating (e.g., "4+")
- [ ] Configure push notification certificate (iOS)
- [ ] Set up app signing certificates
- [ ] Upload to App Store Connect (iOS) or Google Play Console (Android)
- [ ] Submit for review
- [ ] Monitor review process

---

## CI/CD (GitHub Actions)

Example workflow for automated builds (optional):

```yaml
name: Build Native Apps

on:
  push:
    tags:
      - 'v*'

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npx cap sync ios
      # Build & upload to App Store

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npx cap sync android
      # Build & upload to Play Store
```

---

## Troubleshooting

### iOS

**Issue:** Xcode build fails with "Module not found"
```bash
# Solution: Clear build cache
rm -rf ios/App/Pods
rm -rf ios/App/Podfile.lock
npx cap sync ios
```

**Issue:** Simulator shows blank white screen
```bash
# Solution: Hard refresh in simulator
Press Cmd+R or go to Safari DevTools
```

### Android

**Issue:** Gradle build fails with "ANDROID_HOME not set"
```bash
# Solution: Set environment variable
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Issue:** Emulator not detected
```bash
# Solution: List available emulators
emulator -list-avds

# Start emulator
emulator -avd <name>
```

---

## Support

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Setup Guide](https://capacitorjs.com/docs/ios)
- [Android Setup Guide](https://capacitorjs.com/docs/android)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
