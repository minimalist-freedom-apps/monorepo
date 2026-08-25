import assert from 'node:assert/strict';
import { test } from 'node:test';

test('installs the shared browser and React test environment', () => {
    const react = Reflect.get(globalThis, 'React') as
        | {
              readonly createElement?: unknown;
              readonly Fragment?: unknown;
          }
        | undefined;

    assert.strictEqual(document.defaultView, window);
    assert.strictEqual(typeof ResizeObserver, 'function');
    assert.strictEqual(typeof navigator.locks.request, 'function');
    assert.strictEqual(typeof react?.createElement, 'function');
    assert.notStrictEqual(react?.Fragment, undefined);
});
