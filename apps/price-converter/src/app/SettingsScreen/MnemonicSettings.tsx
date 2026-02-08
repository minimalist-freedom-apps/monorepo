import { Column, Mnemonic, SettingsRow } from '@minimalist-apps/components';
import type { FC } from 'react';

export type MnemonicSettingsStateProps = {
    readonly evoluMnemonic: string | null;
};

export type MnemonicSettingsDep = {
    readonly MnemonicSettings: FC;
};

export const MnemonicSettingsPure = ({ evoluMnemonic }: MnemonicSettingsStateProps) => (
    <Column gap={12}>
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
            <Mnemonic value={evoluMnemonic} />
        </SettingsRow>
    </Column>
);
