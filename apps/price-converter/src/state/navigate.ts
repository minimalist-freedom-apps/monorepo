import type { AppStoreDep } from './createAppStore';
import type { Screen } from './State';

export type Navigate = (screen: Screen) => void;

export interface NavigateDep {
    readonly navigate: Navigate;
}

export const createNavigate =
    (deps: AppStoreDep): Navigate =>
    screen =>
        deps.appStore.setState({ currentScreen: screen });
