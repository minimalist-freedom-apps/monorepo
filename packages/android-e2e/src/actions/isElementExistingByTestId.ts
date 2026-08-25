import type { E2ESession } from '../session.ts';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';
import { runWebViewAction } from './runWebViewAction.ts';

interface IsElementExistingByTestIdProps {
    readonly session: E2ESession;
    readonly testId: string;
}

interface IsElementExistingByTestIdDeps {
    readonly attachWebdriverIoBrowser: typeof attachWebdriverIoBrowser;
}

type IsElementExistingByTestId = (props: IsElementExistingByTestIdProps) => Promise<boolean>;

export const createIsElementExistingByTestId =
    (deps: IsElementExistingByTestIdDeps): IsElementExistingByTestId =>
    ({ session, testId }) =>
        runWebViewAction({
            action: async () => {
                const browser = await deps.attachWebdriverIoBrowser({ session });
                const element = await browser.$(`[data-testid="${testId}"]`);

                return element.isExisting();
            },
            session,
        });

export const isElementExistingByTestId = createIsElementExistingByTestId({
    attachWebdriverIoBrowser,
});
