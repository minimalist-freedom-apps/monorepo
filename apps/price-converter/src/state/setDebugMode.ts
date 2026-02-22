import type { AppStoreDep } from './createAppStore';

export type SetDebugMode = (debugMode: boolean) => void;

export interface SetDebugModeDep {
    readonly setDebugMode: SetDebugMode;
}

export const createSetDebugMode =
    (deps: AppStoreDep): SetDebugMode =>
    debugMode =>
        deps.appStore.setState({ debugMode });
