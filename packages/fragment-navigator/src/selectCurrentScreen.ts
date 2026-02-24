import type { NavigatorState } from './navigatorState';

export const selectCurrentScreen = <Screen>(state: NavigatorState<Screen>): Screen =>
    state.currentScreen;
