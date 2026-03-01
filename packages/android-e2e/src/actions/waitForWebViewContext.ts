import { sleep } from '@minimalist-apps/utils';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForWebViewContextProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly timeoutMs?: number;
}

export const waitForWebViewContext = async ({
    serverUrl,
    sessionId,
    timeoutMs = defaultTimeoutMs,
}: WaitForWebViewContextProps): Promise<string> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const mobileBrowser = browser as unknown as {
        readonly getContexts: () => Promise<ReadonlyArray<string>>;
    };

    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const contexts = await mobileBrowser.getContexts();
        const webViewContext = contexts.find(context => context.startsWith('WEBVIEW'));

        if (webViewContext != null) {
            return webViewContext;
        }

        await sleep(pollIntervalMs);
    }

    throw new Error('WebView context not available within timeout.');
};
