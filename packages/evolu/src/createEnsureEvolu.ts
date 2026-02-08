import {
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    deriveShardOwner,
    type Evolu,
    type EvoluSchema,
    type Mnemonic,
    mnemonicToOwnerSecret,
    type ShardOwner,
    SimpleName,
    type SyncOwner,
    type UnuseOwner,
} from '@evolu/common';
import type { ValidateSchema } from '@evolu/common/local-first';
import { evoluWebDeps } from '@evolu/web';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';

export type EvoluStorage<S extends EvoluSchema> = {
    evolu: Evolu<S>;
    shardOwner: ShardOwner;
    updateRelayUrls: (urls: string[]) => Promise<void>;
    dispose: () => Promise<void>;
};

const createEvoluStorage = <S extends EvoluSchema>(
    mnemonic: Mnemonic,
    schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>,
): EvoluStorage<S> => {
    const ownerSecret = mnemonicToOwnerSecret(mnemonic);
    const appOwner = createAppOwner(ownerSecret);

    const evolu = createEvolu(evoluWebDeps)(schema, {
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

    const shardOwner = deriveShardOwner(appOwner, ['minimalist-apps', 'price-converter']);

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

export type EnsureEvoluStorage<S extends EvoluSchema> = () => EvoluStorage<S>;

export interface EnsureEvoluDep<S extends EvoluSchema> {
    readonly ensureEvolu: EnsureEvoluStorage<S>;
}

type EnsureEvoluDeps = EnsureEvoluOwnerDep;

export const createEnsureEvolu = <S extends EvoluSchema>(
    deps: EnsureEvoluDeps,
    schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>,
): EnsureEvoluStorage<S> => {
    let storage: EvoluStorage<S> | null = null;

    return () => {
        if (storage === null) {
            storage = createEvoluStorage(deps.ensureEvoluOwner(), schema);
        }

        return storage;
    };
};
