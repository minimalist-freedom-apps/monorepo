import {
    createAppiumSession,
    deleteAppiumSession,
    setAppiumContext,
    waitForWebViewContext,
} from '@minimalist-apps/android-e2e';
import { restoreEvoluSeedStep } from '@minimalist-apps/fragment-evolu/e2e';
import { afterEach, test } from 'vitest';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';
const appPath =
    process.env.E2E_ANDROID_APP_PATH ?? './android/app/build/outputs/apk/debug/app-debug.apk';
let currentSessionId: string | null = null;

afterEach(async () => {
    if (currentSessionId == null) {
        return;
    }

    await deleteAppiumSession({
        serverUrl,
        sessionId: currentSessionId,
    });

    currentSessionId = null;
});

test('smoke e2e can restore seed and verify debug owner suffix', async () => {
    const session = await createAppiumSession({
        appPath,
        serverUrl,
    });

    currentSessionId = session.sessionId;

    const webViewContextName = await waitForWebViewContext({
        serverUrl,
        sessionId: session.sessionId,
    });

    await setAppiumContext({
        contextName: webViewContextName,
        serverUrl,
        sessionId: session.sessionId,
    });

    await restoreEvoluSeedStep({
        serverUrl,
        sessionId: session.sessionId,
    });
});
