import {
    createOwnerWebSocketTransport,
    type Evolu,
    type EvoluSchema,
    type Owner,
} from '@evolu/common';

type CreateOwnerRelayControllerDeps<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly owner: Owner;
};

export type OwnerRelayController = {
    readonly updateRelayUrls: (relayUrls: ReadonlyArray<string>) => void;
};

export const createOwnerRelayController = <S extends EvoluSchema>(
    deps: CreateOwnerRelayControllerDeps<S>,
): OwnerRelayController => {
    let releaseActiveRelays: (() => void) | null = null;

    const updateRelayUrls = (relayUrls: ReadonlyArray<string>) => {
        if (relayUrls.length === 0) {
            releaseActiveRelays?.();
            releaseActiveRelays = null;

            return;
        }

        const [firstRelayUrl, ...remainingRelayUrls] = relayUrls;
        const transports = [
            createOwnerWebSocketTransport({
                url: firstRelayUrl,
                ownerId: deps.owner.id,
            }),
            ...remainingRelayUrls.map(url =>
                createOwnerWebSocketTransport({
                    url,
                    ownerId: deps.owner.id,
                }),
            ),
        ] as const;

        const releasePreviousRelays = releaseActiveRelays;
        releaseActiveRelays = deps.evolu.useOwner(deps.owner, transports);
        releasePreviousRelays?.();
    };

    return { updateRelayUrls };
};
