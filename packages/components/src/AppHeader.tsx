import type { ReactNode } from 'react';
import { Row } from './Flex';
import { ThemeProvider } from './ThemeProvider';
import { Title } from './Typography';

interface AppHeaderProps {
    readonly title: ReactNode;
    readonly onTitleClick?: () => void;
    readonly children?: ReactNode;
}

export const AppHeader = ({
    title,
    onTitleClick,
    children,
}: AppHeaderProps) => (
    <ThemeProvider mode="dark">
        <Row justify="space-between" align="center" style={{ height: '100%' }}>
            <Title {...(onTitleClick ? { onClick: onTitleClick } : {})}>
                {title}
            </Title>
            {children != null && <Row gap={8}>{children}</Row>}
        </Row>
    </ThemeProvider>
);
