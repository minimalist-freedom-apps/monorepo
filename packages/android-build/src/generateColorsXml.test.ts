import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateDebugIconBackgroundXml } from './generateColorsXml';

test('generates the blue debug launcher icon background', () => {
    const result = generateDebugIconBackgroundXml();

    assert.ok(result.includes('<color name="ic_launcher_background">#1565C0</color>'));
});
