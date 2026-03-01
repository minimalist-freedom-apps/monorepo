import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface TypeIntoElementByIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly id: string;
    readonly text: string;
}

export const typeIntoElementById = async ({
    serverUrl,
    sessionId,
    id,
    text,
}: TypeIntoElementByIdProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`#${id}`);
    await element.waitForExist({ timeout: defaultTimeoutMs });
    await element.setValue(text);
};
