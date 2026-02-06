import { Column, Mnemonic, SettingsRow } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/mini-store';

export type MnemonicSettingsStateProps = {
    readonly evoluMnemonic: string | null;
};

export type MnemonicSettingsDep = {
    readonly MnemonicSettings: Connected;
};

export const MnemonicSettingsPure = ({
    evoluMnemonic,
}: MnemonicSettingsStateProps) => (
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
