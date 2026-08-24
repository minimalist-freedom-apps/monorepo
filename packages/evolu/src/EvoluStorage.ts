import type { Evolu, EvoluSchema, Mnemonic, Owner } from '@evolu/common';

export type RestoreOwnerParams = {
    readonly mnemonic: Mnemonic;
    readonly persistMnemonic: () => Promise<void>;
};

export type EvoluStorage<S extends EvoluSchema> = {
    readonly evolu: Evolu<S>;
    readonly activeOwner: Owner;
    readonly updateRelayUrls: (urls: ReadonlyArray<string>) => Promise<void>;
    readonly restoreOwner: (params: RestoreOwnerParams) => Promise<void>;
    readonly subscribeOwnerChange: (listener: () => void) => () => void;
    readonly dispose: () => Promise<void>;
};
