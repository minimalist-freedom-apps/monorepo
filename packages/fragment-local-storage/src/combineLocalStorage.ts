import type { Store } from '@minimalist-apps/mini-store';
import {
    typedObjectEntries,
    typedObjectFromEntries,
    typedObjectKeys,
} from '@minimalist-apps/type-utils';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from './createLocalStorageFragmentCompositionRoot';

export type CombinedLocalStorageState = Readonly<Record<string, unknown>>;

export interface LocalStorageModuleProps<State extends object> {
    readonly key: string;
    readonly store: Store<State>;
    readonly mapStateLocalStorage: MapStateLocalStorage<State>;
    readonly mapLocalStorageToState: MapLocalStorageToState<State>;
}

export interface LocalStorageModule {
    readonly key: string;
    readonly store: Store<object>;
    readonly mapStateLocalStorage: MapStateLocalStorage<object>;
    readonly mapLocalStorageToState: MapLocalStorageToState<object>;
}

export interface CombineLocalStorageProps {
    readonly modules: ReadonlyArray<LocalStorageModule>;
}

interface CombinedKeyProps {
    readonly moduleKey: string;
    readonly stateKey: string;
}

interface SplitCombinedKeyProps {
    readonly moduleKey: string;
    readonly key: string;
}

const createCombinedKey = ({ moduleKey, stateKey }: CombinedKeyProps): string =>
    `${moduleKey}.${stateKey}`;

const splitCombinedKey = ({ moduleKey, key }: SplitCombinedKeyProps): string =>
    key.slice(moduleKey.length + 1);

export const createLocalStorageModule = <State extends object>({
    key,
    store,
    mapStateLocalStorage,
    mapLocalStorageToState,
}: LocalStorageModuleProps<State>): LocalStorageModule => ({
    key,
    store: store as Store<object>,
    mapStateLocalStorage: mapStateLocalStorage as MapStateLocalStorage<object>,
    mapLocalStorageToState: mapLocalStorageToState as MapLocalStorageToState<object>,
});

export const combineStateLocalStorage = ({
    modules,
}: CombineLocalStorageProps): MapStateLocalStorage<CombinedLocalStorageState> =>
    typedObjectFromEntries(
        modules.flatMap(module =>
            typedObjectEntries(module.mapStateLocalStorage).map(([stateKey, map]) => {
                const mapState = map as ((state: object) => string | null) | undefined;

                return [
                    createCombinedKey({ moduleKey: module.key, stateKey }),
                    () => (mapState === undefined ? null : mapState(module.store.getState())),
                ];
            }),
        ),
    );

export const combineLocalStorageToState = ({
    modules,
}: CombineLocalStorageProps): MapLocalStorageToState<CombinedLocalStorageState> =>
    typedObjectFromEntries(
        modules.flatMap(module =>
            typedObjectEntries(module.mapLocalStorageToState).map(([stateKey, map]) => {
                const mapLocalStorage = map as ((value: string) => unknown) | undefined;

                return [
                    createCombinedKey({ moduleKey: module.key, stateKey }),
                    (value: string) =>
                        mapLocalStorage === undefined ? undefined : mapLocalStorage(value),
                ];
            }),
        ),
    );

export const createCombinedLocalStorageStore = ({
    modules,
}: CombineLocalStorageProps): Store<CombinedLocalStorageState> => ({
    getState: () => ({}),
    setState: partialState => {
        for (const module of modules) {
            const modulePartialState = typedObjectFromEntries(
                typedObjectEntries(partialState)
                    .filter(([key]) => key.startsWith(`${module.key}.`))
                    .map(([key, value]) => [
                        splitCombinedKey({ moduleKey: module.key, key }),
                        value,
                    ]),
            );

            if (typedObjectKeys(modulePartialState).length > 0) {
                module.store.setState(modulePartialState);
            }
        }
    },
    subscribe: listener => {
        const unsubscribers = modules.map(module => module.store.subscribe(listener));

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    },
});
