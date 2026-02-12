import {
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    deriveShardOwner,
    type Evolu,
    type EvoluSchema,
    type Mnemonic,
    mnemonicToOwnerSecret,
    type NonEmptyReadonlyArray,
    type ShardOwner,
    SimpleName,
    type SyncOwner,
    type UnuseOwner,
} from '@evolu/common';
import type { ValidateSchema } from '@evolu/common/local-first';
import { evoluWebDeps } from '@evolu/web';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';

export type EvoluStorage<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly shardOwner: ShardOwner;
    readonly updateRelayUrls: (urls: ReadonlyArray<string>) => Promise<void>;
    readonly dispose: () => Promise<void>;
};

interface CreateEvoluStorageProps<S extends EvoluSchema> {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    readonly shardPath: NonEmptyReadonlyArray<string | number>;
}

const createEvoluStorage = <S extends EvoluSchema>({
    mnemonic,
    schema,
    appName,
    shardPath,
}: CreateEvoluStorageProps<S>): EvoluStorage<S> => {
    const ownerSecret = mnemonicToOwnerSecret(mnemonic);
    const appOwner = createAppOwner(ownerSecret);

    const evolu = createEvolu(evoluWebDeps)(schema, {
        name: SimpleName.orThrow(appName),
        transports: [],
    });

    let unuseOwner: UnuseOwner = () => {};

    const updateRelayUrls = async (urls: ReadonlyArray<string>) => {
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

    const shardOwner = deriveShardOwner(appOwner, shardPath);

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
    readonly ensureEvoluStorage: EnsureEvoluStorage<S>;
}

interface CreateEnsureEvoluProps<S extends EvoluSchema> {
    readonly deps: EnsureEvoluOwnerDep;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    readonly shardPath: NonEmptyReadonlyArray<string | number>;
}

export const createEnsureEvoluStorage = <S extends EvoluSchema>({
    deps,
    schema,
    appName,
    shardPath,
}: CreateEnsureEvoluProps<S>): EnsureEvoluStorage<S> => {
    let storage: EvoluStorage<S> | null = null;

    return () => {
        if (storage === null) {
            storage = createEvoluStorage({
                mnemonic: deps.ensureEvoluOwner(),
                schema,
                appName,
                shardPath,
            });
        }

        return storage;
    };
};
