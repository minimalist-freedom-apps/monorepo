import type { EvoluSchema } from '@evolu/common';
import type { Owner, ValidateSchema } from '@evolu/common/local-first';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';
import type { CreateEvoluStorageDep, EvoluStorage } from './createEvoluStorage';

export type { EvoluStorage } from './createEvoluStorage';

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

export const createEnsureEvoluStorage = <S extends EvoluSchema>({
    deps,
    schema,
    appName,
    // shardPath,
}: CreateEnsureEvoluProps<S>): EnsureEvoluStorage<S> => {
    let storage: EvoluStorage<S> | null = null;

    return async () => {
        if (storage === null) {
            const createdStorage = await deps.createEvoluStorage({
                mnemonic: deps.ensureEvoluOwner(),
                schema,
                appName,
                onOwnerUsed: deps.onOwnerUsed,
                // shardPath,
            });

            storage = {
                get evolu() {
                    return createdStorage.evolu;
                },
                get activeOwner() {
                    return createdStorage.activeOwner;
                },
                updateRelayUrls: urls => createdStorage.updateRelayUrls(urls),
                restoreOwner: mnemonic => createdStorage.restoreOwner(mnemonic),
                dispose: async () => {
                    if (storage === null) {
                        return;
                    }

                    await createdStorage.dispose();
                    storage = null;
                },
            };
        }

        return storage;
    };
};
