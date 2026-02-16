import { Layout, type Theme, ThemeProvider } from '@minimalist-apps/components';
import { exhaustive } from '@minimalist-apps/type-utils';
import { useState } from 'react';
import { AppHeader } from './AppHeader';
import { GameScreen } from './GameScreen';
import {
    createEmptyBoard,
    findWinner,
    type GameBoard,
    getNextPlayer,
    isBoardFull,
    type Player,
    type Winner,
} from './game';
import { SettingsScreen } from './SettingsScreen';

type Screen = 'Game' | 'Settings';

export const App = () => {
    const [themeMode, setThemeMode] = useState<Theme>('dark');
    const [currentScreen, setCurrentScreen] = useState<Screen>('Game');
    const [boardSize, setBoardSize] = useState(10);
    const [board, setBoard] = useState<GameBoard>(() => createEmptyBoard({ size: 10 }));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('ring');
    const [winner, setWinner] = useState<Winner | null>(null);

    const boardIsFull = isBoardFull({ board });

    const resetBoard = ({ size }: { readonly size: number }) => {
        setBoard(createEmptyBoard({ size }));
        setCurrentPlayer('ring');
        setWinner(null);
    };

    const handleReset = () => {
        resetBoard({ size: boardSize });
    };

    const handleBoardSizeChange = (size: number) => {
        setBoardSize(size);
        resetBoard({ size });
    };

    const handleCellClick = (index: number) => {
        if (winner !== null || board[index] !== null) {
            return;
        }

        const nextBoard: GameBoard = [...board];
        nextBoard[index] = currentPlayer;

        const nextWinner = findWinner({
            board: nextBoard,
            size: boardSize,
            lastMoveIndex: index,
        });

        setBoard(nextBoard);

        if (nextWinner !== null) {
            setWinner(nextWinner);

            return;
        }

        if (isBoardFull({ board: nextBoard })) {
            return;
        }

        setCurrentPlayer(getNextPlayer({ player: currentPlayer }));
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'Game':
                return (
                    <GameScreen
                        winner={winner}
                        currentPlayer={currentPlayer}
                        boardIsFull={boardIsFull}
                        board={board}
                        boardSize={boardSize}
                        onReset={handleReset}
                        onCellClick={handleCellClick}
                    />
                );
            case 'Settings':
                return (
                    <SettingsScreen
                        themeMode={themeMode}
                        onThemeToggle={checked => {
                            setThemeMode(checked ? 'light' : 'dark');
                        }}
                        boardSize={boardSize}
                        onBoardSizeChange={handleBoardSizeChange}
                    />
                );
            default:
                return exhaustive(currentScreen);
        }
    };

    return (
        <ThemeProvider mode={themeMode}>
            <Layout>
                <Layout.Header>
                    <AppHeader
                        onHome={() => setCurrentScreen('Game')}
                        onOpenSettings={() => setCurrentScreen('Settings')}
                    />
                </Layout.Header>
                <Layout.Content maxWidth={760} style={{ minWidth: 360 }}>
                    {renderScreen()}
                </Layout.Content>
            </Layout>
        </ThemeProvider>
    );
};
