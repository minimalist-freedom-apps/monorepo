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
import { isValidNumberInput, parseFormattedNumber, stripCommas } from '@minimalist-apps/number';
import { type FC, useEffect, useRef, useState } from 'react';
import type { BtcMode } from '../../state/State';
import type { SetFocusedCurrencyDep } from '../../state/setFocusedCurrency';
import { normalizeBtcInput } from './normalizeBtcInput';

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

const isZeroInput = (value: string): boolean => stripCommas(value).trim() === '0';

const isInvalidTrailingCommaZeroInput = (value: string): boolean => /^0,+$/.test(value.trim());

const isIncompleteNumberInput = (value: string): boolean => {
    const normalizedValue = value.trim();

    return normalizedValue === '' || normalizedValue === '-' || normalizedValue.endsWith('.');
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
            const normalizedBtcValue = normalizeBtcInput(newValue);
            const parsedBtcValue = parseFormattedNumber(normalizedBtcValue.numeric);

            setInputValue(normalizedBtcValue.display);
            persistedStableInputByCurrencyAndMode.set(
                getPersistedInputKey(code, mode),
                normalizedBtcValue.display,
            );

            if (!Number.isNaN(parsedBtcValue)) {
                onChange(btcToSats(parsedBtcValue as AmountBtc));
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
