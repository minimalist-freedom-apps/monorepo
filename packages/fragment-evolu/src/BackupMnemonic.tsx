import type { Mnemonic } from '@evolu/common';
import { Mnemonic as MnemonicComponent, SettingsRow } from '@minimalist-apps/components';
import type { EnsureEvoluOwnerDep } from '@minimalist-apps/evolu';
import { type FC, useEffect } from 'react';

interface BackupMnemonicProps {
    readonly evoluMnemonic: Mnemonic | null;
}

export type BackupMnemonicDep = {
    readonly BackupMnemonic: FC;
};

type BackupMnemonicDeps = EnsureEvoluOwnerDep;

export const BackupMnemonic = (
    deps: BackupMnemonicDeps,
    { evoluMnemonic }: BackupMnemonicProps,
) => {
    useEffect(() => {
        if (evoluMnemonic !== null) {
            return;
        }

        deps.ensureEvoluOwner();
    }, [deps, evoluMnemonic]);

    if (evoluMnemonic === null) {
        return null;
    }

    return (
        <SettingsRow
            direction="column"
            label="Backup Phrase"
            description={
                <>
                    Tap to reveal/hide your backup phrase. Keep it safe and do not share it with
                    anyone.
                </>
            }
        >
            <MnemonicComponent value={evoluMnemonic} />
        </SettingsRow>
    );
};
