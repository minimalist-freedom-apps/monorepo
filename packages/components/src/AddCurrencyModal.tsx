import { Empty, Input, List, Modal, Typography } from 'antd';
import type { ChangeEvent, MouseEvent } from 'react';
import { useState } from 'react';
import { BRAND_COLORS } from './theme';

const { Text } = Typography;
const { Search } = Input;

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

/**
 * Modal for adding currencies using Ant Design Modal and List.
 */
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

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = '#2a2a2a';
    };

    const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'transparent';
    };

    return (
        <Modal
            title="Add Currency"
            open={open}
            onCancel={handleClose}
            footer={null}
            styles={{
                content: { background: BRAND_COLORS.backgroundDark },
                header: { background: BRAND_COLORS.backgroundDark },
            }}
        >
            <Search
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ marginBottom: 16 }}
                allowClear
            />
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredCurrencies.length === 0 ? (
                    <Empty description="No currencies found" />
                ) : (
                    <List
                        dataSource={[...filteredCurrencies]}
                        renderItem={(item: CurrencyItem) => (
                            <List.Item
                                onClick={() => handleSelect(item.code)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '12px 16px',
                                    borderRadius: 4,
                                }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Text
                                    strong
                                    style={{
                                        color: BRAND_COLORS.primary,
                                        minWidth: 50,
                                    }}
                                >
                                    {item.code}
                                </Text>
                                <Text style={{ color: '#ccc', marginLeft: 16 }}>
                                    {item.name}
                                </Text>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </Modal>
    );
};
