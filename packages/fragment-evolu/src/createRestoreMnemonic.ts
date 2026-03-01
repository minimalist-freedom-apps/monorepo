import type { EvoluSchema, Mnemonic, Owner } from '@evolu/common';
import type { EnsureEvoluStorageDep } from '@minimalist-apps/evolu';
import type { SetEvoluMnemonicDep } from './createSetEvoluMnemonic';

type RestoreMnemonicDeps<S extends EvoluSchema> = SetEvoluMnemonicDep &
    EnsureEvoluStorageDep<S> & {
        readonly onOwnerUsed: (owner: Owner) => void;
    };

export type RestoreMnemonic = (mnemonic: Mnemonic) => Promise<void>;

export type RestoreMnemonicDep = {
    readonly restoreMnemonic: RestoreMnemonic;
};

export const createRestoreMnemonic =
    <S extends EvoluSchema>(deps: RestoreMnemonicDeps<S>): RestoreMnemonic =>
    async mnemonic => {
        const storage = await deps.ensureEvoluStorage();

        // Must happen before reload
        deps.setEvoluMnemonic(mnemonic);
        deps.onOwnerUsed(await storage.evolu.appOwner);

        // Evolu has issues with resource dispose, so we need to reload
        await storage.evolu.restoreAppOwner(mnemonic, { reload: true });
    };
