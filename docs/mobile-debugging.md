# Mobile Debugging

## Android

### Prerequisites

- Android Studio installed
- USB debugging enabled on your device
- Chromium browser (for DevTools)

### Steps

1. Connect your Android device via USB
2. Run 
    - `pnpm --filter @minimalistic-apps/cake-bake dev`
    - `pnpm --filter @minimalistic-apps/cake-bake dev:android` in another terminal. App shall be installed and launched on your device.
3. Open `chrome://inspect` in Chromium
4. Your app should appear under **Remote Target**
5. Click **Inspect** to open DevTools

## iOS
As of now, iOS is not supported in this project. Apple is making it very hard for both users and developers to use and develop freedom tech. User with iOS devices are encouraged to switch to Android for freedom.