import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateDebugStringsXml } from './generateStringsXml';

test('generates debug launcher labels with a development suffix', () => {
    const result = generateDebugStringsXml({ appName: 'Five in a Row' });

    assert.ok(result.includes('<string name="app_name">Five in a Row (Dev)</string>'));
    assert.ok(result.includes('<string name="title_activity_main">Five in a Row (Dev)</string>'));
});
