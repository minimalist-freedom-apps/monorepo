import type { DebugStoreDep } from './debugState';

export type SetDebugMode = (debugMode: boolean) => void;

export interface SetDebugModeDep {
    readonly setDebugMode: SetDebugMode;
}

export const createSetDebugMode =
    (deps: DebugStoreDep): SetDebugMode =>
    (debugMode): void => {
        deps.store.setState({ debugMode });
    };
