import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { canRedo, canUndo, createUndoState, redo, undo, write } from './undo';

describe(undo.name, () => {
    test('supports undo and redo across multiple writes', () => {
        let state = createUndoState('A');

        state = write({ state, next: 'B' });
        state = write({ state, next: 'C' });

        assert.deepStrictEqual(state, {
            past: ['A', 'B'],
            present: 'C',
            future: [],
        });
        assert.strictEqual(canUndo({ state }), true);
        assert.strictEqual(canRedo({ state }), false);

        state = undo({ state });

        assert.deepStrictEqual(state, {
            past: ['A'],
            present: 'B',
            future: ['C'],
        });
        assert.strictEqual(canUndo({ state }), true);
        assert.strictEqual(canRedo({ state }), true);

        state = undo({ state });

        assert.deepStrictEqual(state, {
            past: [],
            present: 'A',
            future: ['B', 'C'],
        });
        assert.strictEqual(canUndo({ state }), false);
        assert.strictEqual(canRedo({ state }), true);

        state = redo({ state });

        assert.deepStrictEqual(state, {
            past: ['A'],
            present: 'B',
            future: ['C'],
        });
    });

    test('uses linear history and drops future after a new write', () => {
        let state = createUndoState(1);

        state = write({ state, next: 2 });
        state = write({ state, next: 3 });

        state = undo({ state });

        assert.deepStrictEqual(state, {
            past: [1],
            present: 2,
            future: [3],
        });

        state = write({ state, next: 99 });

        assert.deepStrictEqual(state, {
            past: [1, 2],
            present: 99,
            future: [],
        });
        assert.strictEqual(canRedo({ state }), false);
    });
});
