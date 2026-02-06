import type { CurrencyCode } from '@evolu/common';
import {
    Button,
    DeleteOutlined,
    Row,
    Text,
} from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/connect';
import type { Mode } from '../../state/State';
import type { CurrencyInputDep } from './CurrencyInput';

export type CurrencyRowOwnProps = {
    readonly code: CurrencyCode | 'BTC';
    readonly value: number;
    readonly onChange: (value: number) => void;
    readonly onRemove?: () => void;
};

export type CurrencyRowStateProps = {
    readonly mode: Mode;
};

type CurrencyRowDeps = CurrencyInputDep;

export type CurrencyRowDep = {
    CurrencyRow: Connected<CurrencyRowOwnProps>;
};

export const CurrencyRowPure = (
    deps: CurrencyRowDeps,
    {
        mode,
        code,
        value,
        onChange,
        onRemove,
    }: CurrencyRowStateProps & CurrencyRowOwnProps,
) => (
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
);
