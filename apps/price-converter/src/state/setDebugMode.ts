import type { StoreDep } from './createStore';

export type SetDebugMode = (debugMode: boolean) => void;

export interface SetDebugModeDep {
    readonly setDebugMode: SetDebugMode;
}

export const createSetDebugMode =
    (deps: StoreDep): SetDebugMode =>
    debugMode =>
        deps.store.setState({ debugMode });
