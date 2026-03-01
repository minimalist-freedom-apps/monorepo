import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForElementTextByIdContainsProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly id: string;
    readonly text: string;
    readonly timeoutMs?: number;
}

export const waitForElementTextByIdContains = async ({
    serverUrl,
    sessionId,
    id,
    text,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementTextByIdContainsProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`#${id}`);
    await element.waitForExist({ timeout: timeoutMs });

    await browser.waitUntil(
        async () => {
            const value = await element.getText();

            return value.includes(text);
        },
        {
            interval: pollIntervalMs,
            timeout: timeoutMs,
            timeoutMsg: `Element #${id} does not contain text: ${text}`,
        },
    );
};
