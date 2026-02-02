import { Card as AntCard, Typography } from 'antd';
import { COLORS } from './colors';
import { useTheme } from './ThemeProvider';

const { Paragraph } = Typography;

interface CodeProps {
    readonly children: string;
    readonly onClick?: () => void;
    readonly copyable?: boolean;
}

export const Code = ({ children, onClick, copyable = false }: CodeProps) => {
    const theme = useTheme();

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
