import type { CurrencyCode } from '@evolu/common';
import { Button, Column, Modal, Row, Text } from '@minimalist-apps/components';
import type { CurrencyInputDep } from '@minimalist-apps/currency-input';
import { type FC, useState } from 'react';
import type { BtcMode } from '../../state/State';
import type { MoscowTimeDep } from './MoscowTime';

export type CurrencyRowOwnProps = {
    readonly code: CurrencyCode | 'BTC';
    readonly value: number;
    readonly onChange: (value: number) => void;
    readonly onRemove?: () => void;
};

export type CurrencyRowStateProps = {
    readonly btcMode: BtcMode;
};

type CurrencyRowDeps = CurrencyInputDep & MoscowTimeDep;

export type CurrencyRowDep = {
    CurrencyRow: FC<CurrencyRowOwnProps>;
};

export const CurrencyRowPure = (
    deps: CurrencyRowDeps,
    { btcMode, code, value, onChange, onRemove }: CurrencyRowStateProps & CurrencyRowOwnProps,
) => {
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const closeRemoveModal = () => {
        setIsRemoveModalOpen(false);
    };

    const confirmRemove = () => {
        closeRemoveModal();

        if (onRemove) {
            onRemove();
        }
    };

    return (
        <Column gap={8}>
            <Row gap={16}>
                <deps.CurrencyInput value={value} onChange={onChange} code={code} />
                <Text>{code === 'BTC' && btcMode === 'sats' ? 'Sats' : code}</Text>
                {onRemove && (
                    <Button
                        onClick={() => {
                            setIsRemoveModalOpen(true);
                        }}
                        variant="text"
                        danger
                        size="small"
                        style={{ paddingInline: 0 }}
                    >
                        🗑️
                    </Button>
                )}
            </Row>
            <Modal
                open={isRemoveModalOpen}
                title="Remove currency?"
                okText="Remove"
                cancelText="Cancel"
                onOk={confirmRemove}
                onCancel={closeRemoveModal}
                okDanger
                centered
            >
                <Text>Do you want to remove {code}?</Text>
            </Modal>
            <deps.MoscowTime code={code} />
        </Column>
    );
};
