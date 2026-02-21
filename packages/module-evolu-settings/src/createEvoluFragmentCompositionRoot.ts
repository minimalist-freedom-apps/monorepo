import type { Mnemonic } from '@evolu/common';
import type { Connect } from '@minimalist-apps/connect';
import { type BackupMnemonicDep, BackupMnemonic as BackupMnemonicPure } from './BackupMnemonic';
import { createSetEvoluMnemonic } from './createSetEvoluMnemonic';
import type { EvoluState, EvoluStoreDep } from './evoluState';
import { type RestoreMnemonicDep, RestoreMnemonic as RestoreMnemonicPure } from './RestoreMnemonic';
import { selectEvoluMnemonic } from './selectEvoluMnemonic';

type EvoluFragmentCompositionRootDeps<State extends EvoluState> = EvoluStoreDep<State> & {
    readonly connect: Connect<{ readonly store: State }>;
};

export const createEvoluFragmentCompositionRoot = <State extends EvoluState>(
    deps: EvoluFragmentCompositionRootDeps<State>,
): BackupMnemonicDep & RestoreMnemonicDep => {
    const setEvoluMnemonic = createSetEvoluMnemonic({ store: deps.store });

    const restoreMnemonic = (mnemonic: Mnemonic) => {
        setEvoluMnemonic(mnemonic);
    };

    const BackupMnemonic = deps.connect(BackupMnemonicPure, ({ store }) => ({
        evoluMnemonic: selectEvoluMnemonic(store),
    }));

    const RestoreMnemonic = deps.connect(RestoreMnemonicPure, () => ({}), {
        restoreMnemonic,
    });

    return { BackupMnemonic, RestoreMnemonic };
};
