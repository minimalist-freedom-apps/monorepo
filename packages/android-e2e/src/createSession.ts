import { createAppiumSession } from './actions/createAppiumSession.ts';
import { setAppiumContext } from './actions/setAppiumContext.ts';
import { waitForWebViewContext } from './actions/waitForWebViewContext.ts';

interface CreateAppiumSessionInWebViewProps {
    readonly appPath: string;
    readonly serverUrl: string;
}

interface CreateAppiumSessionInWebViewOutput {
    readonly sessionId: string;
}

export const createSession = async ({
    appPath,
    serverUrl,
}: CreateAppiumSessionInWebViewProps): Promise<CreateAppiumSessionInWebViewOutput> => {
    const session = await createAppiumSession({
        appPath,
        serverUrl,
    });

    const webViewContextName = await waitForWebViewContext({
        serverUrl,
        sessionId: session.sessionId,
    });

    await setAppiumContext({
        contextName: webViewContextName,
        serverUrl,
        sessionId: session.sessionId,
    });

    return {
        sessionId: session.sessionId,
    };
};
