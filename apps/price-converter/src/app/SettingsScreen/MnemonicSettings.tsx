import { Column, Mnemonic, SettingsRow } from '@minimalistic-apps/components';
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';

type MnemonicSettingsStateProps = {
    readonly evoluMnemonic: string | null;
};

type MnemonicSettingsDeps = ComponentConnectDep<MnemonicSettingsStateProps>;

type MnemonicSettings = React.FC;

export type MnemonicSettingsDep = {
    readonly MnemonicSettings: MnemonicSettings;
};

export const createMnemonicSettings = (
    deps: MnemonicSettingsDeps,
): MnemonicSettings =>
    deps.connect(({ evoluMnemonic }) => (
        <Column gap={12}>
            <SettingsRow
                direction="column"
                label="Backup Phrase"
                description={
                    <>
                        Tap to reveal/hide your backup phrase. Keep it safe and
                        do not share it with anyone.
                    </>
                }
            >
                <Mnemonic value={evoluMnemonic} />
            </SettingsRow>
        </Column>
    ));
