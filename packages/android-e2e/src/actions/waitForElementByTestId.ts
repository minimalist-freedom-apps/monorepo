import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';
import { defaultTimeoutMs, pollIntervalMs } from './shared.ts';

interface WaitForElementByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
    readonly timeoutMs?: number;
}

export const waitForElementByTestId = ({
    session,
    testId,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementByTestIdProps): Promise<string> =>
    runWebViewAction({
        action: async () => {
            const browser = await attachWebdriverIoBrowser({ session });
            const element = await browser.$(`[data-testid="${testId}"]`);

            await browser.waitUntil(async () => element.isExisting(), {
                interval: pollIntervalMs,
                timeout: timeoutMs,
                timeoutMsg: `Element not found for testId: ${testId}`,
            });

            return element.elementId;
        },
        session,
    });
