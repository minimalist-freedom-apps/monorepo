import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount } from '@minimalistic-apps/fiat';
import type { FC } from 'react';
import type { RecalculateFromBtcDep } from '../../converter/recalculateFromBtc';
import type { RecalculateFromCurrencyDep } from '../../converter/recalculateFromCurrency';
import type { RemoveCurrencyDep } from '../../converter/removeCurrency';
import type { CurrencyValues } from '../../state/State';
import type { SetFiatAmountDep } from '../../state/setFiatAmount';
import type { SetSatsAmountDep } from '../../state/setSatsAmount';
import type { AddCurrencyButtonDep } from '../AddCurrencyScreen/AddCurrencyButton';
import type { RatesLoadingDep } from '../RatesLoading';
import type { CurrencyRowDep } from './CurrencyFiatRow';

export type ConverterScreenStateProps = {
    readonly satsAmount: AmountSats;
    readonly fiatAmounts: Readonly<CurrencyValues>;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
};

type ConverterScreenDeps = RecalculateFromBtcDep &
    RecalculateFromCurrencyDep &
    RemoveCurrencyDep &
    SetSatsAmountDep &
    SetFiatAmountDep &
    AddCurrencyButtonDep &
    CurrencyRowDep &
    RatesLoadingDep;

export type ConverterScreenDep = { ConverterScreen: FC };

export const ConverterScreenPure = (
    deps: ConverterScreenDeps,
    { satsAmount, fiatAmounts, selectedCurrencies }: ConverterScreenStateProps,
) => {
    const handleBtcChange = (value: AmountSats) => {
        deps.setSatsAmount(value);
        deps.recalculateFromBtc();
    };

    const handleFiatChange = (code: CurrencyCode, value: number) => {
        const fiatAmount = FiatAmount(code).from(value);

        deps.setFiatAmount({ code, amount: fiatAmount });
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
                    value={fiatAmounts[code] ?? 0}
                    onChange={(value: number) => handleFiatChange(code, value)}
                    onRemove={() => deps.removeCurrency({ code })}
                />
            ))}

            <deps.AddCurrencyButton />
        </Screen>
    );
};
