import type { EvoluSchema } from '@evolu/common';
import type { EnsureEvoluStorageDep } from '@minimalist-apps/evolu';
import type { EvoluStoreDep } from './evoluState';

type SetEvoluRelayUrlsDeps<S extends EvoluSchema> = EvoluStoreDep & EnsureEvoluStorageDep<S>;

export type SetEvoluRelayUrls = (relayUrls: ReadonlyArray<string>) => Promise<void>;

export type SetEvoluRelayUrlsDep = {
    readonly setEvoluRelayUrls: SetEvoluRelayUrls;
};

export const createSetEvoluRelayUrls =
    <S extends EvoluSchema>(deps: SetEvoluRelayUrlsDeps<S>): SetEvoluRelayUrls =>
    async relayUrls => {
        const evoluStorage = await deps.ensureEvoluStorage();
        await evoluStorage.updateRelayUrls(relayUrls);
        deps.store.setState({ evoluRelayUrls: relayUrls });
    };
