import { readTemplate } from './readTemplate';

/** Generates a manifest that excludes private app data from Android backups. */
export const generateAndroidManifest = (): string => readTemplate('AndroidManifest.xml');

/** Generates Android 12+ rules that exclude app data from backup and device transfer. */
export const generateDataExtractionRules = (): string => readTemplate('data_extraction_rules.xml');

/** Generates Android 11 and lower rules that exclude app data from backup. */
export const generateBackupRules = (): string => readTemplate('backup_rules.xml');
