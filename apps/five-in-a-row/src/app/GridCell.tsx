import { useRef } from 'react';
import type { Player } from './game';
import { useElementRect } from './useElementRect';

const ringEmoji = '🇴';
const crossEmoji = '❌';

const emojiMap: Record<Player, string> = {
    cross: crossEmoji,
    ring: ringEmoji,
};

const toFontSize = (rect: DOMRectReadOnly | null): number =>
    rect === null ? 16 : Math.floor(Math.min(rect.width, rect.height) * 0.6);

interface GridCellProps {
    readonly index: number;
    readonly cell: Player | null;
    readonly isWinningCell: boolean;
    readonly disabled: boolean;
    readonly onCellClick: (index: number) => void;
}

export const GridCell = ({ index, cell, isWinningCell, disabled, onCellClick }: GridCellProps) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const rect = useElementRect(buttonRef);

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={() => onCellClick(index)}
            style={{
                aspectRatio: '1 / 1',
                width: '100%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'var(--color-borderContrast)',
                backgroundColor: isWinningCell ? 'var(--color-primary)' : 'var(--color-elevation1)',
                color: 'var(--color-textPrimary)',
                fontSize: toFontSize(rect),
                cursor: disabled ? 'default' : 'pointer',
                padding: 0,
                lineHeight: 1,
            }}
            disabled={disabled}
            aria-label={`cell-${index + 1}`}
        >
            {cell !== null ? emojiMap[cell] : ''}
        </button>
    );
};
