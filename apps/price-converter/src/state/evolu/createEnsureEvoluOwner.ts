import {
    createOwnerSecret,
    createRandomBytes,
    type Mnemonic,
    ownerSecretToMnemonic,
} from '@evolu/common';
import type { StoreDep } from '../createStore';

export type EnsureEvoluOwner = () => Mnemonic;

export interface EnsureEvoluOwnerDep {
    readonly ensureEvoluOwner: EnsureEvoluOwner;
}

type EnsureEvoluOwnerDeps = StoreDep;

export const createEnsureEvoluOwner = (
    deps: EnsureEvoluOwnerDeps,
): EnsureEvoluOwner => {
    return () => {
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
};
