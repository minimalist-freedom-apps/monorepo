import {
    createAppOwner,
    createEvolu,
    deriveShardOwner,
    type Evolu,
    mnemonicToOwnerSecret,
    SimpleName,
} from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';
import type { EnsureEvoluOwnerDep } from './createEnsureEvoluOwner';
import { Schema } from './schema';

export type EnsureEvolu = () => Evolu<typeof Schema>;

export interface EnsureEvoluDep {
    readonly ensureEvolu: EnsureEvolu;
}

type EnsureEvoluDeps = EnsureEvoluOwnerDep;

export const createEnsureEvolu = (deps: EnsureEvoluDeps): EnsureEvolu => {
    let evolu: Evolu<typeof Schema> | null = null;

    return () => {
        if (evolu !== null) {
            return evolu;
        }

        const mnemonic = deps.ensureEvoluOwner();
        const ownerSecret = mnemonicToOwnerSecret(mnemonic);
        const appOwner = createAppOwner(ownerSecret);

        evolu = createEvolu(evoluReactWebDeps)(Schema, {
            name: SimpleName.orThrow('price-converter'),
        });

        const shardOwner = deriveShardOwner(appOwner, [
            'minimalistic-apps',
            'price-converter',
        ]);
        evolu.useOwner(shardOwner);

        return evolu;
    };
};
