import { formatBtcWithCommas, satsToBtc } from '@minimalistic-apps/bitcoin';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import { useServices } from '../ServicesProvider';
import type { CurrencyCode, CurrencyRate } from '../rates/FetchRates';
import { AddCurrencyButton } from './AddCurrencyButton';
import { AddCurrencyModal } from './AddCurrencyModal';
import { AppLayout } from './AppLayout';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyInputRow } from './CurrencyInputRow';
import { RatesLoading } from './RatesLoading';
import {
    selectBtcValue,
    selectCurrencyValues,
    selectFocusedInput,
    selectMode,
    selectRates,
    selectSelectedCurrencies,
    selectShowModal,
    useStore,
} from './state/createStore';

export const App = () => {
    const services = useServices();
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedCurrencies);
    const btcValue = useStore(selectBtcValue);
    const currencyValues = useStore(selectCurrencyValues);
    const mode = useStore(selectMode);
    const showModal = useStore(selectShowModal);
    const focusedInput = useStore(selectFocusedInput);

    // Handle BTC/Sats input change
    const handleBtcChange = (value: string) => {
        services.store.setState({ btcValue: value });
        services.store.setState({ focusedInput: 'BTC' });

        let btcAmount: number;
        if (mode === 'Sats') {
            const sats = parseFormattedNumber(value);
            btcAmount = satsToBtc(sats);
        } else {
            btcAmount = parseFormattedNumber(value);
        }

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            services.store.setState({
                currencyValues: {} as Record<CurrencyCode, string>,
            });
            return;
        }

        services.recalculateFromBtc({ value: formatBtcWithCommas(btcAmount) });
    };

    // Handle currency input change
    const handleCurrencyChange = (code: CurrencyCode, value: string) => {
        services.store.setState({ focusedInput: code });
        services.store.setState({
            currencyValues: { ...currencyValues, [code]: value },
        });
        services.recalculateFromCurrency({ code, value });
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
            <RatesLoading />

            <CurrencyInput
                label={mode}
                value={btcValue}
                onChange={handleBtcChange}
                focused={focusedInput === 'BTC'}
                onFocus={() => services.store.setState({ focusedInput: 'BTC' })}
            />

            <div>
                {selectedCurrencies.map(code => (
                    <CurrencyInputRow
                        key={code}
                        code={code}
                        name={rates[code]?.name}
                        value={currencyValues[code] || ''}
                        onChange={value => handleCurrencyChange(code, value)}
                        onRemove={() => services.removeCurrency({ code })}
                        focused={focusedInput === code}
                        onFocus={() =>
                            services.store.setState({ focusedInput: code })
                        }
                    />
                ))}
            </div>

            <AddCurrencyButton
                onClick={() => services.store.setState({ showModal: true })}
            />

            <AddCurrencyModal
                open={showModal}
                currencies={availableCurrencies}
                onAdd={code =>
                    services.addCurrency({ code: code as CurrencyCode })
                }
                onClose={() => services.store.setState({ showModal: false })}
            />
        </AppLayout>
    );
};
