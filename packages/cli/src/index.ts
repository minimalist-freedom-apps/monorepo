import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const red = (text: string): string => `\x1b[31m${text}\x1b[0m`;
export const green = (text: string): string => `\x1b[32m${text}\x1b[0m`;

interface GetSubDirsProps {
    readonly parentDir: string;
}

export const getSubDirs = ({ parentDir }: GetSubDirsProps): ReadonlyArray<string> =>
    readdirSync(parentDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(parentDir, entry.name));
