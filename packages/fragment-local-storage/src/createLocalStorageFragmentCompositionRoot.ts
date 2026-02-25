import { createLocalStorage } from '@minimalist-apps/local-storage';
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

export interface LocalStorageFragmentCompositionRootDeps<State> extends WindowServiceDep {
    readonly store: Store<State>;
    readonly prefix: string;
    readonly mapStateLocalStorage: MapStateLocalStorage<State>;
    readonly mapLocalStorageToState: MapLocalStorageToState<State>;
}

interface CreateStorageKeyProps {
    readonly prefix: string;
    readonly key: string;
}

const createStorageKey = ({ prefix, key }: CreateStorageKeyProps): string => `${prefix}:${key}`;

export const createLocalStorageFragmentCompositionRoot = <State>(
    deps: LocalStorageFragmentCompositionRootDeps<State>,
): LocalStorageInitDep => {
    const localStorage = createLocalStorage();

    const loadInitialState: LoadInitialState = () => {
        const initialState: Partial<State> = {};

        for (const [key, map] of typedObjectEntries(deps.mapLocalStorageToState)) {
            if (map === undefined) {
                continue;
            }

            const storageKey = createStorageKey({ prefix: deps.prefix, key });
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

        deps.store.setState(initialState);
    };

    const persistStore: PersistStore = () => {
        const unsubscribe = deps.store.subscribe(() => {
            const state = deps.store.getState();

            for (const [key, map] of typedObjectEntries(deps.mapStateLocalStorage)) {
                if (map === undefined) {
                    continue;
                }

                const value = map(state);

                if (value === null) {
                    continue;
                }

                const storageKey = createStorageKey({ prefix: deps.prefix, key });

                localStorage.save(storageKey, value);
            }
        });

        return unsubscribe;
    };

    return {
        localStorageInit: createLocalStorageInit({
            loadInitialState,
            persistStore,
            window: deps.window,
        }),
    };
};
