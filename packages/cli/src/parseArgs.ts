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
