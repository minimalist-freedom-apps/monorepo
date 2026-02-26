import type { ReactNode } from 'react';
import { Row } from './Flex';
import { ThemeProvider } from './ThemeProvider';
import { Title } from './Typography';
import './AppHeader.css';

interface AppHeaderProps {
    readonly title: ReactNode;
    readonly onTitleClick?: () => void;
    readonly actions?: ReactNode;
    readonly actionsTestId?: string;
    readonly compactActions?: ReactNode;
    readonly children?: ReactNode;
}

export const AppHeader = ({
    title,
    onTitleClick,
    actions,
    actionsTestId,
    compactActions,
}: AppHeaderProps) => (
    <ThemeProvider mode="dark">
        <Row justify="space-between" align="center" style={{ minHeight: '64px' }}>
            <div className="mf-app-header-title">
                <Title {...(onTitleClick ? { onClick: onTitleClick } : {})}>{title}</Title>
            </div>
            <Row>
                <div className="mf-app-header-actions-full" id={actionsTestId}>
                    <Row gap={8}>{actions}</Row>
                </div>
                {compactActions != null && (
                    <div className="mf-app-header-actions-compact">{compactActions}</div>
                )}
            </Row>
        </Row>
    </ThemeProvider>
);
