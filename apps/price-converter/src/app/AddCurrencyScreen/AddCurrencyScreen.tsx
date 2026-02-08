import type { CurrencyCode } from '@evolu/common';
import { Button, Flex, List, Row, Screen, SearchInput, Text } from '@minimalist-apps/components';
import { CURRENCY_TERRITORIES } from '@minimalist-apps/fiat';
import { typedObjectValues } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import { useState } from 'react';
import type { CurrencyEntity, CurrencyMap } from '../../rates/FetchRates';
import type { AddCurrencyDep } from '../../state/addCurrency';
import type { NavigateDep } from '../../state/navigate';
import { filterCurrencies } from './filterCurrencies';

export type AddCurrencyScreenStateProps = {
    readonly rates: CurrencyMap;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
};

type AddCurrencyScreenDeps = AddCurrencyDep & NavigateDep;

export type AddCurrencyScreenDep = {
    readonly AddCurrencyScreen: FC;
};

export const AddCurrencyScreenPure = (
    deps: AddCurrencyScreenDeps,
    { rates, selectedCurrencies }: AddCurrencyScreenStateProps,
) => {
    const [searchTerm, setSearchTerm] = useState('');

    const availableCurrencies = typedObjectValues(rates)
        .filter(
            (it): it is CurrencyEntity => it !== undefined && !selectedCurrencies.includes(it.code),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(it => ({ code: it.code, name: it.name }));

    const filteredCurrencies = filterCurrencies(availableCurrencies, searchTerm);

    const handleSelect = (code: string) => {
        deps.addCurrency({ code: code as CurrencyCode });
        deps.navigate('Converter');
    };

    const handleBack = () => {
        deps.navigate('Converter');
    };

    const listItems = filteredCurrencies.map(item => ({
        key: item.code,
        ...item,
    }));

    return (
        <Screen gap={12}>
            <Button onClick={handleBack} variant="text" style={{ alignSelf: 'start' }}>
                ← Back
            </Button>
            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search currencies..."
            />
            <div
                style={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflow: 'auto',
                    paddingRight: '8px',
                }}
            >
                <List
                    items={listItems}
                    emptyText="No currencies found"
                    onItemClick={item => handleSelect(item.code)}
                    renderItem={item => (
                        <Row gap={12} justify="space-between">
                            <Flex flex="1" style={{ minWidth: 0 }}>
                                <Row gap={4} wrap>
                                    {item.name}&nbsp;&nbsp;
                                    {(CURRENCY_TERRITORIES[item.code] ?? []).map(t => (
                                        <span key={t.name} title={t.name}>
                                            {t.flag}
                                        </span>
                                    ))}
                                </Row>
                            </Flex>
                            <Text nowrap flexShrink={0} strong>
                                {item.code}
                            </Text>
                        </Row>
                    )}
                />
            </div>
        </Screen>
    );
};
