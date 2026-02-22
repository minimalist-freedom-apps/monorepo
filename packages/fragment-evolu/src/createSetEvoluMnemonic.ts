import type { Mnemonic } from '@evolu/common';
import type { EvoluState, EvoluStoreDep } from './evoluState';

export type SetEvoluMnemonic = (mnemonic: Mnemonic) => void;

export type SetEvoluMnemonicDep = {
    readonly setEvoluMnemonic: SetEvoluMnemonic;
};

export const createSetEvoluMnemonic =
    <State extends EvoluState>(deps: EvoluStoreDep<State>): SetEvoluMnemonic =>
    (evoluMnemonic): void => {
        deps.store.setState({ evoluMnemonic } as Partial<State>);
    };
