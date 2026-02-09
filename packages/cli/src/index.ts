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

interface ParseArgsResult {
    readonly filter: string | undefined;
    readonly only: string | undefined;
}

export const parseArgs = (argv: ReadonlyArray<string>): ParseArgsResult => {
    const filterIndex = argv.indexOf('--filter');
    const filter = filterIndex !== -1 ? argv[filterIndex + 1] : undefined;

    const onlyIndex = argv.indexOf('--only');
    const only = onlyIndex !== -1 ? argv[onlyIndex + 1] : undefined;

    return { filter, only };
};

interface FilterDirsProps {
    readonly dirs: ReadonlyArray<string>;
    readonly filter: string | undefined;
}

export const filterDirs = ({ dirs, filter }: FilterDirsProps): ReadonlyArray<string> => {
    if (filter === undefined) {
        return dirs;
    }

    return dirs.filter(dir => dir.endsWith(`/${filter}`));
};

interface HasName {
    readonly name: string;
}

interface FilterByNameProps<T extends HasName> {
    readonly items: ReadonlyArray<T>;
    readonly only: string | undefined;
}

export const filterByName = <T extends HasName>({
    items,
    only,
}: FilterByNameProps<T>): ReadonlyArray<T> => {
    if (only === undefined) {
        return items;
    }

    return items.filter(item => item.name === only);
};
