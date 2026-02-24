import type { Store } from '@minimalist-apps/mini-store';

export interface NavigatorState<Screen> {
    readonly currentScreen: Screen;
}

export type NavigatorStoreDep<Screen> = {
    readonly store: Store<NavigatorState<Screen>>;
};
