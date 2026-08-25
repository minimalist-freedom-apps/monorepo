import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';

import { createWindow } from './index.js';

// Vitest is intentional here: its JSDOM fake timers patch window timers as one environment.
afterEach(() => {
    vi.useRealTimers();
});

test('runs timeout listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    let callCount = 0;

    window.setTimeout(() => {
        callCount += 1;
    }, 1000);
    vi.advanceTimersByTime(1000);

    assert.strictEqual(callCount, 1);
});

test('clears timeout listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    let callCount = 0;

    const timeoutId = window.setTimeout(() => {
        callCount += 1;
    }, 1000);
    window.clearTimeout(timeoutId);
    vi.advanceTimersByTime(1000);

    assert.strictEqual(callCount, 0);
});

test('runs interval listener repeatedly', () => {
    vi.useFakeTimers();
    const window = createWindow();
    let callCount = 0;

    window.setInterval(() => {
        callCount += 1;
    }, 1000);
    vi.advanceTimersByTime(3000);

    assert.strictEqual(callCount, 3);
});

test('clears interval listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    let callCount = 0;

    const intervalId = window.setInterval(() => {
        callCount += 1;
    }, 1000);
    vi.advanceTimersByTime(1000);
    window.clearInterval(intervalId);
    vi.advanceTimersByTime(2000);

    assert.strictEqual(callCount, 1);
});
