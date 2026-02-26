const ansiColorCodeByName = {
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
} as const;

export type TextColor = keyof typeof ansiColorCodeByName;

export const coloredText = (text: string, color: TextColor): string => {
    const code = ansiColorCodeByName[color];

    return `\x1b[${code}m${text}\x1b[0m`;
};
