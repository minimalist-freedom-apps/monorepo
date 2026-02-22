import type { Mnemonic } from '@evolu/common';
import { Mnemonic as MnemonicComponent, SettingsRow } from '@minimalist-apps/components';
import type { FC } from 'react';

export interface BackupMnemonicProps {
    readonly evoluMnemonic: Mnemonic | null;
}

export type BackupMnemonicDep = {
    readonly BackupMnemonic: FC;
};

export const BackupMnemonic = ({ evoluMnemonic }: BackupMnemonicProps) => (
    <SettingsRow
        direction="column"
        label="Backup Phrase"
        description={
            <>
                Tap to reveal/hide your backup phrase. Keep it safe and do not share it with anyone.
            </>
        }
    >
        <MnemonicComponent value={evoluMnemonic} />
    </SettingsRow>
);
