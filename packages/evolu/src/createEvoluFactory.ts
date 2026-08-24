import {
    AppName,
    createAppOwner,
    createEvolu,
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
import { createOwnerRelayController } from './createOwnerRelayController';

type CreateEvoluProps<S extends EvoluSchema> = {
    readonly mnemonic: Mnemonic;
    readonly schema: ValidateSchema<S> extends never ? S : ValidateSchema<S>;
    readonly appName: string;
    readonly urls: ReadonlyArray<string>;
};

type CreateEvoluResult<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly owner: Owner;
    readonly updateRelayUrls: (relayUrls: ReadonlyArray<string>) => void;
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
                    transports: [],
                    appOwner: owner,
                }),
            ),
        );

        const relayController = createOwnerRelayController({ evolu, owner });
        relayController.updateRelayUrls(props.urls);

        return {
            evolu,
            owner,
            updateRelayUrls: relayController.updateRelayUrls,
        };
    };
