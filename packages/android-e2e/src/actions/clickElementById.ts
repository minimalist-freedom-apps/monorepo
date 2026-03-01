import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface ClickElementByIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly id: string;
}

export const clickElementById = async ({
    serverUrl,
    sessionId,
    id,
}: ClickElementByIdProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`#${id}`);
    await element.waitForExist({ timeout: defaultTimeoutMs });
    await element.click();
};
