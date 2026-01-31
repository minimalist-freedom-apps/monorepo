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
import { useEffect, useState } from 'react';
import type { Mode } from '../../state/State';
import { selectMode, useStore } from '../../state/createStore';

interface CurrencyInputProps {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
}

const formatInputValue = (
    value: number,
    currencyCode: CurrencyCode | 'BTC',
    displayMode: Mode,
): string => {
    if (currencyCode === 'BTC') {
        return displayMode === 'BTC'
            ? formatBtcWithCommas(satsToBtc(value as AmountSats))
            : formatSats(value as AmountSats);
    }

    return formatFiatWithCommas(value as FiatAmount<CurrencyCode>);
};

export const CurrencyInput = ({
    value,
    code,
    onChange,
}: CurrencyInputProps) => {
    const mode = useStore(selectMode);

    const [inputValue, setInputValue] = useState(() =>
        formatInputValue(value, code, mode),
    );

    useEffect(() => {
        setInputValue(formatInputValue(value, code, mode));
    }, [value, code, mode]);

    const handleChange = (newValue: string) => {
        setInputValue(newValue);

        const numberValue = parseFormattedNumber(newValue);

        if (!Number.isNaN(numberValue)) {
            const normalizedValue =
                mode === 'BTC' && code === 'BTC'
                    ? btcToSats(numberValue as AmountBtc)
                    : numberValue;

            onChange(normalizedValue);
        }
    };

    return (
        <Input
            value={inputValue}
            onChange={handleChange}
            placeholder=""
            monospace
            large
        />
    );
};
