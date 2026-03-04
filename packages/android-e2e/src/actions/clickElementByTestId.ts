import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface ClickElementByTestIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly testId: string;
}

export const clickElementByTestId = async ({
    serverUrl,
    sessionId,
    testId,
}: ClickElementByTestIdProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`[data-testid="${testId}"]`);
    await element.waitForExist({ timeout: defaultTimeoutMs });
    await element.click();
};
