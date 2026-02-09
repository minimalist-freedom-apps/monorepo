import { requireAndroidSetup } from './requirements/androidSetup/requireAndroidSetup';
import { requireAppConfig } from './requirements/appConfig/requireAppConfig';
import { requireIcons } from './requirements/appIcons/requireIcons';
import { requiredAppScripts } from './requirements/appScripts/requiredAppScripts';
import { requireDescription } from './requirements/description/requireDescription';
import type { Requirement } from './requirements/Requirement';
import { requireTsconfig } from './requirements/tsconfig/requireTsconfig';

export const requirements: ReadonlyArray<Requirement> = [
    requireAppConfig,
    requiredAppScripts,
    requireAndroidSetup,
    requireIcons,
    requireDescription,
    requireTsconfig,
];
