import { Column, SettingsRow, Slider, Switch, Text, type Theme } from '@minimalist-apps/components';

const minBoardSize = 3;
const maxBoardSize = 30;

interface SettingsScreenProps {
    readonly themeMode: Theme;
    readonly onThemeToggle: (checked: boolean) => void;
    readonly boardSize: number;
    readonly onBoardSizeChange: (size: number) => void;
}

export const SettingsScreen = ({
    themeMode,
    onThemeToggle,
    boardSize,
    onBoardSizeChange,
}: SettingsScreenProps) => (
    <Column gap={12}>
        <SettingsRow label="Theme Mode">
            <Switch checked={themeMode === 'light'} onChange={onThemeToggle} />
        </SettingsRow>
        <SettingsRow label="Board Size" direction="column">
            <Column gap={8}>
                <Slider
                    min={minBoardSize}
                    max={maxBoardSize}
                    value={boardSize}
                    onChange={onBoardSizeChange}
                />
                <Text>{`${boardSize} × ${boardSize}`}</Text>
            </Column>
        </SettingsRow>
    </Column>
);
