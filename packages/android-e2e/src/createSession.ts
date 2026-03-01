import { attachWebdriverIoBrowser } from './actions/attachWebdriverIoBrowser.ts';
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

const isVideoRecordingEnabled = (): boolean => process.env.E2E_RECORD_VIDEO === 'true';

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

    if (isVideoRecordingEnabled()) {
        const browser = await attachWebdriverIoBrowser({
            serverUrl,
            sessionId: session.sessionId,
        });

        await browser.startRecordingScreen({
            forceRestart: true,
            timeLimit: '1800',
        });
    }

    return {
        sessionId: session.sessionId,
    };
};
