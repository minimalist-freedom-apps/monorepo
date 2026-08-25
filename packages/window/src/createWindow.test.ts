import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createWindow } from './index.js';

test('registers an event listener and returns its cleanup', testContext => {
    const addEventListener = testContext.mock.method(
        globalThis.window,
        'addEventListener',
        () => {},
    );
    const removeEventListener = testContext.mock.method(
        globalThis.window,
        'removeEventListener',
        () => {},
    );
    const listener = () => {};
    const window = createWindow();

    const cleanup = window.addEventListener('beforeunload', listener);

    assert.strictEqual(addEventListener.mock.callCount(), 1);
    assert.deepStrictEqual(addEventListener.mock.calls[0]?.arguments, ['beforeunload', listener]);

    cleanup();

    assert.strictEqual(removeEventListener.mock.callCount(), 1);
    assert.deepStrictEqual(removeEventListener.mock.calls[0]?.arguments, [
        'beforeunload',
        listener,
    ]);
});
