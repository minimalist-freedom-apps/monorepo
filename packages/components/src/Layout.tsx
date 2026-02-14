import { Layout as AntLayout } from 'antd';
import type { ReactNode } from 'react';

const { Header: AntHeader, Content: AntContent } = AntLayout;

interface ContentProps {
    readonly children: ReactNode;
    readonly maxWidth?: number;
    readonly style?: React.CSSProperties;
}

const Content = ({ children, maxWidth = 600, style }: ContentProps) => (
    <AntContent
        style={{
            maxWidth,
            width: '100%',
            margin: '0 auto',
            padding: '16px',
            ...style,
        }}
    >
        {children}
    </AntContent>
);

interface HeaderProps {
    readonly children: ReactNode;
}

const Header = ({ children }: HeaderProps) => (
    <AntHeader
        style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            minHeight: 'calc(64px + env(safe-area-inset-top, 0px))',
            height: 'auto',
        }}
    >
        {children}
    </AntHeader>
);

interface LayoutProps {
    readonly children: ReactNode;
}

const LayoutComponent = ({ children }: LayoutProps) => (
    <AntLayout style={{ minHeight: '100vh', padding: '0' }}>{children}</AntLayout>
);

export const Layout = Object.assign(LayoutComponent, {
    Header,
    Content,
});
