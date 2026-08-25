import { test } from 'node:test';
import { createSession } from '@minimalist-apps/android-e2e';
import { restoreEvoluSeedStep } from '@minimalist-apps/fragment-evolu/e2e';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';

const appPath = './android/app/build/outputs/apk/debug/app-debug.apk';

test('smoke e2e can restore seed and verify debug owner suffix', { timeout: 180_000 }, async () => {
    await using session = await createSession({
        appPath,
        serverUrl,
    });

    await restoreEvoluSeedStep({
        session,
    });
});
