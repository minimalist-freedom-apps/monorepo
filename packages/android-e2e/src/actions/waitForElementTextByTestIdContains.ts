import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';
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
    await runWebViewAction({
        action: async () => {
            const browser = await attachWebdriverIoBrowser({ session });
            const element = await browser.$(`[data-testid="${testId}"]`);

            await element.waitForExist({ timeout: timeoutMs });

            try {
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
            } catch (error: unknown) {
                const [actualText, browserLogs] = await Promise.all([
                    element.getText(),
                    browser.getLogs('browser'),
                ]);

                throw new Error(
                    `Element [data-testid="${testId}"] does not contain text: ${text}. Actual text: ${actualText}. Browser logs: ${JSON.stringify(browserLogs)}`,
                    { cause: error },
                );
            }
        },
        session,
    });
};
