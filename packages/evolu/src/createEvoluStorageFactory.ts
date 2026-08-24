import type { Mnemonic } from '@evolu/common';
import type { Evolu, EvoluSchema, Owner, ValidateSchema } from '@evolu/common/local-first';
import type { CreateEvolu } from './createEvoluFactory';
import type { EvoluStorage, RestoreOwnerParams } from './EvoluStorage';

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
        let relayUrls = props.urls;
        let updateActiveRelayUrls = createdEvolu.updateRelayUrls;
        const ownerChangeListeners = new Set<() => void>();

        props.onOwnerUsed?.(activeOwner);

        let isDisposed = false;

        const updateRelayUrls = (urls: ReadonlyArray<string>): Promise<void> =>
            Promise.resolve().then(() => {
                updateActiveRelayUrls(urls);
                relayUrls = urls;
            });

        const notifyOwnerChange = () => {
            for (const listener of ownerChangeListeners) {
                listener();
            }
        };

        const activateOwner = (created: Awaited<ReturnType<CreateEvolu<S>>>) => {
            evolu = created.evolu;
            activeOwner = created.owner;
            updateActiveRelayUrls = created.updateRelayUrls;
            props.onOwnerUsed?.(activeOwner);
            notifyOwnerChange();
        };

        const restoreOwner = async (params: RestoreOwnerParams): Promise<void> => {
            const previous = {
                evolu,
                owner: activeOwner,
                updateRelayUrls: updateActiveRelayUrls,
            };
            const candidate = await deps.createEvolu({
                mnemonic: params.mnemonic,
                schema: props.schema,
                appName: props.appName,
                urls: relayUrls,
            });

            try {
                activateOwner(candidate);
                await params.persistMnemonic();
            } catch (error) {
                try {
                    activateOwner(previous);
                } finally {
                    await disposeEvolu(candidate.evolu);
                }
                throw error;
            }

            await disposeEvolu(previous.evolu);
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
            subscribeOwnerChange: listener => {
                ownerChangeListeners.add(listener);

                return () => {
                    ownerChangeListeners.delete(listener);
                };
            },
            dispose: async () => {
                if (isDisposed) {
                    return;
                }

                isDisposed = true;
                await disposeEvolu(evolu);
            },
        };
    };
