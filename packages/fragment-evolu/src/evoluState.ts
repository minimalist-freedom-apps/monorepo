import type { Mnemonic, OwnerId } from '@evolu/common';
import type { Store } from '@minimalist-apps/mini-store';

export interface EvoluState {
    readonly evoluMnemonic: Mnemonic | null;
    readonly activeOwnerAppId: OwnerId | null;
}

export type EvoluStoreDep = {
    readonly store: Store<EvoluState>;
};
