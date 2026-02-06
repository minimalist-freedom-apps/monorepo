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
import type { Connected } from '@minimalistic-apps/connect';
import { type FiatAmount, formatFiatWithCommas } from '@minimalistic-apps/fiat';
import { useEffect, useState } from 'react';
import type { Mode } from '../../state/State';
import { parseFormattedNumber } from './parseFormattedNumber';

const formatInputValue = (
    value: number,
    currencyCode: CurrencyCode | 'BTC',
    displayMode: Mode,
): string => {
    if (value === 0) {
        return '';
    }

    if (currencyCode === 'BTC') {
        return displayMode === 'BTC'
            ? formatBtcWithCommas(satsToBtc(value as AmountSats))
            : formatSats(value as AmountSats);
    }

    return formatFiatWithCommas(value as FiatAmount<CurrencyCode>);
};

export type CurrencyInputOwnProps = {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
};

export type CurrencyInputStateProps = {
    readonly mode: Mode;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
};

type CurrencyInputDeps = {
    readonly setFocusedCurrency: (code: CurrencyCode | 'BTC') => void;
};

export type CurrencyInputDep = {
    CurrencyInput: Connected<CurrencyInputOwnProps>;
};

export const InputPure = (
    deps: CurrencyInputDeps,
    {
        mode,
        focusedCurrency,
        value,
        code,
        onChange,
    }: CurrencyInputStateProps & CurrencyInputOwnProps,
) => {
    const [inputValue, setInputValue] = useState(() =>
        formatInputValue(value, code, mode),
    );

    useEffect(() => {
        // Prevent overwriting input while user is typing
        if (focusedCurrency === code) {
            return;
        }

        setInputValue(formatInputValue(value, code, mode));
    }, [value, code, mode, focusedCurrency]);

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

    const handleFocus = () => {
        deps.setFocusedCurrency(code);
    };

    return (
        <Input
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={`Type in the ${code} amount`}
            monospace
            large
            className="minimalistic-input-with-small-placeholder"
        />
    );
};
