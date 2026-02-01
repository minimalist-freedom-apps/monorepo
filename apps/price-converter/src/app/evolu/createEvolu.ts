import {
    createAppOwner,
    createEvolu,
    createOwnerSecret,
    createRandomBytes,
    type Evolu,
    mnemonicToOwnerSecret,
    ownerSecretToMnemonic,
    SimpleName,
} from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';
import type { LocalStorageDep } from '@minimalistic-apps/local-storage';
import type { StoreDep } from '../../state/createStore';
import { Schema } from './schema';

export type EnsureEvolu = () => Evolu<typeof Schema>;

export interface EnsureEvoluDep {
    readonly ensureEvolu: EnsureEvolu;
}

type EnsureEvoluDeps = StoreDep & LocalStorageDep;

export const createEnsureEvolu = (deps: EnsureEvoluDeps): EnsureEvolu => {
    let evolu: Evolu<typeof Schema> | null = null;

    return () => {
        if (evolu !== null) {
            return evolu;
        }

        const currentState = deps.store.getState();
        let { evoluMnemonic: mnemonic } = currentState;

        if (mnemonic === null) {
            const randomBytes = createRandomBytes();
            const ownerSecret = createOwnerSecret({ randomBytes });
            const newMnemonic = ownerSecretToMnemonic(ownerSecret);
            mnemonic = newMnemonic;

            deps.store.setState({ evoluMnemonic: mnemonic });
        }

        const ownerSecret = mnemonicToOwnerSecret(mnemonic);
        const appOwner = createAppOwner(ownerSecret);

        evolu = createEvolu(evoluReactWebDeps)(Schema, {
            name: SimpleName.orThrow('price-converter'),
        });

        evolu.useOwner(appOwner);

        return evolu;
    };
};
