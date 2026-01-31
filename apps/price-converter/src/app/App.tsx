import { formatBtcWithCommas, satsToBtc } from '@minimalistic-apps/bitcoin';
import { getTimeAgo, parseFormattedNumber } from '@minimalistic-apps/utils';
import { useEffect, useRef, useState } from 'react';
import { createCompositionRoot } from '../createCompositionRoot';
import type { CurrencyCode, CurrencyRate } from '../rates/FetchRates';
import { AddCurrencyButton } from './AddCurrencyButton';
import { AddCurrencyModal } from './AddCurrencyModal';
import { AppLayout } from './AppLayout';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyInputRow } from './CurrencyInputRow';
import { StatusDisplay } from './StatusDisplay';
import {
    selectBtcValue,
    selectCurrencyValues,
    selectError,
    selectFocusedInput,
    selectLastUpdated,
    selectLoading,
    selectMode,
    selectRates,
    selectSelectedCurrencies,
    selectShowModal,
    useStore,
    useStoreActions,
} from './state';

const { fetchAverageRates } = createCompositionRoot();

export const App = () => {
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedCurrencies);
    const btcValue = useStore(selectBtcValue);
    const currencyValues = useStore(selectCurrencyValues);
    const loading = useStore(selectLoading);
    const error = useStore(selectError);
    const lastUpdated = useStore(selectLastUpdated);
    const mode = useStore(selectMode);
    const showModal = useStore(selectShowModal);
    const focusedInput = useStore(selectFocusedInput);

    const actions = useStoreActions();

    // Local state for time ago (updates every second)
    const [timeAgo, setTimeAgo] = useState<string>('');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
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
        actions.setLoading(true);
        actions.setError('');

        const result = await fetchAverageRates();
        if (!result.ok) {
            actions.setError('Failed to fetch rates. Please try again.');
            actions.setLoading(false);
            return;
        }

        const fetchedRates = result.value;
        const now = Date.now();
        actions.setRates({ rates: fetchedRates, timestamp: now });

        // Recalculate values with new rates
        if (btcValue) {
            actions.recalculateFromBtc({
                value: btcValue,
                rates: fetchedRates,
            });
        }

        actions.setLoading(false);
    };

    // Handle BTC/Sats input change
    const handleBtcChange = (value: string) => {
        actions.setBtcValue(value);
        actions.setFocusedInput('BTC');

        let btcAmount: number;
        if (mode === 'Sats') {
            const sats = parseFormattedNumber(value);
            btcAmount = satsToBtc(sats);
        } else {
            btcAmount = parseFormattedNumber(value);
        }

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            actions.setCurrencyValues({} as Record<CurrencyCode, string>);
            return;
        }

        actions.recalculateFromBtc({ value: formatBtcWithCommas(btcAmount) });
    };

    // Handle currency input change
    const handleCurrencyChange = (code: CurrencyCode, value: string) => {
        actions.setFocusedInput(code);
        actions.setCurrencyValues({ ...currencyValues, [code]: value });
        actions.recalculateFromCurrency({ code, value });
    };

    // Prepare available currencies for modal
    const availableCurrencies = (
        Object.entries(rates) as [CurrencyCode, CurrencyRate][]
    )
        .filter(([code]) => !selectedCurrencies.includes(code))
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([code, info]) => ({ code, name: info.name }));

    return (
        <AppLayout>
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
                onFocus={() => actions.setFocusedInput('BTC')}
            />

            <div>
                {selectedCurrencies.map(code => (
                    <CurrencyInputRow
                        key={code}
                        code={code}
                        name={rates[code]?.name}
                        value={currencyValues[code] || ''}
                        onChange={value => handleCurrencyChange(code, value)}
                        onRemove={() => actions.removeCurrency({ code })}
                        focused={focusedInput === code}
                        onFocus={() => actions.setFocusedInput(code)}
                    />
                ))}
            </div>

            <AddCurrencyButton onClick={() => actions.setShowModal(true)} />

            <AddCurrencyModal
                open={showModal}
                currencies={availableCurrencies}
                onAdd={code =>
                    actions.addCurrency({ code: code as CurrencyCode })
                }
                onClose={() => actions.setShowModal(false)}
            />
        </AppLayout>
    );
};
