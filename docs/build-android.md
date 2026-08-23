# Building Android APK

## Prerequisites

### Android SDK

Install the [Android SDK](https://developer.android.com/studio#command-line-tools-only) with the following components:

- **Build Tools** (e.g. `35.0.0`)
- **Platform** matching `compileSdkVersion` (e.g. `android-35`)
- **Platform Tools**

Set the `ANDROID_HOME` environment variable to the SDK path:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

### Java Development Kit (JDK)

JDK 17 or later is required. Verify with:

```bash
java -version
```

## Building

### 1. Development (live-reload on device)

Requires the Vite dev server running and a connected Android device/emulator:

```bash
pnpm --filter @minimalist-apps/scale-cake dev:android
```

### 2. Production APK

Build the web assets, sync to Android, and assemble the release APK:

```bash
pnpm --filter @minimalist-apps/scale-cake build:android
```

The APK will be in the Gradle build output directory, named by version from `package.json`:

```
apps/scale-cake/android/app/build/outputs/apk/release/scale-cake-1.0.0.apk
```
