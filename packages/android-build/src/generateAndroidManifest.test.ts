import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    generateAndroidManifest,
    generateBackupRules,
    generateDataExtractionRules,
} from './generateAndroidManifest';

test('generates an Android manifest with app-data backup disabled', () => {
    const result = generateAndroidManifest();
    const applicationIdPlaceholder = '$' + '{applicationId}';

    assert.ok(result.includes('android:allowBackup="false"'));
    assert.ok(!result.includes('android:allowBackup="true"'));
    assert.ok(result.includes('android:dataExtractionRules="@xml/data_extraction_rules"'));
    assert.ok(result.includes('android:fullBackupContent="@xml/backup_rules"'));
    assert.ok(result.includes(`android:authorities="${applicationIdPlaceholder}.fileprovider"`));
});

test('excludes app data from cloud backup and device transfer', () => {
    const dataExtractionRules = generateDataExtractionRules();
    const backupRules = generateBackupRules();

    assert.ok(dataExtractionRules.includes('<cloud-backup>'));
    assert.ok(dataExtractionRules.includes('<device-transfer>'));
    assert.ok(dataExtractionRules.includes('<exclude domain="sharedpref" path="." />'));
    assert.ok(dataExtractionRules.includes('<exclude domain="database" path="." />'));
    assert.ok(backupRules.includes('<full-backup-content>'));
    assert.ok(backupRules.includes('<exclude domain="root" path="." />'));
});
