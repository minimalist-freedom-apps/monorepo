import type { Mnemonic } from '@evolu/common';
import type { Connect } from '@minimalist-apps/connect';
import { type BackupMnemonicDep, BackupMnemonic as BackupMnemonicPure } from './BackupMnemonic.js';
import {
    type RestoreMnemonicDep,
    RestoreMnemonic as RestoreMnemonicPure,
} from './RestoreMnemonic.js';

interface EvoluSettingsStoreState {
    readonly evoluMnemonic: Mnemonic | null;
}

interface EvoluSettingsStates {
    readonly store: EvoluSettingsStoreState;
}

export interface EvoluSettingsCompositionRootDeps {
    readonly connect: Connect<EvoluSettingsStates>;
    readonly setMnemonic: (mnemonic: Mnemonic) => void;
    readonly restoreMnemonic: (mnemonic: Mnemonic) => void;
}

export const createEvoluSettingsCompositionRoot = (
    deps: EvoluSettingsCompositionRootDeps,
): BackupMnemonicDep & RestoreMnemonicDep => {
    const BackupMnemonic = deps.connect(BackupMnemonicPure, ({ store }) => ({
        evoluMnemonic: store.evoluMnemonic,
    }));
    const RestoreMnemonic = deps.connect(RestoreMnemonicPure, () => ({}), {
        restoreMnemonic: deps.restoreMnemonic,
    });

    return { BackupMnemonic, RestoreMnemonic };
};
