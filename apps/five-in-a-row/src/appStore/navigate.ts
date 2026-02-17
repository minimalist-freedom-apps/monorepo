import type { Screen } from './AppState';
import type { AppStoreDep } from './createAppStore';

export const createNavigate =
    (deps: AppStoreDep) =>
    (screen: Screen): void => {
        deps.store.setState({ currentScreen: screen });
    };
