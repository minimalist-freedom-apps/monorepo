import type { ThemeConfig } from 'antd';

/**
 * Minimalistic Apps brand colors from style guidelines.
 * @see https://github.com/Minimalistic-Apps/style-guidelines
 */
export const BRAND_COLORS = {
    primary: '#087d89',
    backgroundLight: '#ffffff',
    backgroundDark: '#1e1e1e',
} as const;

/**
 * Dark theme configuration for Ant Design based on Minimalistic Apps style guidelines.
 */
export const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: BRAND_COLORS.primary,
        colorBgContainer: BRAND_COLORS.backgroundDark,
        colorBgElevated: '#2a2a2a',
        colorBgLayout: '#121212',
        colorText: '#ffffff',
        colorTextSecondary: '#999999',
        colorBorder: '#333333',
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
            colorBorder: '#333333',
            activeBorderColor: BRAND_COLORS.primary,
            hoverBorderColor: BRAND_COLORS.primary,
        },
        Modal: {
            contentBg: BRAND_COLORS.backgroundDark,
            headerBg: BRAND_COLORS.backgroundDark,
        },
        Layout: {
            headerBg: BRAND_COLORS.primary,
            bodyBg: '#121212',
        },
        List: {
            colorBgContainer: BRAND_COLORS.backgroundDark,
        },
    },
};

/**
 * Light theme configuration for Ant Design based on Minimalistic Apps style guidelines.
 */
export const lightTheme: ThemeConfig = {
    token: {
        colorPrimary: BRAND_COLORS.primary,
        colorBgContainer: BRAND_COLORS.backgroundLight,
        colorBgLayout: '#f5f5f5',
        borderRadius: 4,
    },
    components: {
        Button: {
            colorPrimary: BRAND_COLORS.primary,
            algorithm: true,
        },
        Layout: {
            headerBg: BRAND_COLORS.primary,
        },
    },
};
