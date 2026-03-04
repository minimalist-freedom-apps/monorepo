import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface GetElementAttributeByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
    readonly attribute: string;
    readonly timeoutMs?: number;
}

export const getElementAttributeByTestId = async ({
    session,
    testId,
    attribute,
    timeoutMs = defaultTimeoutMs,
}: GetElementAttributeByTestIdProps): Promise<string | null> => {
    const browser = await attachWebdriverIoBrowser({
        session,
    });

    const element = await browser.$(`[data-testid="${testId}"]`);
    await element.waitForExist({ timeout: timeoutMs });

    return element.getAttribute(attribute);
};
