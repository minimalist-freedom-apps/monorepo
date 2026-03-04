import type { EvoluSchema } from '@evolu/common';
import type { ValidateSchema } from '@evolu/common/local-first';
import type { Connect } from '@minimalist-apps/connect';
import {
    createEnsureEvoluMnemonic,
    createEvoluCompositionRoot,
    type EnsureEvoluStorageDep,
} from '@minimalist-apps/evolu';
import { toGetter } from '@minimalist-apps/mini-store';
import { type BackupMnemonicDep, BackupMnemonic as BackupMnemonicPure } from './BackupMnemonic';
import {
    createRestoreMnemonic,
    type RestoreMnemonicDep as RestoreMnemonicServiceDep,
} from './createRestoreMnemonic';
import { createSetActiveOwnerAppId } from './createSetActiveOwnerAppId';
import { createSetEvoluMnemonic } from './createSetEvoluMnemonic';
import type { EvoluState, EvoluStoreDep } from './evoluState';
import { type RestoreMnemonicDep, RestoreMnemonic as RestoreMnemonicPure } from './RestoreMnemonic';
import { selectEvoluMnemonic } from './selectEvoluMnemonic';

type EvoluFragmentCompositionRootDeps<Schema extends EvoluSchema> = EvoluStoreDep & {
    readonly connect: Connect<{ readonly store: EvoluState }>;
    readonly schema: ValidateSchema<Schema> extends never ? Schema : ValidateSchema<Schema>;
    readonly appName: string;
};

export type EvoluFragment<Schema extends EvoluSchema> = BackupMnemonicDep &
    RestoreMnemonicDep &
    RestoreMnemonicServiceDep &
    EnsureEvoluStorageDep<Schema>;

export const createEvoluFragmentCompositionRoot = <Schema extends EvoluSchema>(
    deps: EvoluFragmentCompositionRootDeps<Schema>,
): EvoluFragment<Schema> => {
    const setEvoluMnemonic = createSetEvoluMnemonic({ store: deps.store });
    const setActiveOwnerAppId = createSetActiveOwnerAppId({ store: deps.store });

    const getPersistedMnemonic = toGetter(deps.store.getState, selectEvoluMnemonic);

    const ensureEvoluOwner = createEnsureEvoluMnemonic({
        getPersistedMnemonic,
        persistMnemonic: setEvoluMnemonic,
    });

    const { ensureEvoluStorage } = createEvoluCompositionRoot<Schema>({
        ensureEvoluOwner,
        onOwnerUsed: owner => setActiveOwnerAppId(owner.id),
        schema: deps.schema,
        appName: deps.appName,
    });

    const restoreMnemonic = createRestoreMnemonic({
        setEvoluMnemonic,
        ensureEvoluStorage,
    });

    const BackupMnemonic = deps.connect(
        BackupMnemonicPure,
        ({ store }) => ({
            evoluMnemonic: selectEvoluMnemonic(store),
        }),
        {
            ensureEvoluOwner,
        },
    );

    const RestoreMnemonic = deps.connect(RestoreMnemonicPure, () => ({}), {
        restoreMnemonic,
    });

    return { BackupMnemonic, RestoreMnemonic, restoreMnemonic, ensureEvoluStorage };
};
