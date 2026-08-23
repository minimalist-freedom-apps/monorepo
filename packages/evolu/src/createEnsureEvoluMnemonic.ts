import {
    createOwnerSecret,
    createRandomBytes,
    type Mnemonic,
    ownerSecretToMnemonic,
} from '@evolu/common';

interface EnsureEvoluMnemonicDeps {
    readonly loadSecureMnemonic: () => Promise<Mnemonic | null>;
    readonly persistMnemonic: (mnemonic: Mnemonic) => Promise<void>;
}

export type EnsureEvoluMnemonic = () => Promise<Mnemonic>;

export interface EnsureEvoluOwnerDep {
    readonly ensureEvoluOwner: EnsureEvoluMnemonic;
}

export const createEnsureEvoluMnemonic = (deps: EnsureEvoluMnemonicDeps): EnsureEvoluMnemonic => {
    let ensurePromise: Promise<Mnemonic> | null = null;

    const ensure = async (): Promise<Mnemonic> => {
        const secureMnemonic = await deps.loadSecureMnemonic();
        const mnemonic =
            secureMnemonic ??
            ownerSecretToMnemonic(createOwnerSecret({ randomBytes: createRandomBytes() }));

        await deps.persistMnemonic(mnemonic);

        return mnemonic;
    };

    return () => {
        ensurePromise ??= ensure().catch((error: unknown) => {
            ensurePromise = null;
            throw error;
        });

        return ensurePromise;
    };
};
