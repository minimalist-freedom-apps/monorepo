import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';

interface SetAppiumContextProps {
    readonly session: E2ESession;
    readonly contextName: string;
}

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

    await mobileBrowser.switchContext(contextName);
};
