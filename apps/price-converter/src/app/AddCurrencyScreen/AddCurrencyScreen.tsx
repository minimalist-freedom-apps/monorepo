import type { CurrencyCode } from '@evolu/common';
import {
    Button,
    List,
    Screen,
    SearchInput,
    Text,
} from '@minimalistic-apps/components';
import { typedObjectEntries } from '@minimalistic-apps/type-utils';
import { useState } from 'react';
import { useServices } from '../../ServicesProvider';
import {
    selectRates,
    selectSelectedFiatCurrencies,
    useStore,
} from '../../state/createStore';

export const AddCurrencyScreen = () => {
    const services = useServices();
    const rates = useStore(selectRates);
    const selectedCurrencies = useStore(selectSelectedFiatCurrencies);
    const [searchTerm, setSearchTerm] = useState('');

    const availableCurrencies = typedObjectEntries(rates)
        .filter(([code]) => !selectedCurrencies.includes(code))
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([code, info]) => ({ code, name: info.name }));

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
        services.addCurrency({ code: code as CurrencyCode });
        services.store.setState({ currentScreen: 'Converter' });
    };

    const handleBack = () => {
        services.store.setState({ currentScreen: 'Converter' });
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
