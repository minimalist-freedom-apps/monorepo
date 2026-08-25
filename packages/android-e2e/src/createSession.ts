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

interface CreateSessionDeps {
    readonly attachWebdriverIoBrowser: typeof attachWebdriverIoBrowser;
    readonly createAppiumSession: typeof createAppiumSession;
    readonly deleteSession: typeof deleteSession;
    readonly setAppiumContext: typeof setAppiumContext;
    readonly waitForWebViewContext: typeof waitForWebViewContext;
}

type CreateSession = (props: CreateAppiumSessionInWebViewProps) => Promise<E2ESession>;

const isVideoRecordingEnabled = (): boolean => process.env.E2E_RECORD_VIDEO === 'true';

export const createCreateSession =
    (deps: CreateSessionDeps): CreateSession =>
    async ({ appPath, serverUrl }) => {
        const appiumSession = await deps.createAppiumSession({
            appPath,
            serverUrl,
        });

        const session = {
            serverUrl,
            sessionId: appiumSession.sessionId,
            async [Symbol.asyncDispose](): Promise<void> {
                await deps.deleteSession({
                    session,
                });
            },
        };

        try {
            const webViewContextName = await deps.waitForWebViewContext({
                session,
            });

            await deps.setAppiumContext({
                contextName: webViewContextName,
                session,
            });

            if (isVideoRecordingEnabled()) {
                const browser = await deps.attachWebdriverIoBrowser({
                    session,
                });

                await browser.startRecordingScreen({
                    forceRestart: true,
                    timeLimit: '1800',
                });
            }
        } catch (error) {
            await session[Symbol.asyncDispose]();

            throw error;
        }

        return session;
    };

export const createSession = createCreateSession({
    attachWebdriverIoBrowser,
    createAppiumSession,
    deleteSession,
    setAppiumContext,
    waitForWebViewContext,
});
