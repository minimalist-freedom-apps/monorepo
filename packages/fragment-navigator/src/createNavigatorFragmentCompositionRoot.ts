import type { GoBackDep, NavigateDep } from '@minimalist-apps/navigator';
import { createGoBack } from './createGoBack';
import { createNavigate } from './createNavigate';
import type { NavigatorStoreDep } from './navigatorState';

export type NavigatorFragmentCompositionRootDeps<Screen> = NavigatorStoreDep<Screen> & {
    readonly rootScreen: Screen;
};

export const createNavigatorFragmentCompositionRoot = <Screen>(
    deps: NavigatorFragmentCompositionRootDeps<Screen>,
): GoBackDep & NavigateDep<Screen> => {
    const navigate = createNavigate<Screen>({ store: deps.store });
    const goBack = createGoBack<Screen>({ store: deps.store, rootScreen: deps.rootScreen });

    return { goBack, navigate };
};
