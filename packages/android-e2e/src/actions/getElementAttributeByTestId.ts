import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface GetElementAttributeByTestIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly testId: string;
    readonly attribute: string;
    readonly timeoutMs?: number;
}

export const getElementAttributeByTestId = async ({
    serverUrl,
    sessionId,
    testId,
    attribute,
    timeoutMs = defaultTimeoutMs,
}: GetElementAttributeByTestIdProps): Promise<string | null> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`[data-testid="${testId}"]`);
    await element.waitForExist({ timeout: timeoutMs });

    return element.getAttribute(attribute);
};
