import { pathToFileURL } from 'node:url';
import type { AppConfig } from './AppConfig';

export const loadAppConfig = async (configPath: string): Promise<AppConfig> => {
    const { config } = (await import(pathToFileURL(configPath).href)) as {
        readonly config: AppConfig;
    };

    return config;
};
