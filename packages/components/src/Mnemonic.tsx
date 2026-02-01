import { Card as AntCard } from 'antd';
import { useState } from 'react';
import { COLORS } from './colors';
import { useTheme } from './ThemeProvider';

interface MnemonicProps {
    readonly value: string | null;
}

const generateMaskedMnemonic = (): string => {
    const words: string[] = [];

    for (let i = 0; i < 24; i++) {
        const length = Math.floor(Math.random() * 6) + 3; // 3-8 asterisks
        words.push('•'.repeat(length));
    }

    return words.join(' ');
};

// Just generate once, its just for UI it does no need to change
const maskedMnemonic = generateMaskedMnemonic();

export const Mnemonic = ({ value }: MnemonicProps) => {
    const theme = useTheme();

    const [isRevealed, setIsRevealed] = useState(false);

    const handleToggleReveal = () => {
        setIsRevealed(!isRevealed);
    };

    const displayedMnemonic = isRevealed ? value : maskedMnemonic;

    return (
        <AntCard
            onClick={handleToggleReveal}
            style={{
                cursor: 'pointer',
                width: '100%',
                backgroundColor: COLORS[theme].elevation2,
            }}
            styles={{
                body: {
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    minHeight: '60px',
                },
            }}
        >
            {displayedMnemonic || 'N/A'}
        </AntCard>
    );
};
