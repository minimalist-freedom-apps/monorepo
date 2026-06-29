import { createStore } from '@minimalist-apps/mini-store';
import { typedObjectEntries } from '@minimalist-apps/type-utils';
import { describe, expect, test } from 'vitest';
import {
    createLocalStorageFragmentCompositionRoot,
    type MapLocalStorageToState,
    type MapStateLocalStorage,
} from '.';

interface TestState {
    readonly name: string;
    readonly age: number;
    readonly tags: Record<string, string>;
}

interface TestSettingsState {
    readonly theme: string;
}

interface CreateTestStateFragmentProps {
    readonly initialState?: TestState;
    readonly initialLocalStorageValues?: Readonly<Record<string, string | null>>;
}

interface CreateTestCombinedStateFragmentProps {
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

const settingsStateLocalStorageMap: MapStateLocalStorage<TestSettingsState> = {
    theme: state => state.theme,
};

const settingsLocalStorageStateMap: MapLocalStorageToState<TestSettingsState> = {
    theme: value => value,
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
        modules: [
            {
                prefix: 'test-app',
                store,
                mapStateLocalStorage: stateLocalStorageMap,
                mapLocalStorageToState: localStorageStateMap,
            },
        ],
        window: {
            addEventListener: () => () => {},
            setTimeout: () => 0,
            clearTimeout: () => {},
            setInterval: () => 0,
            clearInterval: () => {},
        },
    });

    return { localStorageInit, store };
};

const createTestCombinedStateFragment = ({
    initialLocalStorageValues = {},
}: CreateTestCombinedStateFragmentProps = {}) => {
    const store = createStore<TestState>({
        name: 'Unknown',
        age: 0,
        tags: {},
    });
    const settingsStore = createStore<TestSettingsState>({
        theme: 'light',
    });
    globalThis.localStorage.clear();

    for (const [key, value] of typedObjectEntries(initialLocalStorageValues)) {
        if (value !== null) {
            globalThis.localStorage.setItem(key, JSON.stringify(value));
        }
    }

    const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
        modules: [
            {
                prefix: 'test-profile',
                store,
                mapStateLocalStorage: stateLocalStorageMap,
                mapLocalStorageToState: localStorageStateMap,
            },
            {
                prefix: 'test-settings',
                store: settingsStore,
                mapStateLocalStorage: settingsStateLocalStorageMap,
                mapLocalStorageToState: settingsLocalStorageStateMap,
            },
        ],
        window: {
            addEventListener: () => () => {},
            setTimeout: () => 0,
            clearTimeout: () => {},
            setInterval: () => 0,
            clearInterval: () => {},
        },
    });

    return { localStorageInit, settingsStore, store };
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

        expect(globalThis.localStorage.getItem('test-app:name')).toBe(JSON.stringify('Bob'));
        expect(globalThis.localStorage.getItem('test-app:age')).toBe(JSON.stringify('42'));
        expect(globalThis.localStorage.getItem('test-app:tags')).toBe(
            JSON.stringify(JSON.stringify({ team: 'core' })),
        );

        stop();
    });

    test('loads combined module state from a single local-storage fragment', () => {
        const { localStorageInit, settingsStore, store } = createTestCombinedStateFragment({
            initialLocalStorageValues: {
                'test-profile:name': 'Alice',
                'test-profile:age': '31',
                'test-profile:tags': JSON.stringify({ role: 'admin' }),
                'test-settings:theme': 'dark',
            },
        });

        const stop = localStorageInit();

        expect(store.getState()).toEqual({
            name: 'Alice',
            age: 31,
            tags: { role: 'admin' },
        });
        expect(settingsStore.getState()).toEqual({
            theme: 'dark',
        });

        stop();
    });

    test('persists combined module state through a single local-storage fragment', () => {
        const { localStorageInit, settingsStore, store } = createTestCombinedStateFragment();

        const stop = localStorageInit();

        store.setState({
            name: 'Bob',
            age: 42,
            tags: { team: 'core' },
        });
        settingsStore.setState({
            theme: 'dark',
        });

        expect(globalThis.localStorage.getItem('test-profile:name')).toBe(JSON.stringify('Bob'));
        expect(globalThis.localStorage.getItem('test-profile:age')).toBe(JSON.stringify('42'));
        expect(globalThis.localStorage.getItem('test-profile:tags')).toBe(
            JSON.stringify(JSON.stringify({ team: 'core' })),
        );
        expect(globalThis.localStorage.getItem('test-settings:theme')).toBe(JSON.stringify('dark'));

        stop();
    });
});
