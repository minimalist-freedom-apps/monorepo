import { Column, Mnemonic, SettingsRow } from '@minimalistic-apps/components';
import { selectEvoluMnemonic, useStore } from '../../state/createStore';

export const MnemonicSettings = () => {
    const evoluMnemonic = useStore(selectEvoluMnemonic);

    return (
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
    );
};
