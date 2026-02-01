import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { COLORS, injectColorVariables, type Theme } from './colors';

const ThemeContext = createContext<Theme>('dark');

export const useTheme = (): Theme => useContext(ThemeContext);

const darkTheme: ThemeConfig = {
    token: {
        // background
        colorBgLayout: COLORS.dark.elevation0,
        colorBgContainer: COLORS.dark.elevation1,
        colorBgElevated: COLORS.dark.elevation2,

        // rest
        colorPrimary: COLORS.dark.primary,
        colorText: COLORS.dark.textPrimary,
        colorTextSecondary: COLORS.dark.textSecondary,
        colorBorder: COLORS.dark.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Layout: {
            headerBg: COLORS.dark.primary,
            bodyBg: COLORS.dark.elevation0,
            headerPadding: '0 16px',
        },
        Card: {
            colorBorderSecondary: COLORS.dark.border,
        },
    },
};

const lightTheme: ThemeConfig = {
    token: {
        // background
        colorBgLayout: COLORS.light.elevation0,
        colorBgContainer: COLORS.light.elevation1,
        colorBgElevated: COLORS.light.elevation2,

        colorPrimary: COLORS.light.primary,
        colorText: COLORS.light.textPrimary,
        colorTextSecondary: COLORS.light.textSecondary,
        colorBorder: COLORS.light.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Layout: {
            headerBg: COLORS.light.primary,
            bodyBg: COLORS.light.elevation0,
            headerPadding: '0 16px',
        },
        Card: {
            colorBorderSecondary: COLORS.light.border,
        },
    },
};

interface ThemeProviderProps {
    readonly children: ReactNode;
    readonly mode?: Theme;
}

export const ThemeProvider = ({
    children,
    mode = 'dark',
}: ThemeProviderProps) => {
    useEffect(() => {
        injectColorVariables(mode);
    }, [mode]);

    return (
        <ThemeContext.Provider value={mode}>
            <ConfigProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
