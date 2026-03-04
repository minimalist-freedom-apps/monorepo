import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForElementByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
    readonly timeoutMs?: number;
}

export const waitForElementByTestId = async ({
    session,
    testId,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementByTestIdProps): Promise<string> => {
    const browser = await attachWebdriverIoBrowser({
        session,
    });

    const element = await browser.$(`[data-testid="${testId}"]`);

    await browser.waitUntil(async () => element.isExisting(), {
        interval: pollIntervalMs,
        timeout: timeoutMs,
        timeoutMsg: `Element not found for testId: ${testId}`,
    });

    return element.elementId;
};
