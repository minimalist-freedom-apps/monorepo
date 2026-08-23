import { expect, test } from 'vitest';
import { generateDebugStringsXml } from './generateStringsXml';

test('generates debug launcher labels with a development suffix', () => {
    const result = generateDebugStringsXml({ appName: 'Five in a Row' });

    expect(result).toContain('<string name="app_name">Five in a Row (Dev)</string>');
    expect(result).toContain('<string name="title_activity_main">Five in a Row (Dev)</string>');
});
