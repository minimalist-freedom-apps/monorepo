import { Mnemonic } from '@evolu/common';
import { Banner, Button, Column, Modal, SettingsRow, Textarea } from '@minimalist-apps/components';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import type { RestoreMnemonicDep as RestoreMnemonicServiceDep } from './createRestoreMnemonic';

export type RestoreMnemonicDep = {
    readonly RestoreMnemonic: FC;
};

type RestoreMnemonicDeps = RestoreMnemonicServiceDep;

export const RESTORE_MNEMONIC_ERROR = 'RESTORE_MNEMONIC_ERROR';
export const RESTORE_MNEMONIC_INPUT = 'restore-seed-input';
export const RESTORE_MNEMONIC_MODAL_OK = 'restore-modal-ok';
export const RESTORE_MNEMONIC_OPEN_BUTTON = 'restore-backup-button';

type RestoreState = 'idle' | 'restoring' | 'failed';

export const RestoreMnemonic = (deps: RestoreMnemonicDeps) => {
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreSeed, setRestoreSeed] = useState('');
    const [restoreState, setRestoreState] = useState<RestoreState>('idle');
    const isRestoringRef = useRef(false);

    const restoreResult = Mnemonic.fromUnknown(restoreSeed);
    const isRestoreSeedValid = restoreResult.ok === true;

    const openRestoreModal = () => {
        setRestoreState('idle');
        setIsRestoreModalOpen(true);
    };

    const closeRestoreModal = () => {
        if (isRestoringRef.current) {
            return;
        }

        setRestoreState('idle');
        setIsRestoreModalOpen(false);
    };

    const handleSubmit = () => {
        if (isRestoreSeedValid !== true || isRestoringRef.current) {
            return;
        }

        isRestoringRef.current = true;
        setRestoreState('restoring');

        void deps.restoreMnemonic(restoreResult.value).then(
            () => {
                isRestoringRef.current = false;
                setRestoreSeed('');
                setRestoreState('idle');
                setIsRestoreModalOpen(false);
            },
            () => {
                isRestoringRef.current = false;
                setRestoreState('failed');
            },
        );
    };

    const handleSeedChange = (seed: string) => {
        setRestoreSeed(seed);
        setRestoreState('idle');
    };

    const isRestoring = restoreState === 'restoring';

    return (
        <SettingsRow label="Restore">
            {isRestoreModalOpen ? (
                <Modal
                    open={true}
                    title="Restore Backup"
                    onCancel={closeRestoreModal}
                    onOk={handleSubmit}
                    okText="Restore"
                    cancelText="Cancel"
                    okDisabled={isRestoreSeedValid === false || isRestoring}
                    okLoading={isRestoring}
                    closable={!isRestoring}
                    maskClosable={!isRestoring}
                    keyboard={!isRestoring}
                    okButtonTestId={RESTORE_MNEMONIC_MODAL_OK}
                >
                    <Column gap={16}>
                        <Banner showIcon={true} intent="warning">
                            Restoring from a backup will overwrite your current data. Make sure you
                            have a backup of your current mnemonic if you want to keep those data.
                        </Banner>

                        {restoreState === 'failed' ? (
                            <Banner showIcon={true} intent="danger" testId={RESTORE_MNEMONIC_ERROR}>
                                The backup could not be restored. Your current backup is still
                                active.
                            </Banner>
                        ) : null}

                        <Textarea
                            value={restoreSeed}
                            onChange={handleSeedChange}
                            placeholder="Enter your backup phrase here"
                            rows={6}
                            testId={RESTORE_MNEMONIC_INPUT}
                            {...(restoreSeed !== '' && !isRestoreSeedValid
                                ? { status: 'error' as const }
                                : {})}
                            style={{ width: '100%' }}
                        />
                    </Column>
                </Modal>
            ) : null}
            <Button
                onClick={openRestoreModal}
                intent="primary"
                testId={RESTORE_MNEMONIC_OPEN_BUTTON}
            >
                Restore Backup
            </Button>
        </SettingsRow>
    );
};
