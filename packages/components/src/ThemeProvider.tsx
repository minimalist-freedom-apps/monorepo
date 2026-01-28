import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { darkTheme } from './theme';

interface ThemeProviderProps {
    readonly children: ReactNode;
}

/**
 * Theme provider wrapping Ant Design ConfigProvider with Minimalistic Apps dark theme.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => (
    <ConfigProvider theme={darkTheme}>{children}</ConfigProvider>
);
