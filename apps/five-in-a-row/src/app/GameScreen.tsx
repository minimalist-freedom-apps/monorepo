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

    return emojiMap[currentPlayer];
};

export interface GameScreenStateProps {
    readonly winner: Winner | null;
    readonly currentPlayer: Player;
    readonly boardIsFull: boolean;
    readonly board: GameBoard;
    readonly boardSize: number;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
}

export interface GameScreenDep {
    readonly onUndo: () => void;
    readonly onRedo: () => void;
    readonly onReset: () => void;
    readonly onCellClick: (index: number) => void;
}

export type GameScreenProps = GameScreenStateProps & GameScreenDep;

export const GameScreenPure = ({
    winner,
    currentPlayer,
    boardIsFull,
    board,
    boardSize,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
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
                <Row gap={8}>
                    <Button onClick={onUndo} disabled={!canUndo}>
                        Undo
                    </Button>
                    <Button onClick={onRedo} disabled={!canRedo}>
                        Redo
                    </Button>
                    <Button onClick={onReset}>Restart</Button>
                </Row>
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
