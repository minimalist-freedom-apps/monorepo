import { describe, expect, test } from 'vitest';
import { canRedo, canUndo, createUndoState, redo, undo, write } from './undo';

describe(undo.name, () => {
    test('supports undo and redo across multiple writes', () => {
        let state = createUndoState('A');

        state = write({ state, next: 'B' });
        state = write({ state, next: 'C' });

        expect(state).toEqual({
            past: ['A', 'B'],
            present: 'C',
            future: [],
        });
        expect(canUndo({ state })).toBe(true);
        expect(canRedo({ state })).toBe(false);

        state = undo({ state });

        expect(state).toEqual({
            past: ['A'],
            present: 'B',
            future: ['C'],
        });
        expect(canUndo({ state })).toBe(true);
        expect(canRedo({ state })).toBe(true);

        state = undo({ state });

        expect(state).toEqual({
            past: [],
            present: 'A',
            future: ['B', 'C'],
        });
        expect(canUndo({ state })).toBe(false);
        expect(canRedo({ state })).toBe(true);

        state = redo({ state });

        expect(state).toEqual({
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

        expect(state).toEqual({
            past: [1],
            present: 2,
            future: [3],
        });

        state = write({ state, next: 99 });

        expect(state).toEqual({
            past: [1, 2],
            present: 99,
            future: [],
        });
        expect(canRedo({ state })).toBe(false);
    });
});
