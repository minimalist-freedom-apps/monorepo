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
