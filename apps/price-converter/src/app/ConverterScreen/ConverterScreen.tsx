import { type CurrencyCode, getOrThrow } from '@evolu/common';
import {
    AmountBtc,
    AmountSats,
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount, formatFiatWithCommas } from '@minimalistic-apps/fiat';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import { useServices } from '../../ServicesProvider';
import {
    selectFocusedInput,
    selectMode,
    selectRates,
    selectSatsValue,
    selectSelectedFiatCurrencies,
    selectSelectedFiatCurrenciesAmounts,
    useStore,
} from '../../state/createStore';
import { AddCurrencyButton } from '../AddCurrencyScreen/AddCurrencyButton';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyInputRow } from './CurrencyInputRow';

export const ConverterScreen = () => {
    const services = useServices();
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedFiatCurrencies);
    const satsValue = useStore(selectSatsValue);
    const currencyValues = useStore(selectSelectedFiatCurrenciesAmounts);
    const mode = useStore(selectMode);
    const focusedInput = useStore(selectFocusedInput);

    const handleBtcChange = (value: string) => {
        const numberValue = parseFormattedNumber(value);

        if (Number.isNaN(numberValue)) {
            return;
        }

        const satsValue =
            mode === 'Sats'
                ? getOrThrow(AmountSats.from(numberValue))
                : btcToSats(getOrThrow(AmountBtc.from(numberValue)));

        services.store.setState({ satsAmount: satsValue });
        services.store.setState({ focusedInput: 'BTC' });

        services.recalculateFromBtc();
    };

    const handleCurrencyChange = (code: CurrencyCode, value: string) => {
        const fiatAmountNumber = parseFormattedNumber(value);
        const fiatAmount = FiatAmount(code).from(fiatAmountNumber);

        services.store.setState({ focusedInput: code });
        services.store.setState({
            selectedFiatCurrenciesAmounts: {
                ...currencyValues,
                [code]: value,
            },
        });
        services.recalculateFromCurrency({ code, value: fiatAmount });
    };

    const bitcoinFormatted =
        mode === 'BTC'
            ? formatBtcWithCommas(satsToBtc(satsValue))
            : formatSats(satsValue);

    return (
        <Screen>
            <CurrencyInput
                label={mode}
                value={bitcoinFormatted}
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
                        value={formatFiatWithCommas(currencyValues[code]) || ''}
                        onChange={value => handleCurrencyChange(code, value)}
                        onRemove={() => services.removeCurrency({ code })}
                        focused={focusedInput === code}
                        onFocus={() =>
                            services.store.setState({ focusedInput: code })
                        }
                    />
                ))}
            </div>

            <AddCurrencyButton />
        </Screen>
    );
};
