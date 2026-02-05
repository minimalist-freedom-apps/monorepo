import type { CurrencyCode } from '@evolu/common';
import { useQuery } from '@evolu/react';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount } from '@minimalistic-apps/fiat';
import type React from 'react';
import type { RecalculateFromBtcDep } from '../../converter/recalculateFromBtc';
import type { RecalculateFromCurrencyDep } from '../../converter/recalculateFromCurrency';
import {
    selectSatsAmount,
    selectSelectedFiatCurrenciesAmounts,
} from '../../state/createStore';
import type { GetSelectedCurrenciesDep } from '../../state/evolu/getSelectedCurrencies';
import type { RemoveCurrencyDep } from '../../state/removeCurrency';
import type { AddCurrencyButtonDep } from '../AddCurrencyScreen/AddCurrencyButton';
import { RatesLoading } from '../RatesLoading';
import type { CurrencyRowDep } from './CurrencyFiatRow';

type ConverterScreenDeps = RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    GetSelectedCurrenciesDep &
    RemoveCurrencyDep &
    AddCurrencyButtonDep &
    CurrencyRowDep;

type ConverterScreen = React.FC;

export type ConverterScreenDep = { ConverterScreen: ConverterScreen };

export const createConverterScreen =
    (deps: ConverterScreenDeps): ConverterScreen =>
    () => {
        const currencies = useQuery(deps.getSelectedCurrencies.query);
        const selectedCurrencies = currencies.flatMap(row =>
            row.currency === null ? [] : [row.currency],
        );

        const satsAmount = useStore(selectSatsAmount);
        const currencyValues = useStore(selectSelectedFiatCurrenciesAmounts);

        const handleBtcChange = (value: AmountSats) => {
            deps.store.setState({ satsAmount: value });
            deps.recalculateFromBtc();
        };

        const handleCurrencyChange = (code: CurrencyCode, value: number) => {
            const fiatAmount = FiatAmount(code).from(value);

            deps.store.setState({
                fiatAmounts: {
                    ...currencyValues,
                    [code]: value,
                },
            });
            deps.recalculateFromCurrency({ code, value: fiatAmount });
        };

        return (
            <Screen gap={12}>
                <RatesLoading />
                <deps.CurrencyRow
                    key="BTC"
                    code="BTC"
                    value={satsAmount}
                    onChange={(value: number) =>
                        handleBtcChange(value as AmountSats)
                    }
                />

                {selectedCurrencies.map((code: CurrencyCode) => (
                    <deps.CurrencyRow
                        key={code}
                        code={code}
                        value={currencyValues[code] ?? 0}
                        onChange={(value: number) =>
                            handleCurrencyChange(code, value)
                        }
                        onRemove={() => deps.removeCurrency({ code })}
                    />
                ))}

                <deps.AddCurrencyButton />
            </Screen>
        );
    };
