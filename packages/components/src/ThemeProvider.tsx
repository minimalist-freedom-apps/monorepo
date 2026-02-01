import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import { type ReactNode, useEffect } from 'react';
import { COLORS, injectColorVariables, type Theme } from './colors';

const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: COLORS.dark.primary,
        colorBgContainer: COLORS.dark.background,
        colorText: COLORS.dark.textPrimary,
        colorBgElevated: COLORS.dark.elevated,
        colorBgLayout: COLORS.dark.backgroundBase,
        colorTextSecondary: COLORS.dark.textSecondary,
        colorBorder: COLORS.dark.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Layout: {
            headerBg: COLORS.dark.primary,
            bodyBg: COLORS.dark.backgroundBase,
        },
    },
};

const lightTheme: ThemeConfig = {
    token: {
        colorPrimary: COLORS.light.primary,
        colorText: COLORS.light.textPrimary,
        colorBgContainer: COLORS.light.background,
        colorBgElevated: COLORS.light.elevated,
        colorBgLayout: COLORS.light.backgroundBase,
        colorTextSecondary: COLORS.light.textSecondary,
        colorBorder: COLORS.light.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Layout: {
            headerBg: COLORS.light.primary,
            bodyBg: COLORS.light.backgroundBase,
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
        <ConfigProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
            {children}
        </ConfigProvider>
    );
};
