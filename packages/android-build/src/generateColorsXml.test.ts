import { expect, test } from 'vitest';
import { generateDebugIconBackgroundXml } from './generateColorsXml';

test('generates the blue debug launcher icon background', () => {
    const result = generateDebugIconBackgroundXml();

    expect(result).toContain('<color name="ic_launcher_background">#1565C0</color>');
});
