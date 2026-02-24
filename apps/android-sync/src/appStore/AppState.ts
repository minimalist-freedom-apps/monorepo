import type { OwnerId } from '@evolu/common';
import type { DebugState } from '@minimalist-apps/fragment-debug';
import type { EvoluState } from '@minimalist-apps/fragment-evolu';
import type { NavigatorState } from '@minimalist-apps/fragment-navigator';
import type { ThemeState } from '@minimalist-apps/fragment-theme';

export type Screen = 'Home' | 'Settings';

export interface AppState extends ThemeState, EvoluState, DebugState, NavigatorState<Screen> {
    readonly activeOwnerId: OwnerId | null;
}
