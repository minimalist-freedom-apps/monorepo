import {
    clickElementByXPath,
    clickElementByXPathWithJavaScript,
    createAppiumSession,
    deleteAppiumSession,
    getCurrentAppPackage,
    isPackageWithPrefix,
    setAppiumContext,
    typeIntoElementByXPath,
    waitForElementByXPath,
    waitForWebViewContext,
} from '@minimalist-apps/android-e2e';
import { afterEach, expect, test } from 'vitest';

const appPackagePrefix = 'com.minimalist.androidsync';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';
const appPath =
    process.env.E2E_ANDROID_APP_PATH ?? './android/app/build/outputs/apk/debug/app-debug.apk';
const testSeed =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

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

test('smoke e2e can open app, navigate settings, and restore seed', async () => {
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

    await waitForElementByXPath({
        serverUrl,
        sessionId: session.sessionId,
        xPath: "//*[contains(normalize-space(.), 'Android Sync')]",
    });

    await clickElementByXPath({
        serverUrl,
        sessionId: session.sessionId,
        xPath: "//*[@id='app-header-actions']",
    });

    await waitForElementByXPath({
        serverUrl,
        sessionId: session.sessionId,
        xPath: "//*[contains(normalize-space(.), 'Back')]",
    });

    let isRestoreTextareaVisible = false;

    try {
        await waitForElementByXPath({
            serverUrl,
            sessionId: session.sessionId,
            timeoutMs: 1_000,
            xPath: "//textarea[@placeholder='Enter your backup phrase here']",
        });

        isRestoreTextareaVisible = true;
    } catch (e) {
        console.error('error while waitForElementByXPath', e);
    }

    if (!isRestoreTextareaVisible) {
        await clickElementByXPath({
            serverUrl,
            sessionId: session.sessionId,
            xPath: "//*[self::button or self::*[@role='button']][contains(normalize-space(.), 'Restore Backup')]",
        });
    }

    await waitForElementByXPath({
        serverUrl,
        sessionId: session.sessionId,
        xPath: "//textarea[@placeholder='Enter your backup phrase here']",
    });

    await typeIntoElementByXPath({
        serverUrl,
        sessionId: session.sessionId,
        text: testSeed,
        xPath: "//textarea[@placeholder='Enter your backup phrase here']",
    });

    await clickElementByXPathWithJavaScript({
        xPath: "//div[contains(@class, 'ant-modal-footer')]//button[normalize-space(.)='Restore']",
        serverUrl,
        sessionId: session.sessionId,
    });

    const packageName = await getCurrentAppPackage({
        serverUrl,
        sessionId: session.sessionId,
    });

    expect(
        isPackageWithPrefix({
            packageName,
            packagePrefix: appPackagePrefix,
        }),
    ).toBe(true);
});
