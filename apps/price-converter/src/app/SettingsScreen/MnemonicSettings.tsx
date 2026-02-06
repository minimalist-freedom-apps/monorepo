import { Column, Mnemonic, SettingsRow } from '@minimalistic-apps/components';
import type React from 'react';

export type MnemonicSettingsStateProps = {
    readonly evoluMnemonic: string | null;
};

type MnemonicSettings = React.FC;

export type MnemonicSettingsDep = {
    readonly MnemonicSettings: MnemonicSettings;
};

export const mnemonicSettingsPure = ({
    evoluMnemonic,
}: MnemonicSettingsStateProps): React.ReactNode => (
    <Column gap={12}>
        <SettingsRow
            direction="column"
            label="Backup Phrase"
            description={
                <>
                    Tap to reveal/hide your backup phrase. Keep it safe and do
                    not share it with anyone.
                </>
            }
        >
            <Mnemonic value={evoluMnemonic} />
        </SettingsRow>
    </Column>
);
