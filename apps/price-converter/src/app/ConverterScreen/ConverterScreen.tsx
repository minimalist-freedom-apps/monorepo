import type { CurrencyCode } from '@evolu/common';
import { useQuery } from '@evolu/react';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount } from '@minimalistic-apps/fiat';
import { useServices } from '../../ServicesProvider';
import {
    selectSatsAmount,
    selectSelectedFiatCurrenciesAmounts,
    useStore,
} from '../../state/createStore';
import { AddCurrencyButton } from '../AddCurrencyScreen/AddCurrencyButton';
import { RatesLoading } from '../RatesLoading';
import { CurrencyRow } from './CurrencyFiatRow';

export const ConverterScreen = () => {
    const services = useServices();

    const currencies = useQuery(services.getSelectedCurrencies.query);
    const selectedCurrencies = currencies.flatMap(row =>
        row.currency === null ? [] : [row.currency],
    );

    const satsAmount = useStore(selectSatsAmount);
    const currencyValues = useStore(selectSelectedFiatCurrenciesAmounts);

    const handleBtcChange = (value: AmountSats) => {
        services.store.setState({ satsAmount: value });
        services.recalculateFromBtc();
    };

    const handleCurrencyChange = (code: CurrencyCode, value: number) => {
        const fiatAmount = FiatAmount(code).from(value);

        services.store.setState({
            fiatAmounts: {
                ...currencyValues,
                [code]: value,
            },
        });
        services.recalculateFromCurrency({ code, value: fiatAmount });
    };

    return (
        <Screen gap={12}>
            <RatesLoading />
            <CurrencyRow
                key="BTC"
                code="BTC"
                value={satsAmount}
                onChange={value => handleBtcChange(value as AmountSats)}
            />

            {selectedCurrencies.map((code: CurrencyCode) => (
                <CurrencyRow
                    key={code}
                    code={code}
                    value={currencyValues[code] ?? 0}
                    onChange={value => handleCurrencyChange(code, value)}
                    onRemove={() => services.removeCurrency({ code })}
                />
            ))}

            <AddCurrencyButton />
        </Screen>
    );
};
