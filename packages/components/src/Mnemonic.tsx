import { useState } from 'react';
import { Code } from './Code';

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
    const [isRevealed, setIsRevealed] = useState(false);

    const handleToggleReveal = () => {
        setIsRevealed(!isRevealed);
    };

    const displayedMnemonic = isRevealed ? value : maskedMnemonic;

    return (
        <Code onClick={handleToggleReveal} copyable={isRevealed}>
            {displayedMnemonic ?? 'N/A'}
        </Code>
    );
};
