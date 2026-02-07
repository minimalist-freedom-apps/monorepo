import { Empty as AntEmpty } from 'antd';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

interface ListItem {
    readonly key: string;
}

interface ListProps<T extends ListItem> {
    readonly items: ReadonlyArray<T>;
    readonly renderItem: (item: T) => ReactNode;
    readonly emptyText?: string;
    readonly onItemClick: (item: T) => void;
}

const itemStyle = {
    padding: '10px 12px',
    borderRadius: 8,
    transition: 'background 0.15s ease',
} as const;

const interactiveStyle = {
    ...itemStyle,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    width: '100%',
    display: 'block',
} as const;

export const List = <T extends ListItem>({
    items,
    renderItem,
    emptyText = 'No items found',
    onItemClick,
}: ListProps<T>) => {
    if (items.length === 0) {
        return <AntEmpty description={emptyText} />;
    }

    const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = 'var(--color-elevation2)';
    };

    const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = 'transparent';
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: T) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onItemClick(item);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map(item => (
                <button
                    key={item.key}
                    type="button"
                    onClick={() => onItemClick(item)}
                    onKeyDown={e => handleKeyDown(e, item)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={interactiveStyle}
                >
                    {renderItem(item)}
                </button>
            ))}
        </div>
    );
};
