import { typedObjectEntries } from '@minimalist-apps/type-utils';

export type Theme = 'dark' | 'light';

interface ColorScheme {
    readonly primary: string;
    readonly elevation1: string;
    readonly elevation0: string;
    readonly elevation2: string;
    readonly textPrimary: string;
    readonly textSecondary: string;
    readonly border: string;
    readonly error: string;
    readonly fadedColor: string;
    readonly fadedColorLight: string;
    readonly halfFadedColor: string;
    readonly transparent: string;
}

export const BRAND_COLOR = '#087d89';

export const COLORS: Record<Theme, ColorScheme> = {
    dark: {
        primary: BRAND_COLOR,

        // background elevations
        elevation0: '#121212',
        elevation1: '#1e1e1e',
        elevation2: '#2a2a2a',

        textPrimary: '#ffffff',
        textSecondary: '#959595FF',
        border: '#333333',
        error: '#ff4d4f',
        fadedColor: '#777777FF',
        fadedColorLight: '#999999FF',
        halfFadedColor: '#CCCCCCFF',
        transparent: '#FFFFFF5D',
    },
    light: {
        primary: BRAND_COLOR,

        // background elevations
        elevation0: '#f5f5f5',
        elevation1: '#ffffff',
        elevation2: '#f5f5f5',

        textPrimary: '#1e1e1e',
        textSecondary: '#666666',
        border: '#e0e0e0',
        error: '#ff4d4f',
        fadedColor: '#cccccc',
        fadedColorLight: '#e0e0e0',
        halfFadedColor: '#f5f5f5',
        transparent: '#FFFFFF5D',
    },
} as const;

/**
 * Inject color variables as CSS custom properties into the document root.
 * This allows using colors in CSS files via var(--color-primary), var(--color-background), etc.
 */
export const injectColorVariables = (mode: Theme): void => {
    const colors = COLORS[mode];
    const root = document.documentElement;

    for (const [key, value] of typedObjectEntries(colors)) {
        root.style.setProperty(`--color-${key}`, value);
    }
};
