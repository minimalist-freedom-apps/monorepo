import { Layout as AntLayout } from 'antd';
import type { ReactNode } from 'react';

const { Header: AntHeader, Content: AntContent } = AntLayout;

interface LayoutProps {
    readonly children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
    <AntLayout style={{ minHeight: '100vh' }}>{children}</AntLayout>
);

interface HeaderProps {
    readonly children: ReactNode;
    readonly style?: React.CSSProperties;
}

export const Header = ({ children, style }: HeaderProps) => (
    <AntHeader
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            ...style,
        }}
    >
        {children}
    </AntHeader>
);

interface ContentProps {
    readonly children: ReactNode;
    readonly maxWidth?: number;
    readonly style?: React.CSSProperties;
}

export const Content = ({ children, maxWidth = 600, style }: ContentProps) => (
    <AntContent
        style={{
            maxWidth,
            width: '100%',
            margin: '0 auto',
            padding: '24px 16px',
            ...style,
        }}
    >
        {children}
    </AntContent>
);
