import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { CSSProperties } from 'react';

interface DirectionalSpacing {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
    readonly vertical?: number;
    readonly horizontal?: number;
}

export type Spacing = number | DirectionalSpacing;

interface ResolvedSpacing {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
}

const resolveSpacing = (spacing: Spacing | undefined): ResolvedSpacing | undefined => {
    if (spacing === undefined) {
        return undefined;
    }

    if (typeof spacing === 'number') {
        return {
            top: spacing,
            right: spacing,
            bottom: spacing,
            left: spacing,
        };
    }

    const top = spacing.top ?? spacing.vertical;
    const right = spacing.right ?? spacing.horizontal;
    const bottom = spacing.bottom ?? spacing.vertical;
    const left = spacing.left ?? spacing.horizontal;

    return {
        ...(top !== undefined ? { top } : {}),
        ...(right !== undefined ? { right } : {}),
        ...(bottom !== undefined ? { bottom } : {}),
        ...(left !== undefined ? { left } : {}),
    };
};

interface BuildSpacingStyleOptions {
    readonly margin?: Spacing;
    readonly padding?: Spacing;
}

export const buildSpacingStyle = (
    options: BuildSpacingStyleOptions,
): Record<string, never> | CSSProperties => {
    const margin = resolveSpacing(options.margin);
    const padding = resolveSpacing(options.padding);

    const style: CSSProperties = {
        ...(margin?.top !== undefined ? { marginTop: margin.top } : {}),
        ...(margin?.right !== undefined ? { marginRight: margin.right } : {}),
        ...(margin?.bottom !== undefined ? { marginBottom: margin.bottom } : {}),
        ...(margin?.left !== undefined ? { marginLeft: margin.left } : {}),
        ...(padding?.top !== undefined ? { paddingTop: padding.top } : {}),
        ...(padding?.right !== undefined ? { paddingRight: padding.right } : {}),
        ...(padding?.bottom !== undefined ? { paddingBottom: padding.bottom } : {}),
        ...(padding?.left !== undefined ? { paddingLeft: padding.left } : {}),
    };

    return typedObjectKeys(style).length > 0 ? style : {};
};
