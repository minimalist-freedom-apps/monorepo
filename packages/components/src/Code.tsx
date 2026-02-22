import { Card as AntCard, Typography } from 'antd';
import type { ReactNode } from 'react';
import { COLORS } from './colors';
import { useTheme } from './ThemeProvider';

const { Paragraph } = Typography;

interface CodeProps {
    readonly children: ReactNode;
    readonly onClick?: () => void;
    readonly copyable?: boolean;
    readonly inline?: boolean;
}

export const Code = ({ children, onClick, copyable = false, inline = false }: CodeProps) => {
    const theme = useTheme();

    if (inline) {
        return (
            <Typography.Text
                copyable={copyable}
                onClick={onClick}
                style={{
                    cursor: onClick ? 'pointer' : 'default',
                    margin: 0,
                    padding: '2px 6px',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: COLORS[theme].elevation2,
                }}
            >
                {children}
            </Typography.Text>
        );
    }

    return (
        <AntCard
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                width: '100%',
                backgroundColor: COLORS[theme].elevation2,
            }}
            styles={{
                body: {
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    minHeight: '60px',
                },
            }}
        >
            <Paragraph
                copyable={copyable}
                style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {children}
            </Paragraph>
        </AntCard>
    );
};
