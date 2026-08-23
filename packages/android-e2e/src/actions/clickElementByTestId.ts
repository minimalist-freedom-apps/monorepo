import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';
import { defaultTimeoutMs } from './shared.ts';

interface ClickElementByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
}

export const clickElementByTestId = async ({
    session,
    testId,
}: ClickElementByTestIdProps): Promise<void> => {
    await runWebViewAction({
        action: async () => {
            const browser = await attachWebdriverIoBrowser({ session });
            const element = await browser.$(`[data-testid="${testId}"]`);

            await element.waitForExist({ timeout: defaultTimeoutMs });
            await element.click();
        },
        session,
    });
};
