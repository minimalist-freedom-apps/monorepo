import type { NavigatorState } from '@minimalist-apps/fragment-navigator';
import type { ThemeState } from '@minimalist-apps/fragment-theme';

export type NavigatorScreen = 'Game' | 'Settings';

export interface AppState extends ThemeState, NavigatorState<NavigatorScreen> {}
