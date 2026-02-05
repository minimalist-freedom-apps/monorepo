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
import { useEffect, useState } from 'react';
import { useDeps } from '../../ServicesProvider';
import {
    selectFocusedCurrency,
    selectMode,
    useStore,
} from '../../state/createStore';
import type { Mode } from '../../state/State';
import { parseFormattedNumber } from './parseFormattedNumber';

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

export const CurrencyInput = ({
    value,
    code,
    onChange,
}: CurrencyInputProps) => {
    const mode = useStore(selectMode);
    const focusedCurrency = useStore(selectFocusedCurrency);
    const { store } = useDeps();

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
        store.setState({ focusedCurrency: code });
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
