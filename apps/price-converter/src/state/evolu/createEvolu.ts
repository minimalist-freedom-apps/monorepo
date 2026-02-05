import {
    createAppOwner,
    createEvolu,
    deriveShardOwner,
    type Evolu,
    mnemonicToOwnerSecret,
    type ShardOwner,
    SimpleName,
    type UnuseOwner,
} from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';
import type { EnsureEvoluOwnerDep } from './createEnsureEvoluOwner';
import { Schema } from './schema';

export type EnsureEvolu = () => {
    evolu: Evolu<typeof Schema>;
    shardOwner: ShardOwner;
};

export interface EnsureEvoluDep {
    readonly ensureEvolu: EnsureEvolu;
}

type EnsureEvoluDeps = EnsureEvoluOwnerDep;

export const createEnsureEvolu = (deps: EnsureEvoluDeps): EnsureEvolu => {
    let evolu: Evolu<typeof Schema> | null = null;
    let shardOwner: ShardOwner | null = null;
    let unuseShardOwner: UnuseOwner = () => {};

    return () => {
        if (evolu !== null && shardOwner !== null) {
            return { evolu, shardOwner };
        }

        const mnemonic = deps.ensureEvoluOwner();
        const ownerSecret = mnemonicToOwnerSecret(mnemonic);
        const appOwner = createAppOwner(ownerSecret);

        evolu = createEvolu(evoluReactWebDeps)(Schema, {
            name: SimpleName.orThrow('price-converter'),
        });

        if (shardOwner === null) {
            shardOwner = deriveShardOwner(appOwner, [
                'minimalistic-apps',
                'price-converter',
            ]);
        }

        unuseShardOwner();
        unuseShardOwner = evolu.useOwner(shardOwner);

        return { evolu, shardOwner };
    };
};
