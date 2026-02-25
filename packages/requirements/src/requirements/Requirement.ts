export type ProjectType = 'app' | 'package';

export interface RequirementAppliesProps {
    readonly projectType: ProjectType;
    readonly dirName: string;
}

export interface RequirementActionProps {
    readonly appDir: string;
}

export interface Requirement {
    readonly name: string;

    readonly applies: ({ projectType, dirName }: RequirementAppliesProps) => boolean;

    readonly fix: ({ appDir }: RequirementActionProps) => Promise<ReadonlyArray<string>>;

    readonly verify: ({
        appDir,
    }: RequirementActionProps) => ReadonlyArray<string> | Promise<ReadonlyArray<string>>;
}
