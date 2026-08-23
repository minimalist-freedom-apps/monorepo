import { injectTemplateVars } from './injectTemplateVars';
import { readTemplate } from './readTemplate';

interface GenerateStringsXmlProps {
    readonly appName: string;
    readonly appId: string;
}

interface GenerateDebugStringsXmlProps {
    readonly appName: string;
}

/**
 * Generates Android strings.xml content from app config.
 * App name and package identifiers are driven by config.ts.
 */
export const generateStringsXml = ({ appName, appId }: GenerateStringsXmlProps): string =>
    injectTemplateVars(readTemplate('strings.xml'), { appName, appId });

/** Generates debug-only launcher labels that distinguish the app from release builds. */
export const generateDebugStringsXml = ({ appName }: GenerateDebugStringsXmlProps): string =>
    injectTemplateVars(readTemplate('debug-strings.xml'), { appName });
