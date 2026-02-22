import type { OwnerId } from '@evolu/common';
import type { DebugState } from '@minimalist-apps/fragment-debug';
import type { EvoluState } from '@minimalist-apps/fragment-evolu';
import type { ThemeState } from '@minimalist-apps/fragment-theme';

export type Screen = 'Chat' | 'Settings';

export interface AppState extends ThemeState, EvoluState, DebugState {
    readonly currentScreen: Screen;
    readonly activeOwnerId: OwnerId | null;
}

export const selectCurrentScreen = (state: AppState): Screen => state.currentScreen;
