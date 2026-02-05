import type { CurrencyCode } from '@evolu/common';
import {
    Button,
    DeleteOutlined,
    Row,
    Text,
} from '@minimalistic-apps/components';
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';
import type { Mode } from '../../state/State';
import type { CurrencyInputDep } from './CurrencyInput';

type CurrencyRowOwnProps = {
    readonly code: CurrencyCode | 'BTC';
    readonly value: number;
    readonly onChange: (value: number) => void;
    readonly onRemove?: () => void;
};

type CurrencyRowStateProps = {
    readonly mode: Mode;
};

type CurrencyRowDeps = ComponentConnectDep<
    CurrencyRowStateProps,
    CurrencyRowOwnProps
> &
    CurrencyInputDep;

type CurrencyRow = React.FC<CurrencyRowOwnProps>;

export type CurrencyRowDep = {
    CurrencyRow: CurrencyRow;
};

export const createCurrencyRow = (deps: CurrencyRowDeps): CurrencyRow =>
    deps.connect(({ mode, code, value, onChange, onRemove }) => (
        <Row gap={12}>
            <deps.CurrencyInput value={value} onChange={onChange} code={code} />
            <Text>{code === 'BTC' && mode === 'Sats' ? 'Sats' : code}</Text>
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
    ));
