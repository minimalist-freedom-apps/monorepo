import {
    Button,
    Card,
    Column,
    RedoOutlined,
    Row,
    Spinner,
    Title,
    UndoOutlined,
} from '@minimalist-apps/components';
import type { PlayerMoveDep } from '../game/createPlayerMove';
import { emojiMap, type GameBoard, type Player, type Winner } from '../game/game';
import type { RedoMoveDeps } from '../game/store/redoMove';
import type { ResetGameDeps } from '../game/store/resetGame';
import type { UndoMoveDeps } from '../game/store/undoMove';
import { GridCell } from './GridCell';

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
    readonly isBotThinking: boolean;
}

export type GameScreenDep = UndoMoveDeps & RedoMoveDeps & ResetGameDeps & PlayerMoveDep;

export const GameScreenPure = (
    deps: GameScreenDep,
    {
        winner,
        currentPlayer,
        boardIsFull,
        board,
        boardSize,
        canUndo,
        canRedo,
        isBotThinking,
    }: GameScreenStateProps,
) => {
    const statusText = buildStatusText({ winner, currentPlayer, boardIsFull });
    const winningCellIndexes = new Set(winner?.cellIndexes ?? []);

    return (
        <Column gap={12}>
            <Row justify="space-between" align="center">
                <Card padding={{ top: 4, bottom: 4, left: 16, right: 16 }}>
                    <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                        {isBotThinking ? (
                            <Spinner size="large" />
                        ) : (
                            <Title level={3}>{statusText}</Title>
                        )}
                    </div>
                </Card>
                <Row gap={8}>
                    <Button
                        onClick={deps.undoMove}
                        disabled={!canUndo || isBotThinking}
                        icon={<UndoOutlined />}
                    />
                    <Button
                        onClick={deps.redoMove}
                        disabled={!canRedo || isBotThinking}
                        icon={<RedoOutlined />}
                    />
                    <Button onClick={deps.resetGame} disabled={isBotThinking}>
                        Restart
                    </Button>
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
                        const isDisabled = winner !== null || cell !== null || isBotThinking;

                        return (
                            <GridCell
                                key={cellKey}
                                index={index}
                                cell={cell}
                                isWinningCell={isWinningCell}
                                disabled={isDisabled}
                                onCellClick={index => deps.playerMove({ index })}
                            />
                        );
                    })}
                </div>
            </div>
        </Column>
    );
};
