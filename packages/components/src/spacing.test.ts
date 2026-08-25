import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildSpacingStyle } from './spacing';

describe(buildSpacingStyle.name, () => {
    test('applies scalar spacing to all sides', () => {
        assert.deepStrictEqual(buildSpacingStyle({ padding: 16 }), {
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 16,
            paddingLeft: 16,
        });
    });

    test('supports horizontal and vertical shorthands', () => {
        assert.deepStrictEqual(buildSpacingStyle({ padding: { vertical: 8, horizontal: 12 } }), {
            paddingTop: 8,
            paddingRight: 12,
            paddingBottom: 8,
            paddingLeft: 12,
        });
    });

    test('prefers explicit sides over horizontal and vertical values', () => {
        assert.deepStrictEqual(
            buildSpacingStyle({
                padding: { top: 4, right: 6, vertical: 8, horizontal: 10 },
            }),
            {
                paddingTop: 4,
                paddingRight: 6,
                paddingBottom: 8,
                paddingLeft: 10,
            },
        );
    });
});
