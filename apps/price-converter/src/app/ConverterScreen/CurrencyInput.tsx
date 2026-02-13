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
import { isValidNumberInput } from '@minimalist-apps/number';
import { type FC, useEffect, useRef, useState } from 'react';
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

const isZeroInput = (value: string): boolean => value.replace(/,/g, '').trim() === '0';

const isInvalidTrailingCommaZeroInput = (value: string): boolean => /^0,+$/.test(value.trim());

const isIncompleteNumberInput = (value: string): boolean => {
    const normalizedValue = value.trim();

    return normalizedValue === '' || normalizedValue === '-' || normalizedValue.endsWith('.');
};

const limitBtcDecimalDigits = (decimals: string): string => {
    let result = decimals;

    while (result.length > 8) {
        const duplicateIndex = result.search(/(\d)\1/u);

        if (duplicateIndex >= 0) {
            result = result.slice(0, duplicateIndex + 1) + result.slice(duplicateIndex + 2);
        } else {
            result = result.slice(0, -1);
        }
    }

    return result;
};

const formatGroupedBtcDecimal = (decimals: string): string => {
    const paddedDecimals = decimals.padEnd(8, '0');
    let groupedDecimalPart = '';
    let count = 0;

    for (let i = paddedDecimals.length - 1; i >= 0; i--) {
        if (count === 3 && i < paddedDecimals.length - 1) {
            groupedDecimalPart = `,${groupedDecimalPart}`;
            count = 0;
        }

        groupedDecimalPart = paddedDecimals[i] + groupedDecimalPart;
        count++;
    }

    while (groupedDecimalPart.endsWith(',000')) {
        groupedDecimalPart = groupedDecimalPart.slice(0, -4);
    }

    return groupedDecimalPart.replace(/0+$/u, '').replace(/,+$/u, '');
};

const normalizeBtcModeInput = (value: string): { display: string; numeric: string } => {
    const normalized = value.trim().replace(/,/g, '');
    const isNegative = normalized.startsWith('-');
    const unsigned = isNegative ? normalized.slice(1) : normalized;
    const [rawIntPart, rawDecimalPart] = unsigned.split('.');
    const intPart = rawIntPart.replace(/^0+(?=\d)/u, '');
    const intPartWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (!rawDecimalPart) {
        const display = `${isNegative ? '-' : ''}${intPartWithCommas}`;

        return { display, numeric: `${isNegative ? '-' : ''}${intPart}` };
    }

    const limitedDecimalPart = limitBtcDecimalDigits(rawDecimalPart);
    const groupedDecimalPart = formatGroupedBtcDecimal(limitedDecimalPart);
    const display =
        groupedDecimalPart === ''
            ? `${isNegative ? '-' : ''}${intPartWithCommas}`
            : `${isNegative ? '-' : ''}${intPartWithCommas}.${groupedDecimalPart}`;
    const numeric =
        limitedDecimalPart === ''
            ? `${isNegative ? '-' : ''}${intPart}`
            : `${isNegative ? '-' : ''}${intPart}.${limitedDecimalPart}`;

    return { display, numeric };
};

const persistedStableInputByCurrencyAndMode = new Map<string, string>();

const getPersistedInputKey = (currencyCode: CurrencyCode | 'BTC', displayMode: BtcMode): string =>
    `${currencyCode}:${displayMode}`;

export type CurrencyInputOwnProps = {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
};

export type CurrencyInputStateProps = {
    readonly mode: BtcMode;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
};

export type CurrencyInputProps = CurrencyInputOwnProps & CurrencyInputStateProps;

export type CurrencyInputDep = {
    CurrencyInput: FC<CurrencyInputOwnProps>;
};

export type CurrencyInputPureDeps = SetFocusedCurrencyDep;

export const CurrencyInputPure = (
    deps: CurrencyInputPureDeps,
    { mode, focusedCurrency, value, code, onChange }: CurrencyInputProps,
) => {
    const [inputValue, setInputValue] = useState(() => {
        const formattedValue = formatInputValue(value, code, mode);

        if (formattedValue !== '' || focusedCurrency === code) {
            return formattedValue;
        }

        const persistedInputValue = persistedStableInputByCurrencyAndMode.get(
            getPersistedInputKey(code, mode),
        );

        return persistedInputValue ?? formattedValue;
    });
    const previousModeRef = useRef(mode);
    const previousValueRef = useRef(value);
    const previousFocusedCurrencyRef = useRef(focusedCurrency);

    useEffect(() => {
        const modeChanged = previousModeRef.current !== mode;
        const valueChanged = previousValueRef.current !== value;
        const lostFocus =
            previousFocusedCurrencyRef.current === code &&
            focusedCurrency !== code &&
            focusedCurrency !== null;
        const formattedValue = formatInputValue(value, code, mode);
        const persistedInputValue = persistedStableInputByCurrencyAndMode.get(
            getPersistedInputKey(code, mode),
        );

        previousModeRef.current = mode;
        previousValueRef.current = value;
        previousFocusedCurrencyRef.current = focusedCurrency;

        // Prevent overwriting input while user is typing unless mode changed.
        if (!modeChanged && focusedCurrency === code) {
            return;
        }

        if (lostFocus && !valueChanged && !isIncompleteNumberInput(inputValue)) {
            return;
        }

        if (
            !modeChanged &&
            !valueChanged &&
            focusedCurrency !== code &&
            formattedValue === '' &&
            persistedInputValue !== undefined &&
            inputValue === persistedInputValue
        ) {
            return;
        }

        setInputValue(formattedValue);
    }, [value, code, mode, focusedCurrency, inputValue]);

    const handleChange = (newValue: string) => {
        if (!isValidNumberInput(newValue)) {
            return;
        }

        if (isInvalidTrailingCommaZeroInput(newValue)) {
            setInputValue('0');
            persistedStableInputByCurrencyAndMode.set(getPersistedInputKey(code, mode), '0');
            onChange(0);

            return;
        }

        if (isIncompleteNumberInput(newValue)) {
            setInputValue(newValue);

            if (newValue === '-' || newValue === '') {
                persistedStableInputByCurrencyAndMode.delete(getPersistedInputKey(code, mode));
            }

            return;
        }

        if (isZeroInput(newValue)) {
            setInputValue(newValue);
            persistedStableInputByCurrencyAndMode.set(getPersistedInputKey(code, mode), newValue);
        }

        const numberValue = parseFormattedNumber(newValue);

        if (code === 'BTC' && mode === 'btc' && !isZeroInput(newValue)) {
            const normalizedBtcInput = normalizeBtcModeInput(newValue);
            const normalizedBtcValue = parseFormattedNumber(normalizedBtcInput.numeric);

            setInputValue(normalizedBtcInput.display);
            persistedStableInputByCurrencyAndMode.set(
                getPersistedInputKey(code, mode),
                normalizedBtcInput.display,
            );

            if (!Number.isNaN(normalizedBtcValue)) {
                onChange(btcToSats(normalizedBtcValue as AmountBtc));
            }

            return;
        }

        if (!isZeroInput(newValue)) {
            const formattedValue = formatInputValue(numberValue, code, mode);

            setInputValue(formattedValue);
            persistedStableInputByCurrencyAndMode.set(
                getPersistedInputKey(code, mode),
                formattedValue,
            );
        }

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
            label={`${code} amount`}
            monospace
            size="large"
            className="minimalist-input-with-small-placeholder"
        />
    );
};
