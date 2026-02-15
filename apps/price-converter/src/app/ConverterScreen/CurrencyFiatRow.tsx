import type { CurrencyCode } from '@evolu/common';
import { Button, Column, Row } from '@minimalist-apps/components';
import type { CurrencyInputDep } from '@minimalist-apps/currency-input';
import { type FC, useState } from 'react';
import type { BtcMode } from '../../state/State';
import { BtcEasterEggModal } from './BtcEasterEggModal';
import type { MoscowTimeDep } from './MoscowTime';
import { RemoveCurrencyModal } from './RemoveCurrencyModal';

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
    const [isBtcEasterEggOpen, setIsBtcEasterEggOpen] = useState(false);

    const closeRemoveModal = () => {
        setIsRemoveModalOpen(false);
    };

    const confirmRemove = () => {
        closeRemoveModal();

        if (onRemove) {
            onRemove();
        }
    };

    const openBtcEasterEgg = () => {
        setIsBtcEasterEggOpen(true);
    };

    const closeBtcEasterEgg = () => {
        setIsBtcEasterEggOpen(false);
    };

    return (
        <Column gap={8}>
            <Row gap={16}>
                <deps.CurrencyInput
                    value={value}
                    onChange={onChange}
                    code={code}
                    label={code === 'BTC' ? (btcMode === 'btc' ? 'BTC' : 'Sats') : code}
                />
                {onRemove && (
                    <>
                        <Button
                            onClick={() => {
                                setIsRemoveModalOpen(true);
                            }}
                            variant="text"
                            intent="danger"
                            size="small"
                            style={{ paddingInline: 0 }}
                        >
                            🗑️
                        </Button>
                        <RemoveCurrencyModal
                            open={isRemoveModalOpen}
                            code={code}
                            onOk={confirmRemove}
                            onCancel={closeRemoveModal}
                        />
                    </>
                )}
                {!onRemove && code === 'BTC' && (
                    <>
                        <Button
                            onClick={openBtcEasterEgg}
                            style={{
                                width: 24,
                                minWidth: 24,
                                paddingInline: 0,
                                border: 'none',
                                background: 'transparent',
                            }}
                        />
                        <BtcEasterEggModal open={isBtcEasterEggOpen} onOk={closeBtcEasterEgg} />
                    </>
                )}
            </Row>

            <deps.MoscowTime code={code} />
        </Column>
    );
};
