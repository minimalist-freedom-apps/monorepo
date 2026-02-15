import { exhaustive, typedObjectKeys } from '@minimalist-apps/type-utils';
import { Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { type FontSize, fontSizeMap } from './fontSize';
import type { Intent } from './intent';
import { buildSpacingStyle, type Spacing } from './spacing';

const { Text: AntText, Title: AntTitle, Paragraph: AntParagraph } = Typography;

interface TextProps {
    readonly children: ReactNode;
    readonly strong?: boolean;
    readonly nowrap?: boolean;
    readonly flexShrink?: number;
    readonly align?: CSSProperties['textAlign'];
    readonly size?: FontSize;
    readonly intent?: Intent;
    readonly onClick?: () => void;
    readonly margin?: Spacing;
    readonly padding?: Spacing;
}

const buildTextType = (
    intent: Intent | undefined,
): undefined | 'secondary' | 'warning' | 'danger' => {
    switch (intent) {
        case 'secondary':
            return 'secondary';
        case 'warning':
            return 'warning';
        case 'danger':
            return 'danger';
        case 'primary':
        case undefined:
            return undefined;
        default: {
            return exhaustive(intent);
        }
    }
};

const buildTextStyle = (
    nowrap: boolean,
    flexShrink: number | undefined,
    align: TextProps['align'],
    size: TextProps['size'],
    margin: TextProps['margin'],
    padding: TextProps['padding'],
): Record<string, never> | { readonly style: React.CSSProperties } => {
    const style: CSSProperties = {
        ...(nowrap ? { whiteSpace: 'nowrap' } : {}),
        ...(flexShrink !== undefined ? { flexShrink } : {}),
        ...(align !== undefined ? { textAlign: align } : {}),
        ...(size !== undefined ? { fontSize: fontSizeMap[size] } : {}),
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
    align,
    size = 'medium',
    intent,
    onClick,
    margin,
    padding,
}: TextProps) => {
    const textType = buildTextType(intent);

    return (
        <AntText
            strong={strong}
            onClick={onClick}
            {...(textType !== undefined ? { type: textType } : {})}
            {...buildTextStyle(nowrap, flexShrink, align, size, margin, padding)}
        >
            {children}
        </AntText>
    );
};

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
