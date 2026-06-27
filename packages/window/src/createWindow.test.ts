import { afterEach, expect, test, vi } from 'vitest';

import { createWindow } from './index.js';

afterEach(() => {
    vi.useRealTimers();
});

test('runs timeout listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    const listener = vi.fn();

    window.setTimeout(listener, 1000);
    vi.advanceTimersByTime(1000);

    expect(listener).toHaveBeenCalledOnce();
});

test('clears timeout listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    const listener = vi.fn();

    const timeoutId = window.setTimeout(listener, 1000);
    window.clearTimeout(timeoutId);
    vi.advanceTimersByTime(1000);

    expect(listener).not.toHaveBeenCalled();
});

test('runs interval listener repeatedly', () => {
    vi.useFakeTimers();
    const window = createWindow();
    const listener = vi.fn();

    window.setInterval(listener, 1000);
    vi.advanceTimersByTime(3000);

    expect(listener).toHaveBeenCalledTimes(3);
});

test('clears interval listener', () => {
    vi.useFakeTimers();
    const window = createWindow();
    const listener = vi.fn();

    const intervalId = window.setInterval(listener, 1000);
    vi.advanceTimersByTime(1000);
    window.clearInterval(intervalId);
    vi.advanceTimersByTime(2000);

    expect(listener).toHaveBeenCalledOnce();
});
