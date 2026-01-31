import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ReactNode } from 'react';
import { COLORS } from './colors';

const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: COLORS.DARK.primary,
        colorBgContainer: COLORS.DARK.background,
        colorBgElevated: COLORS.DARK.elevated,
        colorBgLayout: COLORS.DARK.backgroundBase,
        colorText: COLORS.DARK.textPrimary,
        colorTextSecondary: COLORS.DARK.textSecondary,
        colorBorder: COLORS.DARK.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Button: {
            colorPrimary: COLORS.DARK.primary,
            algorithm: true,
        },
        Input: {
            colorBgContainer: COLORS.DARK.background,
            colorBorder: COLORS.DARK.border,
            activeBorderColor: COLORS.DARK.primary,
            hoverBorderColor: COLORS.DARK.primary,
        },
        Modal: {
            contentBg: COLORS.DARK.background,
            headerBg: COLORS.DARK.background,
        },
        Layout: {
            headerBg: COLORS.DARK.primary,
            bodyBg: COLORS.DARK.backgroundBase,
        },
        List: {
            colorBgContainer: COLORS.DARK.background,
        },
    },
};

const lightTheme: ThemeConfig = {
    token: {
        colorPrimary: COLORS.LIGHT.primary,
        colorBgContainer: COLORS.LIGHT.background,
        colorBgElevated: COLORS.LIGHT.elevated,
        colorBgLayout: COLORS.LIGHT.backgroundBase,
        colorText: COLORS.LIGHT.textPrimary,
        colorTextSecondary: COLORS.LIGHT.textSecondary,
        colorBorder: COLORS.LIGHT.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Button: {
            colorPrimary: COLORS.LIGHT.primary,
            algorithm: true,
        },
        Input: {
            colorBgContainer: COLORS.LIGHT.background,
            colorBorder: COLORS.LIGHT.border,
            activeBorderColor: COLORS.LIGHT.primary,
            hoverBorderColor: COLORS.LIGHT.primary,
        },
        Modal: {
            contentBg: COLORS.LIGHT.background,
            headerBg: COLORS.LIGHT.background,
        },
        Layout: {
            headerBg: COLORS.LIGHT.primary,
            bodyBg: COLORS.LIGHT.backgroundBase,
        },
        List: {
            colorBgContainer: COLORS.LIGHT.background,
        },
    },
};

interface ThemeProviderProps {
    readonly children: ReactNode;
    readonly mode?: 'dark' | 'light';
}

export const ThemeProvider = ({
    children,
    mode = 'dark',
}: ThemeProviderProps) => (
    <ConfigProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
        {children}
    </ConfigProvider>
);
