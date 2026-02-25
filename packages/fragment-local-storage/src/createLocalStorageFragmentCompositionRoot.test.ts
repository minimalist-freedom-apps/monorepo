import { createStore } from '@minimalist-apps/mini-store';
import { typedObjectEntries } from '@minimalist-apps/type-utils';
import { describe, expect, test } from 'vitest';
import {
    createLocalStorageFragmentCompositionRoot,
    type MapLocalStorageToState,
    type MapStateLocalStorage,
} from './createLocalStorageFragmentCompositionRoot';

interface TestState {
    readonly name: string;
    readonly age: number;
    readonly tags: Record<string, string>;
}

interface CreateTestStateFragmentProps {
    readonly initialState?: TestState;
    readonly initialLocalStorageValues?: Readonly<Record<string, string | null>>;
}

const stateLocalStorageMap: MapStateLocalStorage<TestState> = {
    name: state => state.name,
    age: state => String(state.age),
    tags: state => JSON.stringify(state.tags),
};

const localStorageStateMap: MapLocalStorageToState<TestState> = {
    name: value => value,
    age: value => Number(value),
    tags: value => JSON.parse(value) as TestState['tags'],
};

const createTestStateFragment = ({
    initialState = {
        name: 'Unknown',
        age: 0,
        tags: {},
    },
    initialLocalStorageValues = {},
}: CreateTestStateFragmentProps = {}) => {
    const store = createStore(initialState);
    globalThis.localStorage.clear();

    for (const [key, value] of typedObjectEntries(initialLocalStorageValues)) {
        if (value !== null) {
            globalThis.localStorage.setItem(key, JSON.stringify(value));
        }
    }

    const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
        store,
        prefix: 'test-app',
        mapStateLocalStorage: stateLocalStorageMap,
        mapLocalStorageToState: localStorageStateMap,
        window: {
            addEventListener: () => () => {},
        },
    });

    return { localStorageInit, store };
};

describe(createLocalStorageFragmentCompositionRoot.name, () => {
    test('loads persisted values as a single partial state update', () => {
        const { localStorageInit, store } = createTestStateFragment({
            initialLocalStorageValues: {
                'test-app:name': 'Alice',
                'test-app:age': '31',
                'test-app:tags': JSON.stringify({ role: 'admin' }),
            },
        });

        const stop = localStorageInit();

        expect(store.getState()).toEqual({
            name: 'Alice',
            age: 31,
            tags: { role: 'admin' },
        });

        stop();
    });

    test('persists mapped state using prefixed state keys', () => {
        const { localStorageInit, store } = createTestStateFragment();

        const stop = localStorageInit();

        store.setState({
            name: 'Bob',
            age: 42,
            tags: { team: 'core' },
        });

        expect(globalThis.localStorage.getItem('test-app:name')).toBe('Bob');
        expect(globalThis.localStorage.getItem('test-app:age')).toBe('42');
        expect(globalThis.localStorage.getItem('test-app:tags')).toBe(
            JSON.stringify({ team: 'core' }),
        );

        stop();
    });
});
