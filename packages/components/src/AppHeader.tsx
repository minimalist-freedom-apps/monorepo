import type { ReactNode } from 'react';
import { Column, Row } from './Flex';
import { ThemeProvider } from './ThemeProvider';
import { Title } from './Typography';
import './AppHeader.css';

interface AppHeaderProps {
    readonly title: ReactNode;
    readonly onTitleClick?: () => void;
    readonly actions?: ReactNode;
    readonly compactActions?: ReactNode;
    readonly children?: ReactNode;
}

export const AppHeader = ({ title, onTitleClick, actions, compactActions }: AppHeaderProps) => (
    <ThemeProvider mode="dark">
        <Column gap={8}>
            <Row justify="space-between" align="center">
                <div className="mf-app-header-title">
                    <Title {...(onTitleClick ? { onClick: onTitleClick } : {})}>{title}</Title>
                </div>
                <Row>
                    <div className="mf-app-header-actions-full">
                        <Row gap={8}>{actions}</Row>
                    </div>
                    {compactActions != null && (
                        <div className="mf-app-header-actions-compact">{compactActions}</div>
                    )}
                </Row>
            </Row>
        </Column>
    </ThemeProvider>
);
