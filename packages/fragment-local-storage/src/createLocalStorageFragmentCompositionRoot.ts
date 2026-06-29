import { createLocalStorage, type LocalStorage } from '@minimalist-apps/local-storage';
import type { Store } from '@minimalist-apps/mini-store';
import { typedObjectEntries } from '@minimalist-apps/type-utils';
import type { WindowServiceDep } from '@minimalist-apps/window';
import { createLocalStorageInit, type LocalStorageInitDep } from './createLocalStorageInit';

type Unsubscribe = () => void;

export type LoadInitialState = () => void;

export type PersistStore = () => Unsubscribe;

type StateStorageKey<State> = Extract<keyof State, string>;

export type MapStateLocalStorage<State> = Readonly<
    Partial<Record<StateStorageKey<State>, (state: State) => string | null>>
>;

export type MapLocalStorageToState<State> = Readonly<
    Partial<{
        [Key in StateStorageKey<State>]: (value: string) => State[Key] | undefined;
    }>
>;

export interface LocalStorageModule<State extends object> {
    readonly prefix: string;
    readonly store: Store<State>;
    readonly mapStateLocalStorage: MapStateLocalStorage<State>;
    readonly mapLocalStorageToState: MapLocalStorageToState<State>;
}

export interface LocalStorageFragmentCompositionRootDeps extends WindowServiceDep {
    readonly modules: ReadonlyArray<LocalStorageModule<object>>;
}

interface CreateStorageKeyProps {
    readonly prefix: string;
    readonly key: string;
}

const createStorageKey = ({ prefix, key }: CreateStorageKeyProps): string => `${prefix}:${key}`;

interface ApplyMapLocalStorageToStateProps<State> {
    readonly localStorage: LocalStorage;
    readonly prefix: string;
    readonly mapLocalStorageToState: MapLocalStorageToState<State>;
}

export const applyMapLocalStorageToState = <State>({
    localStorage,
    prefix,
    mapLocalStorageToState,
}: ApplyMapLocalStorageToStateProps<State>): Partial<State> => {
    const initialState: Partial<State> = {};

    for (const [key, map] of typedObjectEntries(mapLocalStorageToState)) {
        if (map === undefined) {
            continue;
        }

        const storageKey = createStorageKey({ prefix, key });
        const valueResult = localStorage.load<string>(storageKey);

        if (!valueResult.ok || valueResult.value === null) {
            continue;
        }

        const parsedValue = map(valueResult.value);

        if (parsedValue === undefined) {
            continue;
        }

        Object.assign(initialState, { [key]: parsedValue } as Partial<State>);
    }

    return initialState;
};

interface ApplyMapStateLocalStorageProps<State> {
    readonly localStorage: LocalStorage;
    readonly prefix: string;
    readonly mapStateLocalStorage: MapStateLocalStorage<State>;
    readonly state: State;
}

export const applyMapStateLocalStorage = <State>({
    localStorage,
    prefix,
    mapStateLocalStorage,
    state,
}: ApplyMapStateLocalStorageProps<State>): void => {
    for (const [key, map] of typedObjectEntries(mapStateLocalStorage)) {
        if (map === undefined) {
            continue;
        }

        const value = map(state);

        if (value === null) {
            continue;
        }

        const storageKey = createStorageKey({ prefix, key });

        localStorage.save(storageKey, value);
    }
};

export const createLocalStorageFragmentCompositionRoot = (
    deps: LocalStorageFragmentCompositionRootDeps,
): LocalStorageInitDep => {
    const localStorage = createLocalStorage();

    const loadInitialState: LoadInitialState = () => {
        for (const module of deps.modules) {
            const initialState = applyMapLocalStorageToState({
                localStorage,
                prefix: module.prefix,
                mapLocalStorageToState: module.mapLocalStorageToState,
            });

            module.store.setState(initialState);
        }
    };

    const persistStore: PersistStore = () => {
        const unsubscribers = deps.modules.map(module =>
            module.store.subscribe(() => {
                applyMapStateLocalStorage({
                    localStorage,
                    prefix: module.prefix,
                    mapStateLocalStorage: module.mapStateLocalStorage,
                    state: module.store.getState(),
                });
            }),
        );

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    };

    return {
        localStorageInit: createLocalStorageInit({
            loadInitialState,
            persistStore,
            window: deps.window,
        }),
    };
};
