import {
    AppName,
    createAppOwner,
    createEvolu,
    createOwnerWebSocketTransport,
    getOrThrow,
    type Mnemonic,
    mnemonicToOwnerSecret,
    type Run,
} from '@evolu/common';
import type {
    Evolu,
    EvoluPlatformDeps,
    EvoluSchema,
    Owner,
    ValidateSchema,
} from '@evolu/common/local-first';

export type CreateEvoluProps<S extends EvoluSchema> = {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
};

export type CreateEvoluResult<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly owner: Owner;
};

export type CreateEvolu<S extends EvoluSchema> = (
    props: CreateEvoluProps<S>,
) => Promise<CreateEvoluResult<S>>;

type CreateEvoluFactoryDeps = {
    readonly run: Run<EvoluPlatformDeps>;
};

export const createEvoluFactory =
    <S extends EvoluSchema>(deps: CreateEvoluFactoryDeps): CreateEvolu<S> =>
    async props => {
        const ownerSecret = mnemonicToOwnerSecret(props.mnemonic);
        const owner = createAppOwner(ownerSecret);

        const evolu = getOrThrow(
            await deps.run(
                createEvolu(props.schema, {
                    appName: AppName.orThrow(props.appName),
                    transports: [
                        createOwnerWebSocketTransport({
                            url: 'https://free.evoluhq.com',
                            ownerId: owner.id,
                        }),
                    ],
                    appOwner: owner,
                }),
            ),
        );

        return {
            evolu,
            owner,
        };
    };
