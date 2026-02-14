import {
    createOwnerSecret,
    createRandomBytes,
    type Mnemonic,
    ownerSecretToMnemonic,
} from '@evolu/common';

interface EnsureEvoluMnemonicDeps {
    readonly getPersistedMnemonic: () => Mnemonic | null;
    readonly persistMnemonic: (mnemonic: Mnemonic) => void;
}

export type EnsureEvoluMnemonic = () => Mnemonic;

export interface EnsureEvoluOwnerDep {
    readonly ensureEvoluOwner: EnsureEvoluMnemonic;
}

export const createEnsureEvoluMnemonic =
    (deps: EnsureEvoluMnemonicDeps): EnsureEvoluMnemonic =>
    () => {
        let mnemonic = deps.getPersistedMnemonic();

        if (mnemonic === null) {
            const randomBytes = createRandomBytes();
            const ownerSecret = createOwnerSecret({ randomBytes });
            const newMnemonic = ownerSecretToMnemonic(ownerSecret);
            mnemonic = newMnemonic;

            deps.persistMnemonic(mnemonic);
        }

        return mnemonic;
    };
