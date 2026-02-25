import type { WindowServiceDep } from '@minimalist-apps/window';
import type { LoadInitialState, PersistStore } from './createLocalStorageFragmentCompositionRoot';

export type LocalStorageInit = () => () => void;

export interface LocalStorageInitDep {
    readonly localStorageInit: LocalStorageInit;
}

interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

interface PersistStoreDep {
    readonly persistStore: PersistStore;
}

type CreateLocalStorageInitDeps = LoadInitialStateDep & PersistStoreDep & WindowServiceDep;

export const createLocalStorageInit =
    (deps: CreateLocalStorageInitDeps): LocalStorageInit =>
    () => {
        deps.loadInitialState();

        const unsubscribe = deps.persistStore();

        const removeBeforeUnloadListener = deps.window.addEventListener(
            'beforeunload',
            unsubscribe,
        );

        return () => {
            removeBeforeUnloadListener();
            unsubscribe();
        };
    };
