import { Button, Column, Row, Title } from '@minimalist-apps/components';
import type { GameBoard, Player, Winner } from './game';

const ringEmoji = '🇴';
const crossEmoji = '❌';

const emojiMap: Record<Player, string> = {
    cross: crossEmoji,
    ring: ringEmoji,
};

interface BuildStatusTextProps {
    readonly winner: Winner | null;
    readonly currentPlayer: Player;
    readonly boardIsFull: boolean;
}

const buildStatusText = ({ winner, currentPlayer, boardIsFull }: BuildStatusTextProps): string => {
    if (winner !== null) {
        return `${emojiMap[winner.player]} wins!`;
    }

    if (boardIsFull) {
        return 'Draw';
    }

    return `Turn: ${emojiMap[currentPlayer]}`;
};

interface BuildCellFontSizeProps {
    readonly boardSize: number;
}

const buildCellFontSize = ({ boardSize }: BuildCellFontSizeProps): number => {
    if (boardSize <= 8) {
        return 28;
    }

    if (boardSize <= 14) {
        return 20;
    }

    if (boardSize <= 22) {
        return 15;
    }

    return 12;
};

interface GameScreenProps {
    readonly winner: Winner | null;
    readonly currentPlayer: Player;
    readonly boardIsFull: boolean;
    readonly board: GameBoard;
    readonly boardSize: number;
    readonly onReset: () => void;
    readonly onCellClick: (index: number) => void;
}

export const GameScreen = ({
    winner,
    currentPlayer,
    boardIsFull,
    board,
    boardSize,
    onReset,
    onCellClick,
}: GameScreenProps) => {
    const statusText = buildStatusText({ winner, currentPlayer, boardIsFull });
    const winningCellIndexes = new Set(winner?.cellIndexes ?? []);

    return (
        <Column gap={12}>
            <Row justify="space-between" align="center">
                <Title level={5}>{statusText}</Title>
                <Button onClick={onReset}>Restart</Button>
            </Row>

            <div style={{ overflow: 'auto' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                        gap: 2,
                        minWidth: '100%',
                    }}
                >
                    {board.map((cell, index) => {
                        const row = Math.floor(index / boardSize);
                        const column = index % boardSize;
                        const cellKey = `${row}-${column}`;
                        const isWinningCell = winningCellIndexes.has(index);

                        return (
                            <button
                                type="button"
                                key={cellKey}
                                onClick={() => onCellClick(index)}
                                style={{
                                    aspectRatio: '1 / 1',
                                    width: '100%',
                                    borderStyle: 'solid',
                                    borderWidth: 1,
                                    borderColor: 'var(--color-border)',
                                    backgroundColor: isWinningCell
                                        ? 'var(--color-primary)'
                                        : 'var(--color-elevation1)',
                                    color: 'var(--color-textPrimary)',
                                    fontSize: buildCellFontSize({ boardSize }),
                                    cursor:
                                        winner === null && cell === null ? 'pointer' : 'default',
                                    padding: 0,
                                    lineHeight: 1,
                                }}
                                disabled={winner !== null || cell !== null}
                                aria-label={`cell-${index + 1}`}
                            >
                                {cell !== null ? emojiMap[cell] : ''}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Column>
    );
};
