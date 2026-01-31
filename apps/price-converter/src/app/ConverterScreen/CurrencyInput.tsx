import type { CurrencyCode } from '@evolu/common';
import {
    type AmountBtc,
    type AmountSats,
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import { Input } from '@minimalistic-apps/components';
import { type FiatAmount, formatFiatWithCommas } from '@minimalistic-apps/fiat';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import { selectMode, useStore } from '../../state/createStore';

interface CurrencyInputProps {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
}

export const CurrencyInput = ({
    value,
    code,
    onChange,
}: CurrencyInputProps) => {
    const mode = useStore(selectMode);

    const handleChange = (value: string) => {
        const numberValue = parseFormattedNumber(value);

        const normalizedValue =
            mode === 'BTC' && code === 'BTC'
                ? btcToSats(numberValue as AmountBtc)
                : numberValue;

        onChange(normalizedValue);
    };

    const formattedValue =
        code === 'BTC'
            ? mode === 'BTC'
                ? formatBtcWithCommas(satsToBtc(value as AmountSats))
                : formatSats(value as AmountSats)
            : formatFiatWithCommas(value as FiatAmount<CurrencyCode>);

    return (
        <Input
            value={formattedValue}
            onChange={handleChange}
            placeholder=""
            monospace
            large
        />
    );
};
