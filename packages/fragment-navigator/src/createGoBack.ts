import type { NavigatorStoreDep } from './navigatorState';

export type GoBack = () => void;

export interface GoBackDep {
    readonly goBack: GoBack;
}

type CreateGoBackDeps<Screen> = NavigatorStoreDep<Screen> & {
    readonly rootScreen: Screen;
};

export const createGoBack =
    <Screen>(deps: CreateGoBackDeps<Screen>): GoBack =>
    (): void => {
        deps.store.setState({ currentScreen: deps.rootScreen });
    };
