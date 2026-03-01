import {
    clickElementByXPath,
    clickElementByXPathWithJavaScript,
    setAppiumContext,
    typeIntoElementByXPath,
    waitForElementByXPath,
    waitForWebViewContext,
} from '@minimalist-apps/android-e2e';

export const EVOLU_ABANDOn_TEST_SEED =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

export const EVOLU_ABANDON_SEED_OWNER_ID = 'F0xh0HpiAx5shgCgtGENww';

type RestoreEvoluSeedStepProps = {
    readonly serverUrl: string;
    readonly sessionId: string;
};

const openSettings = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='open-settings-button']",
    });

    try {
        await clickElementByXPathWithJavaScript({
            serverUrl,
            sessionId,
            xPath: "//*[@id='open-settings-button']",
        });
    } catch {
        await clickElementByXPathWithJavaScript({
            serverUrl,
            sessionId,
            xPath: "//*[@id='open-settings-button']",
        });
    }

    await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='settings-back-button']",
    });
};

const restoreSeed = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    let isRestoreTextareaVisible = false;

    try {
        await waitForElementByXPath({
            serverUrl,
            sessionId,
            timeoutMs: 1_000,
            xPath: "//*[@id='restore-seed-input']",
        });

        isRestoreTextareaVisible = true;
    } catch {}

    if (!isRestoreTextareaVisible) {
        await clickElementByXPath({
            serverUrl,
            sessionId,
            xPath: "//*[@id='restore-backup-button']",
        });
    }

    await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='restore-seed-input']",
    });

    await typeIntoElementByXPath({
        serverUrl,
        sessionId,
        text: EVOLU_ABANDOn_TEST_SEED,
        xPath: "//*[@id='restore-seed-input']",
    });

    await clickElementByXPathWithJavaScript({
        xPath: "//*[@id='restore-modal-ok']",
        serverUrl,
        sessionId,
    });
};

const enableDebug = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='debug-mode-switch']",
    });

    await clickElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='debug-mode-switch']",
    });

    await clickElementByXPath({
        serverUrl,
        sessionId,
        xPath: "//*[@id='settings-back-button']",
    });
};

const assertDebugOwnerSuffix = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath: `//*[@id='debug-owner-id' and contains(normalize-space(.), '${EVOLU_ABANDON_SEED_OWNER_ID.slice(-6)}')]`,
    });
};

export const restoreEvoluSeedStep = async (props: RestoreEvoluSeedStepProps): Promise<void> => {
    await openSettings(props);
    await restoreSeed(props);

    const webViewContextName = await waitForWebViewContext({
        serverUrl: props.serverUrl,
        sessionId: props.sessionId,
    });

    await setAppiumContext({
        contextName: webViewContextName,
        serverUrl: props.serverUrl,
        sessionId: props.sessionId,
    });

    await waitForElementByXPath({
        serverUrl: props.serverUrl,
        sessionId: props.sessionId,
        xPath: "//*[@id='open-settings-button']",
    });

    await openSettings(props);
    await enableDebug(props);
    await assertDebugOwnerSuffix(props);
};
