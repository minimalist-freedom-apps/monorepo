import { Empty as AntEmpty, List as AntList } from 'antd';
import type { MouseEvent, ReactNode } from 'react';

interface ListItem {
    readonly key: string;
}

interface ListProps<T extends ListItem> {
    readonly items: ReadonlyArray<T>;
    readonly renderItem: (item: T) => ReactNode;
    readonly emptyText?: string;
    readonly onItemClick?: (item: T) => void;
}

export const List = <T extends ListItem>({
    items,
    renderItem,
    emptyText = 'No items found',
    onItemClick,
}: ListProps<T>) => {
    if (items.length === 0) {
        return <AntEmpty description={emptyText} />;
    }

    const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = '#2a2a2a';
    };

    const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'transparent';
    };

    return (
        <AntList
            dataSource={[...items]}
            renderItem={(item: T) => (
                <AntList.Item
                    onClick={() => onItemClick?.(item)}
                    style={{
                        cursor: onItemClick ? 'pointer' : 'default',
                        padding: '12px 16px',
                        borderRadius: 4,
                    }}
                    onMouseEnter={onItemClick ? handleMouseEnter : undefined}
                    onMouseLeave={onItemClick ? handleMouseLeave : undefined}
                >
                    {renderItem(item)}
                </AntList.Item>
            )}
        />
    );
};
