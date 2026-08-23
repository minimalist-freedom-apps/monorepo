import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';
import { defaultTimeoutMs } from './shared.ts';

interface TypeIntoElementByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
    readonly text: string;
}

export const typeIntoElementByTestId = async ({
    session,
    testId,
    text,
}: TypeIntoElementByTestIdProps): Promise<void> => {
    await runWebViewAction({
        action: async () => {
            const browser = await attachWebdriverIoBrowser({ session });
            const element = await browser.$(`[data-testid="${testId}"]`);

            await element.waitForExist({ timeout: defaultTimeoutMs });
            await element.setValue(text);
        },
        session,
    });
};
