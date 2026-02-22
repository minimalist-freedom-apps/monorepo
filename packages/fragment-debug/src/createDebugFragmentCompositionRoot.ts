import type { Connect } from '@minimalist-apps/connect';
import { createSetDebugMode } from './createSetDebugMode';
import { type DebugHeaderDep, DebugHeaderPure } from './DebugHeader';
import { type DebugSettingsDep, DebugSettingsPure } from './DebugSettings';
import type { DebugState, DebugStoreDep } from './debugState';
import { selectDebugMode } from './selectDebugMode';

type DebugFragmentCompositionRootDeps = DebugStoreDep & {
    readonly connect: Connect<{ readonly store: DebugState }>;
};

export const createDebugFragmentCompositionRoot = (deps: DebugFragmentCompositionRootDeps) => {
    const setDebugMode = createSetDebugMode({ store: deps.store });

    const DebugSettings = deps.connect(
        DebugSettingsPure,
        ({ store }) => ({ debugMode: selectDebugMode(store) }),
        { setDebugMode },
    );

    const DebugHeader = deps.connect(DebugHeaderPure, ({ store }) => ({
        debugMode: selectDebugMode(store),
    }));

    return { DebugHeader, DebugSettings, setDebugMode };
};

export type DebugFragmentCompositionRootDep = DebugHeaderDep & DebugSettingsDep;
