import type { EvoluSchema, Mnemonic } from '@evolu/common';
import type { EnsureEvoluStorageDep } from '@minimalist-apps/evolu';
import type { SetEvoluMnemonicDep } from './createSetEvoluMnemonic';

type RestoreMnemonicDeps<S extends EvoluSchema> = SetEvoluMnemonicDep & EnsureEvoluStorageDep<S>;

export type RestoreMnemonic = (mnemonic: Mnemonic) => Promise<void>;

export type RestoreMnemonicDep = {
    readonly restoreMnemonic: RestoreMnemonic;
};

export const createRestoreMnemonic =
    <S extends EvoluSchema>(deps: RestoreMnemonicDeps<S>): RestoreMnemonic =>
    async mnemonic => {
        const storage = await deps.ensureEvoluStorage();
        deps.setEvoluMnemonic(mnemonic);
        await storage.restoreOwner(mnemonic);
    };
