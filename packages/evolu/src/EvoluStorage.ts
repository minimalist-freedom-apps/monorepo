import type { Evolu, EvoluSchema, Mnemonic, Owner } from '@evolu/common';

export type EvoluStorage<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly activeOwner: Owner;
    readonly updateRelayUrls: (urls: ReadonlyArray<string>) => Promise<void>;
    readonly restoreOwner: (mnemonic: Mnemonic) => Promise<void>;
    readonly dispose: () => Promise<void>;
};
