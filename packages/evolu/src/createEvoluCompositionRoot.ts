import { createRun, type EvoluSchema } from '@evolu/common';
import type { ValidateSchema } from '@evolu/common/local-first';
import { createEvoluDeps } from '@evolu/web';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';
import {
    createEnsureEvoluStorage,
    type EnsureEvoluStorageDep,
    type OnOwnerUsedDep,
} from './createEnsureEvoluStorage';
import { createEvoluFactory } from './createEvoluFactory';
import { createEvoluStorageFactory } from './createEvoluStorage';

type CreateEvoluCompositionRootDeps<S extends EvoluSchema> = EnsureEvoluOwnerDep &
    OnOwnerUsedDep & {
        readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
        readonly appName: string;
    };

export const createEvoluCompositionRoot = <S extends EvoluSchema>(
    deps: CreateEvoluCompositionRootDeps<S>,
): EnsureEvoluStorageDep<S> => {
    const run = createRun(createEvoluDeps());
    const createEvolu = createEvoluFactory<S>({ run });
    const createEvoluStorage = createEvoluStorageFactory<S>({ createEvolu });

    const ensureEvoluStorage = createEnsureEvoluStorage({
        deps: {
            createEvoluStorage,
            ensureEvoluOwner: deps.ensureEvoluOwner,
            onOwnerUsed: deps.onOwnerUsed,
        },
        schema: deps.schema,
        appName: deps.appName,
    });

    return {
        ensureEvoluStorage,
    };
};
