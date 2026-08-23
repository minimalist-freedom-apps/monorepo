import { BRAND_COLOR } from '@minimalist-apps/components/colors';
import { injectTemplateVars } from './injectTemplateVars';
import { readTemplate } from './readTemplate';

/**
 * Generates Android colors.xml content.
 * All three Android color slots use the shared BRAND_COLOR.
 */
export const generateColorsXml = (): string =>
    injectTemplateVars(readTemplate('colors.xml'), { brandColor: BRAND_COLOR });

/** Generates the blue debug launcher background used to distinguish development builds. */
export const generateDebugIconBackgroundXml = (): string =>
    readTemplate('debug-icon-background.xml');
