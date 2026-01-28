import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    getTimeAgo,
    loadFromLocalStorage,
    parseFormattedNumber,
    saveToLocalStorage,
} from '@minimalistic-apps/utils';
import { useEffect, useRef, useState } from 'react';
import { createCompositionRoot } from '../createCompositionRoot';
import type { CurrencyCode, CurrencyRate, RatesMap } from '../rates/FetchRates';
import { AddCurrencyButton } from './AddCurrencyButton';
import { AddCurrencyModal } from './AddCurrencyModal';
import { AppHeader } from './AppHeader';
import { AppLayout } from './AppLayout';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyInputRow } from './CurrencyInputRow';
import { StatusDisplay } from './StatusDisplay';

const { fetchAverageRates } = createCompositionRoot();

const STORAGE_KEYS = {
    RATES: 'rates',
    TIMESTAMP: 'timestamp',
    SELECTED_CURRENCIES: 'selectedCurrencies',
    MODE: 'mode',
} as const;

type Mode = 'BTC' | 'Sats';

export const App = () => {
    const [rates, setRates] = useState<RatesMap>({} as RatesMap);
    const [selectedCurrencies, setSelectedCurrencies] = useState<
        CurrencyCode[]
    >([]);
    const [btcValue, setBtcValue] = useState<string>('');
    const [currencyValues, setCurrencyValues] = useState<
        Record<CurrencyCode, string>
    >({} as Record<CurrencyCode, string>);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [timeAgo, setTimeAgo] = useState<string>('');
    const [mode, setMode] = useState<Mode>('BTC');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [focusedInput, setFocusedInput] = useState<CurrencyCode | 'BTC'>(
        'BTC',
    );
    const intervalRef = useRef<number | null>(null);

    // Load saved data on mount
    useEffect(() => {
        const savedRates = loadFromLocalStorage<RatesMap>(STORAGE_KEYS.RATES);
        const savedTimestamp = loadFromLocalStorage<number>(
            STORAGE_KEYS.TIMESTAMP,
        );
        const savedCurrencies = loadFromLocalStorage<CurrencyCode[]>(
            STORAGE_KEYS.SELECTED_CURRENCIES,
        );
        const savedMode = loadFromLocalStorage<Mode>(STORAGE_KEYS.MODE, 'BTC');

        if (savedRates) {
            setRates(savedRates);
        }

        if (savedTimestamp) {
            setLastUpdated(savedTimestamp);
        }

        if (savedCurrencies && savedCurrencies.length > 0) {
            setSelectedCurrencies(savedCurrencies);
        } else {
            // Default to USD
            setSelectedCurrencies(['USD' as CurrencyCode]);
        }

        setMode(savedMode || 'BTC');

        // Fetch rates on mount
        fetchRates();
    }, []);

    // Update time ago every second
    useEffect(() => {
        if (lastUpdated) {
            const updateTime = () => {
                setTimeAgo(getTimeAgo(lastUpdated));
            };
            updateTime();
            intervalRef.current = setInterval(updateTime, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [lastUpdated]);

    // Fetch rates from APIs
    const fetchRates = async () => {
        setLoading(true);
        setError('');

        const result = await fetchAverageRates();
        if (!result.ok) {
            setError('Failed to fetch rates. Please try again.');
            setLoading(false);
            return;
        }

        const fetchedRates = result.value;
        setRates(fetchedRates);
        const now = Date.now();
        setLastUpdated(now);

        // Save to localStorage
        saveToLocalStorage(STORAGE_KEYS.RATES, fetchedRates);
        saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, now);

        // Recalculate values with new rates
        if (btcValue) {
            recalculateFromBtc(btcValue, fetchedRates);
        }

        setLoading(false);
    };

    // Recalculate all values from BTC input
    const recalculateFromBtc = (
        value: string,
        currentRates: RatesMap = rates,
    ) => {
        const btcAmount = parseFormattedNumber(value);
        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            setCurrencyValues({});
            return;
        }

        const newValues = selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, code) => {
                if (currentRates[code]) {
                    const fiatAmount = btcAmount / currentRates[code].rate;
                    acc[code] = formatFiatWithCommas(fiatAmount);
                }
                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );
        setCurrencyValues(newValues);
    };

    // Recalculate all values from a currency input
    const recalculateFromCurrency = (code: CurrencyCode, value: string) => {
        const fiatAmount = parseFormattedNumber(value);
        if (Number.isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
            setBtcValue('');
            setCurrencyValues({} as Record<CurrencyCode, string>);
            return;
        }

        const btcAmount = fiatAmount * rates[code].rate;
        const formattedBtc =
            mode === 'BTC'
                ? formatBtcWithCommas(btcAmount)
                : formatSats(btcToSats(btcAmount));
        setBtcValue(formattedBtc);

        // Update other currencies
        const newValues = selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, otherCode) => {
                if (otherCode !== code && rates[otherCode]) {
                    const otherFiatAmount = btcAmount / rates[otherCode].rate;
                    acc[otherCode] = formatFiatWithCommas(otherFiatAmount);
                } else if (otherCode === code) {
                    acc[otherCode] = value;
                }
                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );
        setCurrencyValues(newValues);
    };

    // Handle BTC/Sats input change
    const handleBtcChange = (value: string) => {
        setBtcValue(value);
        setFocusedInput('BTC');

        let btcAmount: number;
        if (mode === 'Sats') {
            const sats = parseFormattedNumber(value);
            btcAmount = satsToBtc(sats);
        } else {
            btcAmount = parseFormattedNumber(value);
        }

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            setCurrencyValues({});
            return;
        }

        recalculateFromBtc(formatBtcWithCommas(btcAmount));
    };

    // Handle currency input change
    const handleCurrencyChange = (code: CurrencyCode, value: string) => {
        setFocusedInput(code);
        setCurrencyValues(prev => ({ ...prev, [code]: value }));
        recalculateFromCurrency(code, value);
    };

    // Add currency to list
    const addCurrency = (code: CurrencyCode) => {
        if (!selectedCurrencies.includes(code)) {
            const newCurrencies = [...selectedCurrencies, code];
            setSelectedCurrencies(newCurrencies);
            saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);

            // Calculate value for new currency if BTC has a value
            if (btcValue) {
                const btcAmount =
                    mode === 'Sats'
                        ? satsToBtc(parseFormattedNumber(btcValue))
                        : parseFormattedNumber(btcValue);

                if (rates[code]) {
                    const fiatAmount = btcAmount / rates[code].rate;
                    setCurrencyValues(prev => ({
                        ...prev,
                        [code]: formatFiatWithCommas(fiatAmount),
                    }));
                }
            }
        }
        setShowModal(false);
    };

    // Remove currency from list
    const removeCurrency = (code: CurrencyCode) => {
        const newCurrencies = selectedCurrencies.filter(c => c !== code);
        setSelectedCurrencies(newCurrencies);
        saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);

        const { [code]: _, ...newValues } = currencyValues;
        setCurrencyValues(newValues as Record<CurrencyCode, string>);
    };

    // Toggle between BTC and Sats mode
    const toggleMode = () => {
        const newMode: Mode = mode === 'BTC' ? 'Sats' : 'BTC';
        setMode(newMode);
        saveToLocalStorage(STORAGE_KEYS.MODE, newMode);

        // Convert current BTC value
        if (btcValue) {
            const currentValue = parseFormattedNumber(btcValue);
            if (newMode === 'Sats') {
                const btcAmount =
                    mode === 'BTC' ? currentValue : satsToBtc(currentValue);
                setBtcValue(formatSats(btcToSats(btcAmount)));
            } else {
                const btcAmount =
                    mode === 'Sats' ? satsToBtc(currentValue) : currentValue;
                setBtcValue(formatBtcWithCommas(btcAmount));
            }
        }
    };

    // Prepare available currencies for modal
    const availableCurrencies = (
        Object.entries(rates) as [CurrencyCode, CurrencyRate][]
    )
        .filter(([code]) => !selectedCurrencies.includes(code))
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([code, info]) => ({ code, name: info.name }));

    return (
        <AppLayout
            header={
                <AppHeader
                    title="Price Converter"
                    onRefresh={fetchRates}
                    loading={loading}
                    mode={mode}
                    onModeToggle={toggleMode}
                />
            }
        >
            <StatusDisplay
                loading={loading}
                error={error}
                timeAgo={timeAgo || 'Never updated'}
            />

            <CurrencyInput
                label={mode}
                value={btcValue}
                onChange={handleBtcChange}
                focused={focusedInput === 'BTC'}
                onFocus={() => setFocusedInput('BTC')}
            />

            <div>
                {selectedCurrencies.map(code => (
                    <CurrencyInputRow
                        key={code}
                        code={code}
                        name={rates[code]?.name}
                        value={currencyValues[code] || ''}
                        onChange={value => handleCurrencyChange(code, value)}
                        onRemove={() => removeCurrency(code)}
                        focused={focusedInput === code}
                        onFocus={() => setFocusedInput(code)}
                    />
                ))}
            </div>

            <AddCurrencyButton onClick={() => setShowModal(true)} />

            <AddCurrencyModal
                open={showModal}
                currencies={availableCurrencies}
                onAdd={code => addCurrency(code as CurrencyCode)}
                onClose={() => setShowModal(false)}
            />
        </AppLayout>
    );
};
