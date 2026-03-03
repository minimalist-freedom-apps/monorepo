import { createSession, deleteSession } from '@minimalist-apps/android-e2e';
import { restoreEvoluSeedStep } from '@minimalist-apps/fragment-evolu/e2e';
import { afterEach, test } from 'vitest';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';

const appPath = './android/app/build/outputs/apk/debug/app-debug.apk';

let currentSessionId: string | null = null;

afterEach(async () => {
    if (currentSessionId == null) {
        return;
    }

    await deleteSession({
        serverUrl,
        sessionId: currentSessionId,
    });

    currentSessionId = null;
});

test('smoke e2e can restore seed and verify debug owner suffix', async () => {
    const session = await createSession({
        appPath,
        serverUrl,
    });

    currentSessionId = session.sessionId;

    await restoreEvoluSeedStep({
        serverUrl,
        sessionId: session.sessionId,
    });
});
