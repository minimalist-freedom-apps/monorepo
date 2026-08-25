import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createCreateSession } from './createSession';
import type { E2ESession } from './session';

describe(createCreateSession.name, () => {
    test('deletes the Appium session when WebView setup fails', async testContext => {
        const setupError = new Error('WebView setup failed');
        const deleteSession = testContext.mock.fn(
            async (_props: { readonly session: E2ESession }) => undefined,
        );
        const createSession = createCreateSession({
            attachWebdriverIoBrowser: testContext.mock.fn() as never,
            createAppiumSession: testContext.mock.fn(async () => ({ sessionId: 'session-id' })),
            deleteSession,
            setAppiumContext: testContext.mock.fn(),
            waitForWebViewContext: testContext.mock.fn(() => Promise.reject(setupError)),
        });

        await assert.rejects(
            createSession({
                appPath: '/tmp/app.apk',
                serverUrl: 'http://localhost:4723',
            }),
            error => {
                assert.strictEqual(error, setupError);

                return true;
            },
        );

        assert.strictEqual(deleteSession.mock.callCount(), 1);
        const deleteSessionParams = deleteSession.mock.calls[0]?.arguments[0];
        assert.strictEqual(deleteSessionParams.session.serverUrl, 'http://localhost:4723');
        assert.strictEqual(deleteSessionParams.session.sessionId, 'session-id');
    });
});
