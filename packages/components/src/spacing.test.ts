import { describe, expect, test } from 'vitest';
import { buildSpacingStyle } from './spacing';

describe(buildSpacingStyle.name, () => {
    test('applies scalar spacing to all sides', () => {
        expect(buildSpacingStyle({ padding: 16 })).toEqual({
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 16,
            paddingLeft: 16,
        });
    });

    test('supports horizontal and vertical shorthands', () => {
        expect(buildSpacingStyle({ padding: { vertical: 8, horizontal: 12 } })).toEqual({
            paddingTop: 8,
            paddingRight: 12,
            paddingBottom: 8,
            paddingLeft: 12,
        });
    });

    test('prefers explicit sides over horizontal and vertical values', () => {
        expect(
            buildSpacingStyle({
                padding: { top: 4, right: 6, vertical: 8, horizontal: 10 },
            }),
        ).toEqual({
            paddingTop: 4,
            paddingRight: 6,
            paddingBottom: 8,
            paddingLeft: 10,
        });
    });
});
