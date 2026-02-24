import type { GoBack } from '@minimalist-apps/navigator';
import type { NavigatorStoreDep } from './navigatorState';

type CreateGoBackDeps<Screen> = NavigatorStoreDep<Screen> & {
    readonly rootScreen: Screen;
};

export const createGoBack =
    <Screen>(deps: CreateGoBackDeps<Screen>): GoBack =>
    (): void => {
        deps.store.setState({ currentScreen: deps.rootScreen });
    };
