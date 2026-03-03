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

interface CreateEnsureEvoluProps<S extends EvoluSchema> {
    readonly deps: EnsureEvoluOwnerDep & OnOwnerUsedDep & CreateEvoluStorageDep<S>;
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

    return async () => {
        if (storage === null) {
            storage = await deps.createEvoluStorage({
                mnemonic: deps.ensureEvoluOwner(),
                schema,
                appName,
                onOwnerUsed: deps.onOwnerUsed,
                urls: ['https://free.evoluhq.com'],
                // shardPath,
            });
        }

        return storage;
    };
};
