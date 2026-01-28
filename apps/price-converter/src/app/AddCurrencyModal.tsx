import { List, Modal, SearchInput, Text } from '@minimalistic-apps/components';
import { useState } from 'react';

interface CurrencyItem {
    readonly code: string;
    readonly name: string;
}

interface AddCurrencyModalProps {
    readonly open: boolean;
    readonly currencies: ReadonlyArray<CurrencyItem>;
    readonly onAdd: (code: string) => void;
    readonly onClose: () => void;
}

export const AddCurrencyModal = ({
    open,
    currencies,
    onAdd,
    onClose,
}: AddCurrencyModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCurrencies = !searchTerm
        ? currencies
        : currencies.filter(({ code, name }) => {
              const term = searchTerm.toLowerCase();
              return (
                  code.toLowerCase().includes(term) ||
                  name.toLowerCase().includes(term)
              );
          });

    const handleSelect = (code: string) => {
        onAdd(code);
        setSearchTerm('');
    };

    const handleClose = () => {
        setSearchTerm('');
        onClose();
    };

    const listItems = filteredCurrencies.map(item => ({
        key: item.code,
        ...item,
    }));

    return (
        <Modal title="Add Currency" open={open} onClose={handleClose}>
            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search currencies..."
            />
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
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
        </Modal>
    );
};
