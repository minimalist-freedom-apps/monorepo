import {
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    type Evolu,
    type EvoluSchema,
    type Mnemonic,
    mnemonicToOwnerSecret,
    SimpleName,
    type SyncOwner,
    type UnuseOwner,
} from '@evolu/common';
import type { Owner, ValidateSchema } from '@evolu/common/local-first';
import { evoluWebDeps } from '@evolu/web';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';

export type EvoluStorage<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly activeOwner: Owner;
    readonly updateRelayUrls: (urls: ReadonlyArray<string>) => Promise<void>;
    readonly dispose: () => Promise<void>;
};

interface CreateEvoluStorageProps<S extends EvoluSchema> {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    // readonly shardPath: NonEmptyReadonlyArray<string | number>;
}

const createEvoluStorage = async <S extends EvoluSchema>({
    mnemonic,
    schema,
    appName,
    // shardPath,
}: CreateEvoluStorageProps<S>): Promise<EvoluStorage<S>> => {
    const ownerSecret = mnemonicToOwnerSecret(mnemonic);
    const appOwner = createAppOwner(ownerSecret);

    const evolu = createEvolu(evoluWebDeps)(schema, {
        name: SimpleName.orThrow(appName),
        transports: [],
        externalAppOwner: appOwner,
    });

    let unuseOwner: UnuseOwner = () => {};

    const updateRelayUrls = async (urls?: ReadonlyArray<string>) => {
        const owner = await evolu.appOwner;

        const syncOwner: SyncOwner = {
            id: owner.id,
            encryptionKey: owner.encryptionKey,
            writeKey: owner.writeKey,
            ...(urls !== undefined
                ? {
                      transports: urls.map(url =>
                          createOwnerWebSocketTransport({
                              url,
                              ownerId: owner.id,
                          }),
                      ),
                  }
                : {}),
        };

        unuseOwner();
        unuseOwner = evolu.useOwner(syncOwner);
    };

    await updateRelayUrls(['https://free.evoluhq.com']); // init with default Evolu relay

    // const shardOwner = deriveShardOwner(appOwner, shardPath);

    // const unuseShardOwner = evolu.useOwner(shardOwner);

    // Todo: new evolu API will be async
    return {
        evolu,
        // shardOwner,
        activeOwner: appOwner,
        updateRelayUrls,
        dispose: async () => {
            // unuseShardOwner();
            unuseOwner();
            // Must reload to properly dispose Evolu. Will be hopefully fixed in a future Evolu release.
            await evolu.resetAppOwner({ reload: true });
        },
    };
};

export type EnsureEvoluStorage<S extends EvoluSchema> = () => Promise<EvoluStorage<S>>;

export interface EnsureEvoluStorageDep<S extends EvoluSchema> {
    readonly ensureEvoluStorage: EnsureEvoluStorage<S>;
}

export interface OnOwnerUsedDep {
    readonly onOwnerUsed: (owner: Owner) => void;
}

interface CreateEnsureEvoluProps<S extends EvoluSchema> {
    readonly deps: EnsureEvoluOwnerDep & OnOwnerUsedDep;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    // readonly shardPath: NonEmptyReadonlyArray<string | number>;
}

export const createEnsureEvoluStorage = <S extends EvoluSchema>({
    deps,
    schema,
    appName,
    // shardPath,
}: CreateEnsureEvoluProps<S>): EnsureEvoluStorage<S> => {
    let storage: EvoluStorage<S> | null = null;

    return async () => {
        if (storage === null) {
            storage = await createEvoluStorage({
                mnemonic: deps.ensureEvoluOwner(),
                schema,
                appName,
                // shardPath,
            });

            deps.onOwnerUsed(storage.activeOwner);
        }

        return storage;
    };
};
