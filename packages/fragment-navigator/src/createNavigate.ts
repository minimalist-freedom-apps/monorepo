import type { Navigate } from '@minimalist-apps/navigator';
import type { NavigatorStoreDep } from './navigatorState';

export const createNavigate =
    <Screen>(deps: NavigatorStoreDep<Screen>): Navigate<Screen> =>
    (screen): void => {
        deps.store.setState({ currentScreen: screen });
    };
