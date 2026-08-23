import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';

interface IsElementExistingByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
}

export const isElementExistingByTestId = ({
    session,
    testId,
}: IsElementExistingByTestIdProps): Promise<boolean> =>
    runWebViewAction({
        action: async () => {
            const browser = await attachWebdriverIoBrowser({ session });
            const element = await browser.$(`[data-testid="${testId}"]`);

            return element.isExisting();
        },
        session,
    });
