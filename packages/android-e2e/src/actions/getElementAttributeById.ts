import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { defaultTimeoutMs } from './shared.ts';

interface GetElementAttributeByIdProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly id: string;
    readonly attribute: string;
    readonly timeoutMs?: number;
}

export const getElementAttributeById = async ({
    serverUrl,
    sessionId,
    id,
    attribute,
    timeoutMs = defaultTimeoutMs,
}: GetElementAttributeByIdProps): Promise<string | null> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    const element = await browser.$(`#${id}`);
    await element.waitForExist({ timeout: timeoutMs });

    return element.getAttribute(attribute);
};
