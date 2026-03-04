import { attachWebdriverIoBrowser } from './actions/attachWebdriverIoBrowser.ts';
import { createAppiumSession } from './actions/createAppiumSession.ts';
import { deleteSession } from './actions/deleteAppiumSession.ts';
import { setAppiumContext } from './actions/setAppiumContext.ts';
import { waitForWebViewContext } from './actions/waitForWebViewContext.ts';
import type { E2ESession } from './session.ts';

interface CreateAppiumSessionInWebViewProps {
    readonly appPath: string;
    readonly serverUrl: string;
}

const isVideoRecordingEnabled = (): boolean => process.env.E2E_RECORD_VIDEO === 'true';

export const createSession = async ({
    appPath,
    serverUrl,
}: CreateAppiumSessionInWebViewProps): Promise<E2ESession> => {
    const appiumSession = await createAppiumSession({
        appPath,
        serverUrl,
    });

    const session = {
        serverUrl,
        sessionId: appiumSession.sessionId,
        async [Symbol.asyncDispose](): Promise<void> {
            await deleteSession({
                session,
            });
        },
    };

    const webViewContextName = await waitForWebViewContext({
        session,
    });

    await setAppiumContext({
        contextName: webViewContextName,
        session,
    });

    if (isVideoRecordingEnabled()) {
        const browser = await attachWebdriverIoBrowser({
            session,
        });

        await browser.startRecordingScreen({
            forceRestart: true,
            timeLimit: '1800',
        });
    }

    return session;
};
