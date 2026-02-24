import type { CurrencyCode } from '@evolu/common';
import type { NotificationDep } from '@minimalist-apps/components';
import { Button, Flex, List, Row, Screen, SearchInput, Text } from '@minimalist-apps/components';
import { CURRENCY_TERRITORIES } from '@minimalist-apps/fiat';
import type { NavigateDep } from '@minimalist-apps/navigator';
import { typedObjectValues } from '@minimalist-apps/type-utils';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { CurrencyEntity, CurrencyMap } from '../../rates/FetchRates';
import type { AddCurrencyDep } from '../../state/addCurrency';
import type { NavigatorScreen } from '../../state/State';
import { filterCurrencies } from './filterCurrencies';

export type AddCurrencyScreenStateProps = {
    readonly rates: CurrencyMap;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
};

type AddCurrencyScreenDeps = AddCurrencyDep & NavigateDep<NavigatorScreen> & NotificationDep;

export type AddCurrencyScreenDep = {
    readonly AddCurrencyScreen: FC;
};

export const AddCurrencyScreenPure = (
    deps: AddCurrencyScreenDeps,
    { rates, selectedCurrencies }: AddCurrencyScreenStateProps,
) => {
    const [searchTerm, setSearchTerm] = useState('');
    const listContainerRef = useRef<HTMLDivElement>(null);

    const availableCurrencies = typedObjectValues(rates)
        .filter(
            (it): it is CurrencyEntity => it !== undefined && !selectedCurrencies.includes(it.code),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(it => ({ code: it.code, name: it.name }));

    const filteredCurrencies = filterCurrencies(availableCurrencies, searchTerm);

    const handleSelect = async (code: string) => {
        const result = await deps.addCurrency({ code: code as CurrencyCode });

        if (result.ok === true) {
            deps.navigate('Converter');
        } else {
            console.error(result.error);

            deps.notification.error('Failed to add currency.');
        }
    };

    const handleBack = () => {
        deps.navigate('Converter');
    };

    const listItems = filteredCurrencies.map(item => ({
        key: item.code,
        ...item,
    }));

    useEffect(() => {
        const listContainer = listContainerRef.current;

        if (!listContainer) {
            return;
        }

        const handleFocusIn = (event: FocusEvent) => {
            if (event.target !== listContainer) {
                return;
            }

            listContainer.querySelector<HTMLButtonElement>('button[type="button"]')?.focus();
        };

        listContainer.addEventListener('focusin', handleFocusIn);

        return () => {
            listContainer.removeEventListener('focusin', handleFocusIn);
        };
    }, []);

    return (
        <Screen gap={12}>
            <Button onClick={handleBack} variant="text" style={{ alignSelf: 'start' }}>
                ← Back
            </Button>
            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search currencies..."
                autoFocus
            />
            <div
                ref={listContainerRef}
                style={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflow: 'auto',
                    outline: 'none',
                }}
            >
                <List
                    items={listItems}
                    rowPadding={{ left: 12, right: 12 }}
                    emptyText="No currencies found"
                    onItemClick={item => handleSelect(item.code)}
                    renderItem={item => (
                        <Row gap={12} justify="space-between" margin={{}}>
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
