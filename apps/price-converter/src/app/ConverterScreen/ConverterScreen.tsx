import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount } from '@minimalistic-apps/fiat';
import { useServices } from '../../ServicesProvider';
import {
    selectRates,
    selectSatsAmount,
    selectSelectedFiatCurrencies,
    selectSelectedFiatCurrenciesAmounts,
    useStore,
} from '../../state/createStore';
import { AddCurrencyButton } from '../AddCurrencyScreen/AddCurrencyButton';
import { CurrencyFiatRow } from './CurrencyFiatRow';
import { CurrencyInput } from './CurrencyInput';

export const ConverterScreen = () => {
    const services = useServices();
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedFiatCurrencies);
    const satsAmount = useStore(selectSatsAmount);
    const currencyValues = useStore(selectSelectedFiatCurrenciesAmounts);

    const handleBtcChange = (value: AmountSats) => {
        services.store.setState({ satsAmount: value });
        services.recalculateFromBtc();
    };

    const handleCurrencyChange = (code: CurrencyCode, value: number) => {
        const fiatAmount = FiatAmount(code).from(value);

        services.store.setState({
            selectedFiatCurrenciesAmounts: {
                ...currencyValues,
                [code]: value,
            },
        });
        services.recalculateFromCurrency({ code, value: fiatAmount });
    };

    return (
        <Screen>
            <CurrencyInput
                value={satsAmount}
                onChange={value => handleBtcChange(value as AmountSats)}
                code="BTC"
            />

            <div>
                {selectedCurrencies.map(code => (
                    <CurrencyFiatRow
                        key={code}
                        code={code}
                        name={rates[code]?.name}
                        value={currencyValues[code] ?? 0}
                        onChange={value => handleCurrencyChange(code, value)}
                        onRemove={() => services.removeCurrency({ code })}
                    />
                ))}
            </div>

            <AddCurrencyButton />
        </Screen>
    );
};
