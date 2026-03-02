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
        // Destroy old appOwner
        const storage = await deps.ensureEvoluStorage();
        await storage.dispose();

        // Ensure new, after set new mnemonic
        deps.setEvoluMnemonic(mnemonic);
        await deps.ensureEvoluStorage();
    };
