import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import { Screen } from '@minimalistic-apps/components';
import { FiatAmount } from '@minimalistic-apps/fiat';
import type { FC } from 'react';
import type { ChangeBtcAmountDep } from '../../converter/changeBtcAmount';
import type { ChangeFiatAmountDep } from '../../converter/changeFiatAmount';
import type { RemoveCurrencyDep } from '../../converter/removeCurrency';
import type { CurrencyValues } from '../../state/State';
import type { AddCurrencyButtonDep } from '../AddCurrencyScreen/AddCurrencyButton';
import type { RatesLoadingDep } from '../RatesLoading';
import type { CurrencyRowDep } from './CurrencyFiatRow';

export type ConverterScreenStateProps = {
    readonly satsAmount: AmountSats;
    readonly fiatAmounts: Readonly<CurrencyValues>;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
};

type ConverterScreenDeps = ChangeBtcAmountDep &
    ChangeFiatAmountDep &
    RemoveCurrencyDep &
    AddCurrencyButtonDep &
    CurrencyRowDep &
    RatesLoadingDep;

export type ConverterScreenDep = { ConverterScreen: FC };

export const ConverterScreenPure = (
    deps: ConverterScreenDeps,
    { satsAmount, fiatAmounts, selectedCurrencies }: ConverterScreenStateProps,
) => {
    const handleBtcChange = (value: AmountSats) => {
        deps.changeBtcAmount(value);
    };

    const handleFiatChange = (code: CurrencyCode, value: number) => {
        deps.changeFiatAmount({ code, value: FiatAmount(code).from(value) });
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
