import { Button, Card, Column, Row, Title } from '@minimalist-apps/components';
import { GridCell } from './GridCell';
import { emojiMap, type GameBoard, type Player, type Winner } from './game';

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
                <Card padding={{ top: 8, bottom: 8, left: 16, right: 16 }}>
                    <Title level={5}>{statusText}</Title>
                </Card>
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
                        const isDisabled = winner !== null || cell !== null;

                        return (
                            <GridCell
                                key={cellKey}
                                index={index}
                                cell={cell}
                                isWinningCell={isWinningCell}
                                disabled={isDisabled}
                                onCellClick={onCellClick}
                            />
                        );
                    })}
                </div>
            </div>
        </Column>
    );
};
