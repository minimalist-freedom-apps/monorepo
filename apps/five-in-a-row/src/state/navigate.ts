import type { StoreDep } from './createStore';
import type { Screen } from './State';

export const createNavigate =
    (deps: StoreDep) =>
    (screen: Screen): void => {
        deps.store.setState({ currentScreen: screen });
    };
