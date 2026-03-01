import { Mnemonic } from '@evolu/common';
import { Banner, Button, Column, Modal, SettingsRow, Textarea } from '@minimalist-apps/components';
import type { RestoreMnemonicServiceDep } from '@minimalist-apps/fragment-evolu';
import { useState } from 'react';

export const RestoreSeed = ({ restoreMnemonic }: RestoreMnemonicServiceDep) => {
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

        restoreMnemonic(restoreResult.value);
        setRestoreSeed('');
        closeRestoreModal();
    };

    return (
        <SettingsRow label="Restore">
            <Modal
                open={isRestoreModalOpen}
                title="Restore Seed"
                onCancel={closeRestoreModal}
                onOk={handleSubmit}
                okText="Restore"
                cancelText="Cancel"
                okDisabled={isRestoreSeedValid === false}
                okButtonTestId="restore-modal-ok"
            >
                <Column gap={16}>
                    <Banner showIcon={true} intent="warning">
                        Restoring from a seed will overwrite your current app data.
                    </Banner>

                    <Textarea
                        value={restoreSeed}
                        onChange={setRestoreSeed}
                        placeholder="Enter your seed phrase"
                        rows={6}
                        testId="restore-seed-input"
                        {...(restoreSeed !== '' && !isRestoreSeedValid
                            ? { status: 'error' as const }
                            : {})}
                        style={{ width: '100%' }}
                    />
                </Column>
            </Modal>
            <Button onClick={openRestoreModal} intent="primary" testId="restore-backup-button">
                Restore Seed
            </Button>
        </SettingsRow>
    );
};
