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

interface RunWebViewActionDeps {
    readonly attachWebdriverIoBrowser: typeof attachWebdriverIoBrowser;
    readonly setAppiumContext: typeof setAppiumContext;
    readonly waitForWebViewContext: typeof waitForWebViewContext;
}

interface ReconnectWebViewProps {
    readonly deps: RunWebViewActionDeps;
    readonly session: E2ESession;
}

type RunWebViewAction = <T>(props: RunWebViewActionProps<T>) => Promise<T>;

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

const reconnectWebView = async ({ deps, session }: ReconnectWebViewProps): Promise<void> => {
    const browser = await deps.attachWebdriverIoBrowser({ session });
    const mobileBrowser = browser as unknown as {
        readonly switchContext: (name: string) => Promise<void>;
    };

    await mobileBrowser.switchContext('NATIVE_APP');

    const webViewContextName = await deps.waitForWebViewContext({ session });

    await deps.setAppiumContext({
        contextName: webViewContextName,
        session,
    });
};

export const createRunWebViewAction =
    (deps: RunWebViewActionDeps): RunWebViewAction =>
    async <T>({ action, replay = 'safe', session }: RunWebViewActionProps<T>): Promise<T> => {
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

                await reconnectWebView({ deps, session });
                wasReconnected = true;

                if (replay === 'never' || attempt === maxActionAttempts) {
                    throw new WebViewActionInterruptedError(error);
                }
            }
        }

        throw new Error('WebView action retry limit reached.');
    };

export const runWebViewAction = createRunWebViewAction({
    attachWebdriverIoBrowser,
    setAppiumContext,
    waitForWebViewContext,
});

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
