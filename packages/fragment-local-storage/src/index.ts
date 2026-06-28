export {
    type CombinedLocalStorageState,
    type CombineLocalStorageProps,
    combineLocalStorageToState,
    combineStateLocalStorage,
    createCombinedLocalStorageStore,
    createLocalStorageModule,
    type LocalStorageModule,
    type LocalStorageModuleProps,
} from './combineLocalStorage';
export {
    // useful for testing
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
    type CombinedLocalStorageFragmentCompositionRootDeps,
    createLocalStorageFragmentCompositionRoot,
    type LoadInitialState,
    type LocalStorageFragmentCompositionRootDeps,
    type MapLocalStorageToState,
    type MapStateLocalStorage,
    type SingleLocalStorageFragmentCompositionRootDeps,
} from './createLocalStorageFragmentCompositionRoot';
export type { LocalStorageInit, LocalStorageInitDep } from './createLocalStorageInit';
