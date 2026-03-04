import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForElementTextByTestIdContainsProps {
    readonly session: E2ESession;
    readonly testId: string;
    readonly text: string;
    readonly timeoutMs?: number;
}

export const waitForElementTextByTestIdContains = async ({
    session,
    testId,
    text,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementTextByTestIdContainsProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        session,
    });

    const element = await browser.$(`[data-testid="${testId}"]`);
    await element.waitForExist({ timeout: timeoutMs });

    await browser.waitUntil(
        async () => {
            const value = await element.getText();

            return value.includes(text);
        },
        {
            interval: pollIntervalMs,
            timeout: timeoutMs,
            timeoutMsg: `Element [data-testid="${testId}"] does not contain text: ${text}`,
        },
    );
};
