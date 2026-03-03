import type { Mnemonic } from '@evolu/common';
import type { Evolu, EvoluSchema, Owner, ValidateSchema } from '@evolu/common/local-first';
import type { CreateEvolu } from './createEvoluFactory';
import type { EvoluStorage } from './EvoluStorage';

type CreateEvoluStorageFactoryDeps<S extends EvoluSchema> = {
    readonly createEvolu: CreateEvolu<S>;
};

type CreateEvoluStorageProps<S extends EvoluSchema> = {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    readonly onOwnerUsed?: (owner: Owner) => void;
    readonly urls: ReadonlyArray<string>;
};

type CreateEvoluStorage<S extends EvoluSchema> = (
    props: CreateEvoluStorageProps<S>,
) => Promise<EvoluStorage<S>>;

export type CreateEvoluStorageDep<S extends EvoluSchema> = {
    readonly createEvoluStorage: CreateEvoluStorage<S>;
};

const disposeEvolu = async <S extends EvoluSchema>(evolu: Evolu<S>) => {
    await evolu[Symbol.asyncDispose]();
};

/**
 * Responsibility: Creation of the Storage object that wraps Evolu and provides
 *                 additional lifecycle management (dispose, restoreOwner, etc).
 */
export const createEvoluStorageFactory =
    <S extends EvoluSchema>(deps: CreateEvoluStorageFactoryDeps<S>): CreateEvoluStorage<S> =>
    async props => {
        const createdEvolu = await deps.createEvolu({
            mnemonic: props.mnemonic,
            schema: props.schema,
            appName: props.appName,
            urls: props.urls,
        });

        let evolu = createdEvolu.evolu;
        let activeOwner = createdEvolu.owner;

        props.onOwnerUsed?.(activeOwner);

        let isDisposed = false;

        const updateRelayUrls = (/*urls?: ReadonlyArray<string>*/): Promise<void> =>
            Promise.resolve();

        const restoreOwner = async (mnemonic: Mnemonic): Promise<void> => {
            const previousEvolu = evolu;

            const created = await deps.createEvolu({
                mnemonic,
                schema: props.schema,
                appName: props.appName,
                urls: props.urls,
            });
            evolu = created.evolu;
            activeOwner = created.owner;

            props.onOwnerUsed?.(activeOwner);
            await disposeEvolu(previousEvolu);
        };

        return {
            get evolu() {
                return evolu;
            },
            get activeOwner() {
                return activeOwner;
            },
            updateRelayUrls,
            restoreOwner,
            dispose: async () => {
                if (isDisposed) {
                    return;
                }

                isDisposed = true;
                await disposeEvolu(evolu);
            },
        };
    };
