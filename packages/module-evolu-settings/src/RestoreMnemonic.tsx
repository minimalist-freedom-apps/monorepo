import { Mnemonic } from '@evolu/common';
import { Banner, Button, Column, Modal, SettingsRow, Textarea } from '@minimalist-apps/components';
import type { FC } from 'react';
import { useState } from 'react';

export type RestoreMnemonicDep = {
    readonly RestoreMnemonic: FC;
};

interface RestoreMnemonicDeps {
    readonly restoreMnemonic: (mnemonic: Mnemonic) => void;
}

export const RestoreMnemonic = (deps: RestoreMnemonicDeps) => {
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreSeed, setRestoreSeed] = useState('');

    const restoreResult = Mnemonic.from(restoreSeed);
    const isRestoreSeedValid = restoreResult.ok === true;

    const openRestoreModal = () => {
        setIsRestoreModalOpen(true);
    };

    const closeRestoreModal = () => {
        setIsRestoreModalOpen(false);
    };

    const handleSubmit = () => {
        if (isRestoreSeedValid !== true) {
            return;
        }

        deps.restoreMnemonic(restoreResult.value);
        setRestoreSeed('');
        closeRestoreModal();
    };

    return (
        <SettingsRow label="Restore">
            <Modal
                open={isRestoreModalOpen}
                title="Restore Backup"
                onCancel={closeRestoreModal}
                onOk={handleSubmit}
                okText="Restore"
                cancelText="Cancel"
                okDisabled={isRestoreSeedValid === false}
            >
                <Column gap={16}>
                    <Banner showIcon={true} intent="warning">
                        Restoring from a backup will overwrite your current data. Make sure you have
                        a backup of your current mnemonic if you want to keep those data.
                    </Banner>

                    <Textarea
                        value={restoreSeed}
                        onChange={setRestoreSeed}
                        placeholder="Enter your backup phrase here"
                        rows={6}
                        {...(restoreSeed !== '' && !isRestoreSeedValid
                            ? { status: 'error' as const }
                            : {})}
                        style={{ width: '100%' }}
                    />
                </Column>
            </Modal>
            <Button onClick={openRestoreModal} intent="primary">
                Restore Backup
            </Button>
        </SettingsRow>
    );
};
