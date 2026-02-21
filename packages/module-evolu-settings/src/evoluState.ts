import type { Mnemonic } from '@evolu/common';
import type { Store } from '@minimalist-apps/mini-store';

export interface EvoluState {
    readonly evoluMnemonic: Mnemonic | null;
}

export type EvoluStoreDep<State extends EvoluState> = {
    readonly store: Store<State>;
};
