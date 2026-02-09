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

## Versioning

The **single source of truth** for the app version is the `version` field in `package.json`.

- **`versionName`** (shown to users) — read directly from `package.json` (e.g. `1.0.0`)
- **`versionCode`** (Android internal integer) — computed as `major * 10000 + minor * 100 + patch`
  - `1.0.0` → `10000`
  - `1.2.3` → `10203`
  - `2.0.0` → `20000`

To release a new version, bump `version` in `package.json` and rebuild. The APK filename, `versionName`, and `versionCode` all update automatically.

## Signing

Create `apps/scale-cake/android/keystore.properties` (gitignored) with the non-sensitive fields:

```properties
storeFile=../path/to/your-release.keystore
keyAlias=your-key-alias
```

`storeFile` is relative to the `android/app/` directory.

Passwords are **never** stored in plaintext. During the build you will be prompted interactively:

```
Enter storePassword:
Enter keyPassword:
```

Alternatively, you can pass them as Gradle flags to skip the prompt (useful in CI):

```bash
cd apps/scale-cake/android && ./gradlew assembleRelease -PstorePassword=*** -PkeyPassword=***
```

Without `keystore.properties`, the build produces an unsigned APK.

### Signing an existing APK

To sign (or re-sign) an APK that's already in the app root:

```bash
# Sign all apps
pnpm dev:android:sign

# Sign a single app
pnpm --filter @minimalist-apps/scale-cake dev:android:sign
```

The command finds the first `.apk` in `android/app/build/outputs/apk/release/`, reads the keystore path and alias from `android/keystore.properties`, and signs it with `apksigner`. You will be prompted for the store and key passwords.

### First-time setup

If the `android/` directory does not exist yet, add the platform first:

```bash
cd apps/scale-cake
npx cap add android
```

Then create `android/local.properties` pointing to your SDK:

```
sdk.dir=/home/your-user/Android/Sdk
```

This file is gitignored — each developer must create it locally.
