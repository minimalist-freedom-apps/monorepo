import type { CurrencyCode } from '@evolu/common';
import {
    Button,
    List,
    Screen,
    SearchInput,
    Text,
} from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/connect';
import { typedObjectValues } from '@minimalistic-apps/type-utils';
import { useState } from 'react';
import type { CurrencyEntity, CurrencyMap } from '../../rates/FetchRates';
import type { AddCurrencyDep } from '../../state/addCurrency';

export type AddCurrencyScreenStateProps = {
    readonly rates: CurrencyMap;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
};

type SetCurrentScreen = (screen: 'Converter') => void;

type AddCurrencyScreenDeps = AddCurrencyDep & {
    readonly setCurrentScreen: SetCurrentScreen;
};

export type AddCurrencyScreenDep = {
    readonly AddCurrencyScreen: Connected;
};

export const AddCurrencyScreenPure = (
    deps: AddCurrencyScreenDeps,
    { rates, selectedCurrencies }: AddCurrencyScreenStateProps,
) => {
    const [searchTerm, setSearchTerm] = useState('');

    const availableCurrencies = typedObjectValues(rates)
        .filter(
            (it): it is CurrencyEntity =>
                it !== undefined && !selectedCurrencies.includes(it.code),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(it => ({ code: it.code, name: it.name }));

    const filteredCurrencies = !searchTerm
        ? availableCurrencies
        : availableCurrencies.filter(({ code, name }) => {
              const term = searchTerm.toLowerCase();

              return (
                  code.toLowerCase().includes(term) ||
                  name.toLowerCase().includes(term)
              );
          });

    const handleSelect = (code: string) => {
        deps.addCurrency({ code: code as CurrencyCode });
        deps.setCurrentScreen('Converter');
    };

    const handleBack = () => {
        deps.setCurrentScreen('Converter');
    };

    const listItems = filteredCurrencies.map(item => ({
        key: item.code,
        ...item,
    }));

    return (
        <Screen>
            <Button onClick={handleBack}>← Back</Button>
            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search currencies..."
            />
            <div
                style={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflow: 'auto',
                }}
            >
                <List
                    items={listItems}
                    emptyText="No currencies found"
                    onItemClick={item => handleSelect(item.code)}
                    renderItem={item => (
                        <>
                            <Text strong>{item.code}</Text>
                            <Text>{item.name}</Text>
                        </>
                    )}
                />
            </div>
        </Screen>
    );
};
