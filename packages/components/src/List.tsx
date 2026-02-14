import { Empty as AntEmpty } from 'antd';
import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Column } from './Flex';
import { buildSpacingStyle, type Spacing } from './spacing';

interface ListItem {
    readonly key: string;
}

interface ListProps<T extends ListItem> {
    readonly items: ReadonlyArray<T>;
    readonly renderItem: (item: T) => ReactNode;
    readonly emptyText?: string;
    readonly onItemClick?: (item: T) => void;
    readonly rowPadding?: Spacing;
}

const interactiveStyle = {
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    outline: 'none',
    boxShadow: 'none',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    width: '100%',
    display: 'block',
    padding: '10px 0',
} as const;

const itemStyle = {
    borderBottom: '1px solid var(--color-border)',
    width: '100%',
} as const;

const defaultRowPadding = {
    top: 10,
    right: 0,
    bottom: 10,
    left: 0,
} as const;

const buildRowPaddingStyle = (
    rowPadding: ListProps<ListItem>['rowPadding'],
): Record<string, never> | CSSProperties =>
    buildSpacingStyle({ padding: rowPadding ?? defaultRowPadding });

export const List = <T extends ListItem>({
    items,
    renderItem,
    emptyText = 'No items found',
    onItemClick,
    rowPadding,
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

    const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = 'var(--color-elevation2)';
    };

    const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = 'transparent';
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: T) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onItemClick?.(item);
        }
    };

    const rowPaddingStyle = buildRowPaddingStyle(rowPadding);

    return (
        <Column gap={0}>
            {items.map(item =>
                onItemClick ? (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onItemClick(item)}
                        onKeyDown={e => handleKeyDown(e, item)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={{ ...interactiveStyle, ...rowPaddingStyle }}
                    >
                        {renderItem(item)}
                    </button>
                ) : (
                    <div key={item.key} style={{ ...itemStyle, ...rowPaddingStyle }}>
                        {renderItem(item)}
                    </div>
                ),
            )}
        </Column>
    );
};
