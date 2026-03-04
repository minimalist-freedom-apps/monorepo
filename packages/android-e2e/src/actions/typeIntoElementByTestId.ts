import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
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
    const browser = await attachWebdriverIoBrowser({ session });

    const element = await browser.$(`[data-testid="${testId}"]`);
    await element.waitForExist({ timeout: defaultTimeoutMs });
    await element.setValue(text);
};
