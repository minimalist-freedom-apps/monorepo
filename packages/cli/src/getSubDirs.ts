import { readdirSync } from 'node:fs';
import { join } from 'node:path';

interface GetSubDirsProps {
    readonly parentDir: string;
}

export const getSubDirs = ({ parentDir }: GetSubDirsProps): ReadonlyArray<string> =>
    readdirSync(parentDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(parentDir, entry.name));
