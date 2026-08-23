import { Mnemonic } from '@evolu/common';
import type { SecureStorageDep } from '@minimalist-apps/secure-storage';

const evoluMnemonicKey = 'evoluMnemonic';

export interface EvoluMnemonicStorage {
    readonly load: () => Promise<Mnemonic | null>;
    readonly save: (mnemonic: Mnemonic) => Promise<void>;
}

export interface EvoluMnemonicStorageDep {
    readonly evoluMnemonicStorage: EvoluMnemonicStorage;
}

export const createEvoluMnemonicStorage = (deps: SecureStorageDep): EvoluMnemonicStorage => ({
    load: async () => {
        const value = await deps.secureStorage.load({ key: evoluMnemonicKey });

        if (value === null) {
            return null;
        }

        const mnemonic = Mnemonic.fromUnknown(value);

        if (mnemonic.ok === false) {
            throw new Error('Invalid Evolu mnemonic in secure storage', {
                cause: mnemonic.error,
            });
        }

        return mnemonic.value;
    },
    save: mnemonic =>
        deps.secureStorage.save({
            key: evoluMnemonicKey,
            value: mnemonic,
        }),
});
