import assert from 'node:assert/strict';
import { test } from 'node:test';
import './cssLoader';

test('loads CSS imports as empty modules', async () => {
    const fixtureUrl = new URL('./cssLoaderFixture.css', import.meta.url);
    const cssModule: unknown = await import(fixtureUrl.href);

    assert(cssModule !== null && typeof cssModule === 'object');
    assert.deepStrictEqual(Reflect.get(cssModule, 'default'), {});
});
