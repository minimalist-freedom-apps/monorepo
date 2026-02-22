import type { EvoluSchema, Owner } from '@evolu/common';
import type { Connect } from '@minimalist-apps/connect';
import type { EnsureEvoluStorageDep } from '@minimalist-apps/evolu';
import { type BackupMnemonicDep, BackupMnemonic as BackupMnemonicPure } from './BackupMnemonic';
import { createRestoreMnemonic } from './createRestoreMnemonic';
import { createSetEvoluMnemonic } from './createSetEvoluMnemonic';
import type { EvoluState, EvoluStoreDep } from './evoluState';
import { type RestoreMnemonicDep, RestoreMnemonic as RestoreMnemonicPure } from './RestoreMnemonic';
import { selectEvoluMnemonic } from './selectEvoluMnemonic';

type EvoluFragmentCompositionRootDeps<
    State extends EvoluState,
    Schema extends EvoluSchema,
> = EvoluStoreDep<State> &
    EnsureEvoluStorageDep<Schema> & {
        readonly connect: Connect<{ readonly store: State }>;
        readonly onOwnerUsed: (owner: Owner) => void;
    };

export const createEvoluFragmentCompositionRoot = <
    Schema extends EvoluSchema,
    State extends EvoluState,
>(
    deps: EvoluFragmentCompositionRootDeps<State, Schema>,
): BackupMnemonicDep & RestoreMnemonicDep => {
    const setEvoluMnemonic = createSetEvoluMnemonic({ store: deps.store });

    const restoreMnemonic = createRestoreMnemonic({
        setEvoluMnemonic,
        ensureEvoluStorage: deps.ensureEvoluStorage,
        onOwnerUsed: deps.onOwnerUsed,
    });

    const BackupMnemonic = deps.connect(BackupMnemonicPure, ({ store }) => ({
        evoluMnemonic: selectEvoluMnemonic(store),
    }));

    const RestoreMnemonic = deps.connect(RestoreMnemonicPure, () => ({}), {
        restoreMnemonic,
    });

    return { BackupMnemonic, RestoreMnemonic };
};
