import { formatBtcWithCommas, satsToBtc } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import { useServices } from '../../ServicesProvider';
import type { CurrencyCode } from '../../rates/FetchRates';
import {
    selectBtcValue,
    selectCurrencyValues,
    selectFocusedInput,
    selectMode,
    selectRates,
    selectSelectedCurrencies,
    useStore,
} from '../../state/createStore';
import { AddCurrencyButton } from '../AddCurrencyScreen/AddCurrencyButton';
import { RatesLoading } from '../RatesLoading';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyInputRow } from './CurrencyInputRow';

export const ConverterScreen = () => {
    const services = useServices();
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedCurrencies);
    const btcValue = useStore(selectBtcValue);
    const currencyValues = useStore(selectCurrencyValues);
    const mode = useStore(selectMode);
    const focusedInput = useStore(selectFocusedInput);

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

    const handleCurrencyChange = (code: CurrencyCode, value: string) => {
        services.store.setState({ focusedInput: code });
        services.store.setState({
            currencyValues: { ...currencyValues, [code]: value },
        });
        services.recalculateFromCurrency({ code, value });
    };

    return (
        <Screen>
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
                onClick={() =>
                    services.store.setState({ currentScreen: 'AddCurrency' })
                }
            />
        </Screen>
    );
};
