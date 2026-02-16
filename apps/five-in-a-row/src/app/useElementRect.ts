import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

interface RectEqualsProps {
    readonly a: DOMRectReadOnly;
    readonly b: DOMRectReadOnly;
}

const rectEquals = ({ a, b }: RectEqualsProps): boolean =>
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left;

export const useElementRect = <ElementType extends HTMLElement>(
    elementRef: RefObject<ElementType | null>,
): DOMRectReadOnly | null => {
    const element = elementRef.current;
    const [rect, setRect] = useState<DOMRectReadOnly | null>(null);

    useEffect(() => {
        if (element === null) {
            return;
        }

        const updateRect = (): void => {
            const nextRect = element.getBoundingClientRect();

            setRect(previousRect => {
                if (previousRect !== null && rectEquals({ a: previousRect, b: nextRect })) {
                    return previousRect;
                }

                return nextRect;
            });
        };

        updateRect();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            updateRect();
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [element]);

    return rect;
};
