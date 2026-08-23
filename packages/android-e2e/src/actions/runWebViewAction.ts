import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { setAppiumContext } from './setAppiumContext.ts';
import { waitForWebViewContext } from './waitForWebViewContext.ts';

interface RunWebViewActionProps<T> {
    readonly action: () => Promise<T>;
    readonly replay?: 'never' | 'safe';
    readonly session: E2ESession;
}

interface RunWebViewFlowProps<T> {
    readonly flow: () => Promise<T>;
}

const maxActionAttempts = 3;
const maxFlowAttempts = 3;

const webViewDetachedErrorMessages = [
    'chrome not reachable',
    'disconnected: unable to receive message from renderer',
    'no such window',
    'not connected to devtools',
    'stale element reference',
    'target window already closed',
    'web view not found',
];

const isWebViewDetachedError = (error: unknown): boolean => {
    if (!(error instanceof Error)) {
        return false;
    }

    if (
        webViewDetachedErrorMessages.some(message => error.message.toLowerCase().includes(message))
    ) {
        return true;
    }

    return isWebViewDetachedError(error.cause);
};

class WebViewActionInterruptedError extends Error {
    constructor(cause: unknown) {
        super('WebView action was interrupted after its context was recreated.', { cause });
        this.name = 'WebViewActionInterruptedError';
    }
}

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
    replay = 'safe',
    session,
}: RunWebViewActionProps<T>): Promise<T> => {
    let wasReconnected = false;

    for (let attempt = 1; attempt <= maxActionAttempts; attempt += 1) {
        try {
            return await action();
        } catch (error: unknown) {
            if (!isWebViewDetachedError(error)) {
                if (wasReconnected) {
                    throw new WebViewActionInterruptedError(error);
                }

                throw error;
            }

            await reconnectWebView(session);
            wasReconnected = true;

            if (replay === 'never' || attempt === maxActionAttempts) {
                throw new WebViewActionInterruptedError(error);
            }
        }
    }

    throw new Error('WebView action retry limit reached.');
};

export const runWebViewFlow = async <T>({ flow }: RunWebViewFlowProps<T>): Promise<T> => {
    for (let attempt = 1; attempt <= maxFlowAttempts; attempt += 1) {
        try {
            return await flow();
        } catch (error: unknown) {
            if (attempt === maxFlowAttempts || !(error instanceof WebViewActionInterruptedError)) {
                throw error;
            }
        }
    }

    throw new Error('WebView flow retry limit reached.');
};
