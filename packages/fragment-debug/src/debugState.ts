import type { Store } from '@minimalist-apps/mini-store';

export interface DebugState {
    readonly debugMode: boolean;
}

export type DebugStoreDep = {
    readonly store: Store<DebugState>;
};
