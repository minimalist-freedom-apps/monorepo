import { Layout } from 'antd';
import type { ReactNode } from 'react';

const { Content } = Layout;

interface AppLayoutProps {
    readonly children: ReactNode;
    readonly header?: ReactNode;
}

/**
 * Main application layout using Ant Design Layout components.
 */
export const AppLayout = ({ children, header }: AppLayoutProps) => (
    <Layout style={{ minHeight: '100vh', background: '#121212' }}>
        {header}
        <Content
            style={{
                maxWidth: 600,
                width: '100%',
                margin: '0 auto',
                padding: '24px 16px',
            }}
        >
            {children}
        </Content>
    </Layout>
);
