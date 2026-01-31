import type { ReactNode } from 'react';

interface ScreenProps {
    readonly children: ReactNode;
}

export const Screen = ({ children }: ScreenProps) => <div>{children}</div>;
