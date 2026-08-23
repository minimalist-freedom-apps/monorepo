import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { setAppiumContext } from './setAppiumContext.ts';
import { waitForWebViewContext } from './waitForWebViewContext.ts';

interface RunWebViewActionProps<T> {
    readonly action: () => Promise<T>;
    readonly session: E2ESession;
}

const maxActionAttempts = 3;

const webViewDetachedErrorMessages = [
    'chrome not reachable',
    'no such window',
    'stale element reference',
    'target window already closed',
    'web view not found',
];

const isWebViewDetachedError = (error: unknown): boolean =>
    error instanceof Error &&
    webViewDetachedErrorMessages.some(message => error.message.toLowerCase().includes(message));

const reconnectWebView = async (session: E2ESession): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({ session });
    const mobileBrowser = browser as unknown as {
        readonly switchContext: (name: string) => Promise<void>;
    };

    await mobileBrowser.switchContext('NATIVE_APP');

    const webViewContextName = await waitForWebViewContext({ session });

    await setAppiumContext({
        contextName: webViewContextName,
        session,
    });
};

export const runWebViewAction = async <T>({
    action,
    session,
}: RunWebViewActionProps<T>): Promise<T> => {
    for (let attempt = 1; attempt <= maxActionAttempts; attempt += 1) {
        try {
            return await action();
        } catch (error: unknown) {
            if (attempt === maxActionAttempts || !isWebViewDetachedError(error)) {
                throw error;
            }

            await reconnectWebView(session);
        }
    }

    throw new Error('WebView action retry limit reached.');
};
