import type { ReactNode } from 'react';
import { Row } from './Flex';
import { ThemeProvider } from './ThemeProvider';
import { Title } from './Typography';

interface AppHeaderProps {
    readonly title: ReactNode;
    readonly onTitleClick?: () => void;
    readonly actions?: ReactNode;
    readonly compactActions?: ReactNode;
    readonly secondary?: ReactNode;
    readonly children?: ReactNode;
}

const responsiveCss = `
    .mf-app-header {
        width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
    }

    .mf-app-header-main {
        width: 100%;
        min-width: 0;
    }

    .mf-app-header-title {
        min-width: 0;
        flex: 1 1 auto;
    }

    .mf-app-header-title h1,
    .mf-app-header-title h2,
    .mf-app-header-title h3,
    .mf-app-header-title h4,
    .mf-app-header-title h5 {
        margin: 0;
        line-height: 1.1;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .mf-app-header-actions-full {
        display: block;
        flex: 0 0 auto;
    }

    .mf-app-header-actions-compact {
        display: none;
        flex: 0 0 auto;
    }

    .mf-app-header-secondary {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    @media (max-width: 360px) {
        .mf-app-header-actions-full {
            display: none;
        }

        .mf-app-header-actions-compact {
            display: block;
        }

        .mf-app-header-secondary {
            justify-content: flex-start;
        }
    }
`;

export const AppHeader = ({
    title,
    onTitleClick,
    actions,
    compactActions,
    secondary,
    children,
}: AppHeaderProps) => {
    const resolvedActions = actions ?? children;

    return (
        <ThemeProvider mode="dark">
            <style>{responsiveCss}</style>
            <div className="mf-app-header">
                <div className="mf-app-header-main">
                    <Row justify="space-between" align="center" wrap>
                        <div className="mf-app-header-title">
                            <Title {...(onTitleClick ? { onClick: onTitleClick } : {})}>
                                {title}
                            </Title>
                        </div>
                        {resolvedActions != null && (
                            <>
                                <div className="mf-app-header-actions-full">
                                    <Row gap={8}>{resolvedActions}</Row>
                                </div>
                                {compactActions != null && (
                                    <div className="mf-app-header-actions-compact">
                                        {compactActions}
                                    </div>
                                )}
                            </>
                        )}
                    </Row>
                </div>
                {secondary != null && <div className="mf-app-header-secondary">{secondary}</div>}
            </div>
        </ThemeProvider>
    );
};
