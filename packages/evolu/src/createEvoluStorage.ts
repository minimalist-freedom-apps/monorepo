import {
    AppName,
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    getOrThrow,
    type Mnemonic,
    mnemonicToOwnerSecret,
    type Run,
    type UnuseOwner,
} from '@evolu/common';
import type {
    Evolu,
    EvoluPlatformDeps,
    EvoluSchema,
    Owner,
    ValidateSchema,
} from '@evolu/common/local-first';

export type EvoluStorage<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly activeOwner: Owner;
    readonly updateRelayUrls: (urls: ReadonlyArray<string>) => Promise<void>;
    readonly restoreOwner: (mnemonic: Mnemonic) => Promise<void>;
    readonly dispose: () => Promise<void>;
};

export interface CreateEvoluStorageDeps {
    readonly run: Run<EvoluPlatformDeps>;
}

interface CreateEvoluStorageProps<S extends EvoluSchema> {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    readonly onOwnerUsed?: (owner: Owner) => void;
}

type EvoluRuntime<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly activeOwner: Owner;
    readonly unuseOwner: UnuseOwner;
};

const createEvoluRuntime = async <S extends EvoluSchema>(
    deps: CreateEvoluStorageDeps,
    props: {
        readonly mnemonic: Mnemonic;
        readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
        readonly appName: string;
    },
): Promise<EvoluRuntime<S>> => {
    const ownerSecret = mnemonicToOwnerSecret(props.mnemonic);
    const appOwner = createAppOwner(ownerSecret);

    const evolu = getOrThrow(
        await deps.run(
            createEvolu(props.schema, {
                appName: AppName.orThrow(props.appName),
                transports: [
                    createOwnerWebSocketTransport({
                        url: 'https://free.evoluhq.com',
                        ownerId: appOwner.id,
                    }),
                ],
                appOwner,
            }),
        ),
    );

    return {
        evolu,
        activeOwner: appOwner,
        unuseOwner: () => {},
    };
};

const disposeEvoluRuntime = async <S extends EvoluSchema>(runtime: EvoluRuntime<S>) => {
    runtime.unuseOwner();
    await runtime.evolu[Symbol.asyncDispose]();
};

export const createEvoluStorage = async <S extends EvoluSchema>(
    deps: CreateEvoluStorageDeps,
    props: CreateEvoluStorageProps<S>,
): Promise<EvoluStorage<S>> => {
    let runtime = await createEvoluRuntime(deps, {
        mnemonic: props.mnemonic,
        schema: props.schema,
        appName: props.appName,
    });

    props.onOwnerUsed?.(runtime.activeOwner);

    let isDisposed = false;

    const updateRelayUrls = (/*urls?: ReadonlyArray<string>*/): Promise<void> => Promise.resolve();

    const restoreOwner = async (mnemonic: Mnemonic): Promise<void> => {
        const previousRuntime = runtime;

        runtime = await createEvoluRuntime(deps, {
            mnemonic,
            schema: props.schema,
            appName: props.appName,
        });

        props.onOwnerUsed?.(runtime.activeOwner);
        await disposeEvoluRuntime(previousRuntime);
    };

    return {
        get evolu() {
            return runtime.evolu;
        },
        get activeOwner() {
            return runtime.activeOwner;
        },
        updateRelayUrls,
        restoreOwner,
        dispose: async () => {
            if (isDisposed) {
                return;
            }

            isDisposed = true;
            await disposeEvoluRuntime(runtime);
        },
    };
};
