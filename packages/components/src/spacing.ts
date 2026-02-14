import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { CSSProperties } from 'react';

export interface Spacing {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
}

interface BuildSpacingStyleOptions {
    readonly margin?: Spacing;
    readonly padding?: Spacing;
}

export const buildSpacingStyle = (
    options: BuildSpacingStyleOptions,
): Record<string, never> | CSSProperties => {
    const style: CSSProperties = {
        ...(options.margin?.top !== undefined ? { marginTop: options.margin.top } : {}),
        ...(options.margin?.right !== undefined ? { marginRight: options.margin.right } : {}),
        ...(options.margin?.bottom !== undefined ? { marginBottom: options.margin.bottom } : {}),
        ...(options.margin?.left !== undefined ? { marginLeft: options.margin.left } : {}),
        ...(options.padding?.top !== undefined ? { paddingTop: options.padding.top } : {}),
        ...(options.padding?.right !== undefined ? { paddingRight: options.padding.right } : {}),
        ...(options.padding?.bottom !== undefined ? { paddingBottom: options.padding.bottom } : {}),
        ...(options.padding?.left !== undefined ? { paddingLeft: options.padding.left } : {}),
    };

    return typedObjectKeys(style).length > 0 ? style : {};
};
