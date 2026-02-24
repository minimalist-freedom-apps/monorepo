import type { NavigatorStoreDep } from './navigatorState';

export type Navigate<Screen> = (screen: Screen) => void;

export interface NavigateDep<Screen> {
    readonly navigate: Navigate<Screen>;
}

export const createNavigate =
    <Screen>(deps: NavigatorStoreDep<Screen>): Navigate<Screen> =>
    (screen): void => {
        deps.store.setState({ currentScreen: screen });
    };
