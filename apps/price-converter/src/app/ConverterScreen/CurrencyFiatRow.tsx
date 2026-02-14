import type { CurrencyCode } from '@evolu/common';
import { Button, Column, DeleteOutlined, Row, Text } from '@minimalist-apps/components';
import type { CurrencyInputDep } from '@minimalist-apps/currency-input';
import type { FC } from 'react';
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
) => (
    <Column gap={8}>
        <Row gap={16}>
            <deps.CurrencyInput value={value} onChange={onChange} code={code} />
            <Text>{code === 'BTC' && btcMode === 'sats' ? 'Sats' : code}</Text>
            {onRemove && (
                <Button
                    variant="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onRemove}
                    size="small"
                />
            )}
        </Row>
        <deps.MoscowTime code={code} />
    </Column>
);
