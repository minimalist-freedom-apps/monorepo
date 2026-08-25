import assert from 'node:assert/strict';
import { describe, type TestContext, test } from 'node:test';
import type { E2ESession } from '../session';
import { createRunWebViewAction, runWebViewFlow } from './runWebViewAction';

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: async () => undefined,
};

interface TestCreateRunWebViewActionProps {
    readonly testContext: TestContext;
}

const testCreateRunWebViewAction = ({ testContext }: TestCreateRunWebViewActionProps) => {
    const switchContext = testContext.mock.fn(async () => undefined);
    const attachWebdriverIoBrowser = testContext.mock.fn(async () => ({ switchContext }));
    const setAppiumContext = testContext.mock.fn(async () => undefined);
    const waitForWebViewContext = testContext.mock.fn(async () => 'WEBVIEW_app');
    const runWebViewAction = createRunWebViewAction({
        attachWebdriverIoBrowser: attachWebdriverIoBrowser as never,
        setAppiumContext,
        waitForWebViewContext,
    });

    return {
        attachWebdriverIoBrowser,
        runWebViewAction,
        setAppiumContext,
        switchContext,
    };
};

describe(createRunWebViewAction.name, () => {
    test('reconnects the WebView and retries after its window is recreated', async testContext => {
        const deps = testCreateRunWebViewAction({ testContext });
        const action = testContext.mock.fn<() => Promise<string>>(async () => 'completed');
        action.mock.mockImplementationOnce(() =>
            Promise.reject(new Error('no such window: target window already closed')),
        );

        assert.strictEqual(await deps.runWebViewAction({ action, session }), 'completed');
        assert.strictEqual(action.mock.callCount(), 2);
        assert.deepStrictEqual(deps.switchContext.mock.calls[0]?.arguments, ['NATIVE_APP']);
        assert.deepStrictEqual(deps.setAppiumContext.mock.calls[0]?.arguments, [
            { contextName: 'WEBVIEW_app', session },
        ]);
    });

    test('does not retry unrelated action failures', async testContext => {
        const deps = testCreateRunWebViewAction({ testContext });
        const actionError = new Error('Element is disabled');
        const action = testContext.mock.fn<() => Promise<void>>(() => Promise.reject(actionError));

        await assert.rejects(deps.runWebViewAction({ action, session }), error => {
            assert.strictEqual(error, actionError);

            return true;
        });
        assert.strictEqual(action.mock.callCount(), 1);
        assert.strictEqual(deps.attachWebdriverIoBrowser.mock.callCount(), 0);
    });

    test('reconnects but does not replay a mutation automatically', async testContext => {
        const deps = testCreateRunWebViewAction({ testContext });
        const action = testContext.mock.fn<() => Promise<void>>(() =>
            Promise.reject(
                new Error(
                    'disconnected: Unable to receive message from renderer (disconnected: not connected to DevTools)',
                ),
            ),
        );

        await assert.rejects(
            deps.runWebViewAction({ action, replay: 'never', session }),
            (error: unknown) =>
                error instanceof Error && error.message.includes('WebView action was interrupted'),
        );
        assert.strictEqual(action.mock.callCount(), 1);
        assert.deepStrictEqual(deps.switchContext.mock.calls[0]?.arguments, ['NATIVE_APP']);
    });
});

describe(runWebViewFlow.name, () => {
    test('restarts a flow after an interrupted mutation', async testContext => {
        const deps = testCreateRunWebViewAction({ testContext });
        const mutation = testContext.mock.fn<() => Promise<string>>(async () => 'completed');
        mutation.mock.mockImplementationOnce(() =>
            Promise.reject(new Error('no such window: target window already closed')),
        );
        const flow = testContext.mock.fn(() =>
            deps.runWebViewAction({ action: mutation, replay: 'never', session }),
        );

        assert.strictEqual(await runWebViewFlow({ flow }), 'completed');
        assert.strictEqual(flow.mock.callCount(), 2);
        assert.strictEqual(mutation.mock.callCount(), 2);
    });
});
