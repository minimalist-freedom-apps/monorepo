import type { Mnemonic } from '@evolu/common';
import type { EvoluMnemonicStorageDep } from './createEvoluMnemonicStorage';
import type { EvoluStoreDep } from './evoluState';

export type SetEvoluMnemonic = (mnemonic: Mnemonic) => Promise<void>;

export type SetEvoluMnemonicDep = {
    readonly setEvoluMnemonic: SetEvoluMnemonic;
};

export const createSetEvoluMnemonic =
    (deps: EvoluStoreDep & EvoluMnemonicStorageDep): SetEvoluMnemonic =>
    async evoluMnemonic => {
        await deps.evoluMnemonicStorage.save(evoluMnemonic);
        deps.store.setState({ evoluMnemonic });
    };
