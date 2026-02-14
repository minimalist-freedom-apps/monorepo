import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { buildSpacingStyle, type Spacing } from './spacing';

const { Text: AntText, Title: AntTitle, Paragraph: AntParagraph } = Typography;

interface TextProps {
    readonly children: ReactNode;
    readonly strong?: boolean;
    readonly nowrap?: boolean;
    readonly flexShrink?: number;
    readonly size?: 'small' | 'medium' | 'large';
    readonly secondary?: boolean;
    readonly onClick?: () => void;
    readonly margin?: Spacing;
    readonly padding?: Spacing;
}

const textSizeMap = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.5rem',
} as const;

const buildTextStyle = (
    nowrap: boolean,
    flexShrink: number | undefined,
    size: TextProps['size'],
    margin: TextProps['margin'],
    padding: TextProps['padding'],
): Record<string, never> | { readonly style: React.CSSProperties } => {
    const style: CSSProperties = {
        ...(nowrap ? { whiteSpace: 'nowrap' } : {}),
        ...(flexShrink !== undefined ? { flexShrink } : {}),
        ...(size !== undefined ? { fontSize: textSizeMap[size] } : {}),
        ...buildSpacingStyle({
            ...(margin ? { margin } : {}),
            ...(padding ? { padding } : {}),
        }),
    };

    return typedObjectKeys(style).length > 0 ? { style } : {};
};

export const Text = ({
    children,
    strong = false,
    nowrap = false,
    flexShrink,
    size = 'medium',
    secondary = false,
    onClick,
    margin,
    padding,
}: TextProps) => (
    <AntText
        strong={strong}
        onClick={onClick}
        {...(secondary ? { type: 'secondary' as const } : {})}
        {...buildTextStyle(nowrap, flexShrink, size, margin, padding)}
    >
        {children}
    </AntText>
);

interface TitleProps {
    readonly children: ReactNode;
    readonly level?: 1 | 2 | 3 | 4 | 5;
    readonly style?: React.CSSProperties;
    readonly onClick?: () => void;
}

export const Title = ({ children, level = 4, onClick }: TitleProps) => (
    <AntTitle level={level} style={{ margin: 0, padding: 0 }} onClick={onClick}>
        {children}
    </AntTitle>
);

interface ParagraphProps {
    readonly children: ReactNode;
    readonly code?: boolean;
    readonly copyable?: boolean;
    readonly onClick?: () => void;
    readonly style?: React.CSSProperties;
}

export const Paragraph = ({
    children,
    code = false,
    copyable = false,
    onClick,
    style,
}: ParagraphProps) => (
    <AntParagraph code={code} copyable={copyable} onClick={onClick} {...(style ? { style } : {})}>
        {children}
    </AntParagraph>
);
