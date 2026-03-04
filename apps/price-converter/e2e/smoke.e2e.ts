import { fileURLToPath } from 'node:url';
import { createSession } from '@minimalist-apps/android-e2e';
import { restoreEvoluSeedStep } from '@minimalist-apps/fragment-evolu/e2e';
import { test } from 'vitest';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';

const appPath = fileURLToPath(
    new URL('../android/app/build/outputs/apk/debug/app-debug.apk', import.meta.url),
);

test('smoke e2e can restore seed and verify debug owner suffix', async () => {
    await using session = await createSession({
        appPath,
        serverUrl,
    });

    await restoreEvoluSeedStep({
        session,
    });
});
