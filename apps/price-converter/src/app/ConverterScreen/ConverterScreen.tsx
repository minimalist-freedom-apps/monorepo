import type { CurrencyCode } from '@evolu/common';
import type { AmountSats } from '@minimalist-apps/bitcoin';
import { type ReorderEvent, Screen, SortableList } from '@minimalist-apps/components';
import { FiatAmount } from '@minimalist-apps/fiat';
import type { FC } from 'react';
import type { ChangeBtcAmountDep } from '../../converter/changeBtcAmount';
import type { ChangeFiatAmountDep } from '../../converter/changeFiatAmount';
import type { RemoveCurrencyDep } from '../../converter/removeCurrency';
import type { ReorderCurrencyDep } from '../../converter/reorderCurrency';
import type { SelectedCurrency } from '../../state/SelectedCurrency/SelectedCurrency';
import type { CurrencyValues } from '../../state/State';
import type { AddCurrencyButtonDep } from '../AddCurrencyScreen/AddCurrencyButton';
import type { RatesLoadingDep } from '../RatesLoading';
import type { CurrencyRowDep } from './CurrencyFiatRow';

type ConverterScreenStateProps = {
    readonly satsAmount: AmountSats;
    readonly fiatAmounts: Readonly<CurrencyValues>;
    readonly selectedCurrencies: ReadonlyArray<SelectedCurrency>;
};

type ConverterScreenDeps = ChangeBtcAmountDep &
    ChangeFiatAmountDep &
    RemoveCurrencyDep &
    ReorderCurrencyDep &
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

    const handleReorder = async (event: ReorderEvent) => {
        await deps.reorderCurrency({
            active: event.activeId as CurrencyCode,
            over: event.overId as CurrencyCode,
        });
    };

    const sortableItems = selectedCurrencies.map(c => ({ ...c, id: c.code }));

    return (
        <Screen gap={12}>
            <deps.RatesLoading />
            <deps.CurrencyRow
                key="BTC"
                code="BTC"
                value={satsAmount}
                onChange={(value: number) => handleBtcChange(value as AmountSats)}
            />

            <SortableList
                items={sortableItems}
                onReorder={handleReorder}
                renderItem={item => (
                    <deps.CurrencyRow
                        code={item.code}
                        value={fiatAmounts[item.code] ?? 0}
                        onChange={(value: number) => handleFiatChange(item.code, value)}
                        onRemove={() => deps.removeCurrency({ code: item.code })}
                    />
                )}
            />

            <deps.AddCurrencyButton />
        </Screen>
    );
};
