import {
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    deriveShardOwner,
    type Evolu,
    type Mnemonic,
    mnemonicToOwnerSecret,
    type ShardOwner,
    SimpleName,
    type SyncOwner,
    type UnuseOwner,
} from '@evolu/common';
import { evoluReactWebDeps } from '@evolu/react-web';
import type { EnsureEvoluOwnerDep } from './createEnsureEvoluOwner';
import { Schema } from './schema';

export type EvoluStorage = {
    evolu: Evolu<typeof Schema>;
    shardOwner: ShardOwner;
    updateRelayUrls: (urls: string[]) => Promise<void>;
    dispose: () => Promise<void>;
};

const createEvoluStorage = (mnemonic: Mnemonic): EvoluStorage => {
    const ownerSecret = mnemonicToOwnerSecret(mnemonic);
    const appOwner = createAppOwner(ownerSecret);

    const evolu = createEvolu(evoluReactWebDeps)(Schema, {
        name: SimpleName.orThrow('price-converter'),
        transports: [],
    });

    let unuseOwner: UnuseOwner = () => {};

    const updateRelayUrls = async (urls: string[]) => {
        const owner = await evolu.appOwner;

        const syncOwner: SyncOwner = {
            id: owner.id,
            encryptionKey: owner.encryptionKey,
            writeKey: owner.writeKey,
            transports: urls.map(url =>
                createOwnerWebSocketTransport({
                    url,
                    ownerId: owner.id,
                }),
            ),
        };

        unuseOwner();
        unuseOwner = evolu.useOwner(syncOwner);
    };

    const shardOwner = deriveShardOwner(appOwner, [
        'minimalistic-apps',
        'price-converter',
    ]);

    const unuseShardOwner = evolu.useOwner(shardOwner);

    return {
        evolu,
        shardOwner,
        updateRelayUrls,
        dispose: async () => {
            unuseShardOwner();
            unuseOwner();
            await evolu.resetAppOwner({ reload: false });
        },
    };
};

export type EnsureEvoluStorage = () => EvoluStorage;

export interface EnsureEvoluDep {
    readonly ensureEvolu: EnsureEvoluStorage;
}

type EnsureEvoluDeps = EnsureEvoluOwnerDep;

export const createEnsureEvolu = (
    deps: EnsureEvoluDeps,
): EnsureEvoluStorage => {
    let storage: EvoluStorage | null = null;

    return () => {
        if (storage === null) {
            storage = createEvoluStorage(deps.ensureEvoluOwner());
        }

        return storage;
    };
};
