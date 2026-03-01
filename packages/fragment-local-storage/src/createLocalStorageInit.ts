import type { WindowServiceDep } from '@minimalist-apps/window';
import type { LoadInitialState, PersistStore } from './createLocalStorageFragmentCompositionRoot';

export type LocalStorageInit = () => () => void;

export interface LocalStorageInitDep {
    readonly localStorageInit: LocalStorageInit;
}

/** @publicdep */
export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

/** @publicdep */
export interface PersistStoreDep {
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
