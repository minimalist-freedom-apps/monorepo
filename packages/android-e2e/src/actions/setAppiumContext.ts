import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';

interface SetAppiumContextProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly contextName: string;
}

export const setAppiumContext = async ({
    serverUrl,
    sessionId,
    contextName,
}: SetAppiumContextProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const mobileBrowser = browser as unknown as {
        readonly switchContext: (name: string) => Promise<void>;
    };

    await mobileBrowser.switchContext(contextName);
};
