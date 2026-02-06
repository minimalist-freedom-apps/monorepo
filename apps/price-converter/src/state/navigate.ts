import type { StoreDep } from './createStore';
import type { Screen } from './State';

export type Navigate = (screen: Screen) => void;

export interface NavigateDep {
    readonly navigate: Navigate;
}

export const createNavigate =
    (deps: StoreDep): Navigate =>
    screen =>
        deps.store.setState({ currentScreen: screen });
