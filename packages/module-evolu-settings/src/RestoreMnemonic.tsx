import { Button, Modal, SettingsRow } from '@minimalist-apps/components';
import type { FC } from 'react';
import { useState } from 'react';

export type RestoreMnemonicDep = {
    readonly RestoreMnemonic: FC;
};

export const RestoreMnemonic = () => {
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreSeed, setRestoreSeed] = useState('');

    return (
        <SettingsRow label="Restore">
            <Modal
                open={isRestoreModalOpen}
                title="Restore Backup"
                onCancel={() => setIsRestoreModalOpen(false)}
                onOk={() => setIsRestoreModalOpen(false)}
                okText="Restore"
                cancelText="Cancel"
            >
                <textarea
                    value={restoreSeed}
                    onChange={event => setRestoreSeed(event.target.value)}
                    placeholder="Enter your backup phrase here"
                    rows={6}
                    style={{ width: '100%', resize: 'vertical' }}
                />
            </Modal>
            <Button onClick={() => setIsRestoreModalOpen(true)} intent="warning">
                Restore Backup
            </Button>
        </SettingsRow>
    );
};
