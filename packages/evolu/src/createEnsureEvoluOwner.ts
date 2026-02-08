import {
    createOwnerSecret,
    createRandomBytes,
    type Mnemonic,
    ownerSecretToMnemonic,
} from '@evolu/common';
import type { Store } from '@minimalist-apps/mini-store';

interface EvoluOwnerState {
    readonly evoluMnemonic: Mnemonic | null;
}

export type EnsureEvoluOwner = () => Mnemonic;

export interface EnsureEvoluOwnerDep {
    readonly ensureEvoluOwner: EnsureEvoluOwner;
}

interface EnsureEvoluOwnerDeps {
    readonly store: Store<EvoluOwnerState>;
}

export const createEnsureEvoluOwner =
    (deps: EnsureEvoluOwnerDeps): EnsureEvoluOwner =>
    () => {
        const currentState = deps.store.getState();
        let { evoluMnemonic: mnemonic } = currentState;

        if (mnemonic === null) {
            const randomBytes = createRandomBytes();
            const ownerSecret = createOwnerSecret({ randomBytes });
            const newMnemonic = ownerSecretToMnemonic(ownerSecret);
            mnemonic = newMnemonic;

            deps.store.setState({ evoluMnemonic: mnemonic });
        }

        return mnemonic;
    };
