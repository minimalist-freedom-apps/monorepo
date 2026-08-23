import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { pollIntervalMs } from './shared.ts';

interface SetAppiumContextProps {
    readonly session: E2ESession;
    readonly contextName: string;
}

const maxContextSwitchAttempts = 3;

const isTransientChromeAttachmentError = (error: unknown): boolean =>
    error instanceof Error && error.message.includes('chrome not reachable');

export const setAppiumContext = async ({
    session,
    contextName,
}: SetAppiumContextProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        session,
    });

    const mobileBrowser = browser as unknown as {
        readonly switchContext: (name: string) => Promise<void>;
    };

    for (let attempt = 1; attempt <= maxContextSwitchAttempts; attempt += 1) {
        try {
            await mobileBrowser.switchContext(contextName);

            return;
        } catch (error: unknown) {
            if (attempt === maxContextSwitchAttempts || !isTransientChromeAttachmentError(error)) {
                throw error;
            }

            await new Promise<void>(resolve => {
                setTimeout(resolve, pollIntervalMs);
            });
        }
    }
};
