import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForElementByIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly id: string;
    readonly timeoutMs?: number;
}

export const waitForElementById = async ({
    serverUrl,
    sessionId,
    id,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementByIdProps): Promise<string> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`#${id}`);

    await browser.waitUntil(async () => element.isExisting(), {
        interval: pollIntervalMs,
        timeout: timeoutMs,
        timeoutMsg: `Element not found for id: ${id}`,
    });

    return element.elementId;
};
