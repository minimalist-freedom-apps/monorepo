import { ThemeProvider } from '@minimalistic-apps/components';
import type { ReactNode } from 'react';
import { selectThemeMode, useStore } from '../state/createStore';

interface ThemeWrapperProps {
    readonly children: ReactNode;
}

export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
    const themeMode = useStore(selectThemeMode);

    return <ThemeProvider mode={themeMode}>{children}</ThemeProvider>;
};
