import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { E2ESession } from '../session';
import { createIsElementExistingByTestId } from './isElementExistingByTestId';

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: async () => undefined,
};

describe(createIsElementExistingByTestId.name, () => {
    test('returns whether the test element exists', async testContext => {
        const isExisting = testContext.mock.fn(async () => true);
        const findElement = testContext.mock.fn(async () => ({ isExisting }));
        const attachWebdriverIoBrowser = testContext.mock.fn(async () => ({ $: findElement }));
        const isElementExistingByTestId = createIsElementExistingByTestId({
            attachWebdriverIoBrowser: attachWebdriverIoBrowser as never,
        });

        assert.strictEqual(
            await isElementExistingByTestId({ session, testId: 'settings-back-button' }),
            true,
        );
        assert.strictEqual(findElement.mock.callCount(), 1);
        assert.deepStrictEqual(findElement.mock.calls[0]?.arguments, [
            '[data-testid="settings-back-button"]',
        ]);
    });
});
