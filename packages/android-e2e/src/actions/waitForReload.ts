import { setAppiumContext } from './setAppiumContext.ts';
import { waitForElementById } from './waitForElementById.ts';
import { waitForWebViewContext } from './waitForWebViewContext.ts';

interface WaitForReloadProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

export const waitForReload = async ({
    serverUrl,
    sessionId,
}: WaitForReloadProps): Promise<void> => {
    const webViewContextName = await waitForWebViewContext({
        serverUrl,
        sessionId,
    });

    await setAppiumContext({
        contextName: webViewContextName,
        serverUrl,
        sessionId,
    });

    await waitForElementById({
        id: 'app',
        serverUrl,
        sessionId,
    });
};
