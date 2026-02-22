import type { Mnemonic } from '@evolu/common';
import type { EvoluStoreDep } from './evoluState';

export type SetEvoluMnemonic = (mnemonic: Mnemonic) => void;

export type SetEvoluMnemonicDep = {
    readonly setEvoluMnemonic: SetEvoluMnemonic;
};

export const createSetEvoluMnemonic =
    (deps: EvoluStoreDep): SetEvoluMnemonic =>
    (evoluMnemonic): void => {
        deps.store.setState({ evoluMnemonic });
    };
