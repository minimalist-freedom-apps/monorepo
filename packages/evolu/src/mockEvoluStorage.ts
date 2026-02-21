import { String as EvoluString, id, type StoreListener } from '@evolu/common';
import type { EvoluStorage } from './createEnsureEvoluStorage';

const TodoId = id('TodoId');

export const TodoTestSchema = {
    todo: {
        id: TodoId,
        value: EvoluString,
    },
};

export type TodoTestSchema = typeof TodoTestSchema;

export type TodoRow = {
    readonly id: string;
    readonly value: string;
};

export type MockEvoluStorage = EvoluStorage<TodoTestSchema> & {
    readonly emitUpdate: (nextRows: ReadonlyArray<TodoRow>) => void;
};

export const mockEvoluStorage = (initialRows: ReadonlyArray<TodoRow>): MockEvoluStorage => {
    let rows = initialRows;
    let onQueryChanged: (() => void) | undefined;

    return {
        evolu: {
            subscribeQuery: () => (listener: StoreListener) => {
                onQueryChanged = listener;

                return () => {
                    if (onQueryChanged === listener) {
                        onQueryChanged = undefined;
                    }
                };
            },
            getQueryRows: () => rows,
            loadQuery: () => Promise.resolve(rows),
        } as unknown as EvoluStorage<TodoTestSchema>['evolu'],

        activeOwner: { id: 'test-owner' } as EvoluStorage<TodoTestSchema>['activeOwner'],
        updateRelayUrls: async () => {},
        dispose: async () => {},

        emitUpdate: nextRows => {
            rows = nextRows;
            onQueryChanged?.();
        },
    };
};
