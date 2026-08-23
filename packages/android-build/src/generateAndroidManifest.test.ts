import { expect, test } from 'vitest';
import {
    generateAndroidManifest,
    generateBackupRules,
    generateDataExtractionRules,
} from './generateAndroidManifest';

test('generates an Android manifest with app-data backup disabled', () => {
    const result = generateAndroidManifest();
    const applicationIdPlaceholder = '$' + '{applicationId}';

    expect(result).toContain('android:allowBackup="false"');
    expect(result).not.toContain('android:allowBackup="true"');
    expect(result).toContain('android:dataExtractionRules="@xml/data_extraction_rules"');
    expect(result).toContain('android:fullBackupContent="@xml/backup_rules"');
    expect(result).toContain(`android:authorities="${applicationIdPlaceholder}.fileprovider"`);
});

test('excludes app data from cloud backup and device transfer', () => {
    const dataExtractionRules = generateDataExtractionRules();
    const backupRules = generateBackupRules();

    expect(dataExtractionRules).toContain('<cloud-backup>');
    expect(dataExtractionRules).toContain('<device-transfer>');
    expect(dataExtractionRules).toContain('<exclude domain="sharedpref" path="." />');
    expect(dataExtractionRules).toContain('<exclude domain="database" path="." />');
    expect(backupRules).toContain('<full-backup-content>');
    expect(backupRules).toContain('<exclude domain="root" path="." />');
});
