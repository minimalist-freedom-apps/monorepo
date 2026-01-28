import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ReactNode } from 'react';
import { BRAND_COLORS } from './colors';

/**
 * Dark theme configuration for Ant Design based on Minimalistic Apps style guidelines.
 */
const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: BRAND_COLORS.primary,
        colorBgContainer: BRAND_COLORS.backgroundDark,
        colorBgElevated: BRAND_COLORS.elevated,
        colorBgLayout: BRAND_COLORS.backgroundBase,
        colorText: BRAND_COLORS.textPrimary,
        colorTextSecondary: BRAND_COLORS.textSecondary,
        colorBorder: BRAND_COLORS.border,
        borderRadius: 4,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Button: {
            colorPrimary: BRAND_COLORS.primary,
            algorithm: true,
        },
        Input: {
            colorBgContainer: BRAND_COLORS.backgroundDark,
            colorBorder: BRAND_COLORS.border,
            activeBorderColor: BRAND_COLORS.primary,
            hoverBorderColor: BRAND_COLORS.primary,
        },
        Modal: {
            contentBg: BRAND_COLORS.backgroundDark,
            headerBg: BRAND_COLORS.backgroundDark,
        },
        Layout: {
            headerBg: BRAND_COLORS.primary,
            bodyBg: BRAND_COLORS.backgroundBase,
        },
        List: {
            colorBgContainer: BRAND_COLORS.backgroundDark,
        },
    },
};

interface ThemeProviderProps {
    readonly children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => (
    <ConfigProvider theme={darkTheme}>{children}</ConfigProvider>
);
