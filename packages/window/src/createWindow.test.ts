import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createWindow } from './index.js';

test('runs timeout listener', testContext => {
    testContext.mock.timers.enable({ apis: ['setTimeout'] });
    const window = createWindow();
    const listener = testContext.mock.fn();

    window.setTimeout(listener, 1000);
    testContext.mock.timers.tick(1000);

    assert.strictEqual(listener.mock.callCount(), 1);
});

test('clears timeout listener', testContext => {
    testContext.mock.timers.enable({ apis: ['setTimeout'] });
    const window = createWindow();
    const listener = testContext.mock.fn();

    const timeoutId = window.setTimeout(listener, 1000);
    window.clearTimeout(timeoutId);
    testContext.mock.timers.tick(1000);

    assert.strictEqual(listener.mock.callCount(), 0);
});

test('runs interval listener repeatedly', testContext => {
    testContext.mock.timers.enable({ apis: ['setInterval'] });
    testContext.mock.method(
        globalThis.window,
        'setInterval',
        (listener: TimerHandler, timeout?: number) =>
            globalThis.setInterval(listener as () => void, timeout) as unknown as number,
    );
    const window = createWindow();
    const listener = testContext.mock.fn();

    window.setInterval(listener, 1000);
    testContext.mock.timers.tick(3000);

    assert.strictEqual(listener.mock.callCount(), 3);
});

test('clears interval listener', testContext => {
    testContext.mock.timers.enable({ apis: ['setInterval'] });
    testContext.mock.method(
        globalThis.window,
        'setInterval',
        (listener: TimerHandler, timeout?: number) =>
            globalThis.setInterval(listener as () => void, timeout) as unknown as number,
    );
    testContext.mock.method(globalThis.window, 'clearInterval', (intervalId: number) => {
        globalThis.clearInterval(intervalId);
    });
    const window = createWindow();
    const listener = testContext.mock.fn();

    const intervalId = window.setInterval(listener, 1000);
    testContext.mock.timers.tick(1000);
    window.clearInterval(intervalId);
    testContext.mock.timers.tick(2000);

    assert.strictEqual(listener.mock.callCount(), 1);
});
