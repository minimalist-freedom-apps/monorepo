import type { CurrencyCode } from '@evolu/common';
import {
    type AmountBtc,
    type AmountSats,
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalist-apps/bitcoin';
import { Input } from '@minimalist-apps/components';
import { type FiatAmount, formatFiatWithCommas } from '@minimalist-apps/fiat';
import { type FC, useEffect, useState } from 'react';
import type { BtcMode } from '../../state/State';
import type { SetFocusedCurrencyDep } from '../../state/setFocusedCurrency';
import { parseFormattedNumber } from './parseFormattedNumber';

const formatInputValue = (
    value: number,
    currencyCode: CurrencyCode | 'BTC',
    displayMode: BtcMode,
): string => {
    if (value === 0) {
        return '';
    }

    if (currencyCode === 'BTC') {
        return displayMode === 'btc'
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
    readonly mode: BtcMode;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
};

export type CurrencyInputDep = {
    CurrencyInput: FC<CurrencyInputOwnProps>;
};

export const CurrencyInputPure = (
    deps: SetFocusedCurrencyDep,
    {
        mode,
        focusedCurrency,
        value,
        code,
        onChange,
    }: CurrencyInputStateProps & CurrencyInputOwnProps,
) => {
    const [inputValue, setInputValue] = useState(() => formatInputValue(value, code, mode));

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
                mode === 'btc' && code === 'BTC'
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
            size="large"
            className="minimalist-input-with-small-placeholder"
        />
    );
};
