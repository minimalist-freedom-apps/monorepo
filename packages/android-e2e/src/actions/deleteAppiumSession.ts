import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';

interface DeleteAppiumSessionProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

export const deleteSession = async ({
    serverUrl,
    sessionId,
}: DeleteAppiumSessionProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    await browser.deleteSession();
};
