import type { EvoluSchema } from '@evolu/common';
import type { Owner, ValidateSchema } from '@evolu/common/local-first';
import type { EnsureEvoluOwnerDep } from './createEnsureEvoluMnemonic';
import type { CreateEvoluStorageDep } from './createEvoluStorageFactory';
import type { EvoluStorage } from './EvoluStorage';

export type EnsureEvoluStorage<S extends EvoluSchema> = () => Promise<EvoluStorage<S>>;

export interface EnsureEvoluStorageDep<S extends EvoluSchema> {
    readonly ensureEvoluStorage: EnsureEvoluStorage<S>;
}

export interface OnOwnerUsedDep {
    readonly onOwnerUsed: (owner: Owner) => void;
}

export interface GetEvoluRelayUrlsDep {
    readonly getEvoluRelayUrls: () => ReadonlyArray<string>;
}

interface CreateEnsureEvoluProps<S extends EvoluSchema> {
    readonly deps: EnsureEvoluOwnerDep &
        OnOwnerUsedDep &
        GetEvoluRelayUrlsDep &
        CreateEvoluStorageDep<S>;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    // readonly shardPath: NonEmptyReadonlyArray<string | number>;
}

/**
 * Responsibility: Stateful service that ensures a single (for now)
 *                 instance of EvoluStorage is created and reused.
 */
export const createEnsureEvoluStorage = <S extends EvoluSchema>({
    deps,
    schema,
    appName,
    // shardPath,
}: CreateEnsureEvoluProps<S>): EnsureEvoluStorage<S> => {
    let storage: EvoluStorage<S> | null = null;
    let pendingStorage: Promise<EvoluStorage<S>> | null = null;

    const createStorage = () => {
        const creation = (async () =>
            deps.createEvoluStorage({
                mnemonic: await deps.ensureEvoluOwner(),
                schema,
                appName,
                onOwnerUsed: deps.onOwnerUsed,
                urls: deps.getEvoluRelayUrls(),
                // shardPath,
            }))();
        pendingStorage = creation;

        void creation.then(
            createdStorage => {
                storage = createdStorage;

                if (pendingStorage === creation) {
                    pendingStorage = null;
                }
            },
            () => {
                if (pendingStorage === creation) {
                    pendingStorage = null;
                }
            },
        );

        return creation;
    };

    const ensureEvoluStorage: EnsureEvoluStorage<S> = () => {
        if (pendingStorage !== null) {
            return pendingStorage;
        }

        if (storage?.status === 'disposing') {
            const disposingStorage = storage;
            const waitForDisposal = disposingStorage
                .dispose()
                .catch(() => undefined)
                .then(() => {
                    if (storage === disposingStorage) {
                        storage = null;
                    }

                    if (pendingStorage === waitForDisposal) {
                        pendingStorage = null;
                    }

                    return ensureEvoluStorage();
                });
            pendingStorage = waitForDisposal;

            return waitForDisposal;
        }

        if (storage?.status === 'disposed') {
            storage = null;
        }

        if (storage === null) {
            return createStorage();
        }

        return Promise.resolve(storage);
    };

    return ensureEvoluStorage;
};
