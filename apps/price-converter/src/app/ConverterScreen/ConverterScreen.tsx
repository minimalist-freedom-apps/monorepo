import type { CurrencyCode } from '@evolu/common';
import { useQuery } from '@evolu/react';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/connect';
import { FiatAmount } from '@minimalistic-apps/fiat';
import type { RecalculateFromBtcDep } from '../../converter/recalculateFromBtc';
import type { RecalculateFromCurrencyDep } from '../../converter/recalculateFromCurrency';
import type { GetSelectedCurrenciesDep } from '../../state/evolu/getSelectedCurrencies';
import type { RemoveCurrencyDep } from '../../state/removeCurrency';
import type { CurrencyValues } from '../../state/State';
import type { AddCurrencyButtonDep } from '../AddCurrencyScreen/AddCurrencyButton';
import type { RatesLoadingDep } from '../RatesLoading';
import type { CurrencyRowDep } from './CurrencyFiatRow';

export type ConverterScreenStateProps = {
    readonly satsAmount: AmountSats;
    readonly currencyValues: Readonly<CurrencyValues>;
};

type SetSatsAmount = (satsAmount: AmountSats) => void;
type SetFiatAmounts = (fiatAmounts: Readonly<CurrencyValues>) => void;

type ConverterScreenDeps = RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    GetSelectedCurrenciesDep &
    RemoveCurrencyDep &
    AddCurrencyButtonDep &
    CurrencyRowDep &
    RatesLoadingDep & {
        readonly setSatsAmount: SetSatsAmount;
        readonly setFiatAmounts: SetFiatAmounts;
    };

export type ConverterScreenDep = { ConverterScreen: Connected };

export const ConverterScreenPure = (
    deps: ConverterScreenDeps,
    { satsAmount, currencyValues }: ConverterScreenStateProps,
) => {
    const currencies = useQuery(deps.getSelectedCurrencies.query);
    const selectedCurrencies = currencies.flatMap(row =>
        row.currency === null ? [] : [row.currency],
    );

    const handleBtcChange = (value: AmountSats) => {
        deps.setSatsAmount(value);
        deps.recalculateFromBtc();
    };

    const handleCurrencyChange = (code: CurrencyCode, value: number) => {
        const fiatAmount = FiatAmount(code).from(value);

        deps.setFiatAmounts({
            ...currencyValues,
            [code]: value,
        });
        deps.recalculateFromCurrency({ code, value: fiatAmount });
    };

    return (
        <Screen gap={12}>
            <deps.RatesLoading />
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
