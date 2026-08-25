import assert from 'node:assert/strict';
import { test } from 'node:test';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

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

test('renders a component into the shared document', () => {
    render(createElement('div', { 'data-testid': 'cleanup-target' }));

    assert.strictEqual(screen.getByTestId('cleanup-target').tagName, 'DIV');
});

test('cleans the shared document after each test', () => {
    assert.strictEqual(screen.queryByTestId('cleanup-target'), null);
});
