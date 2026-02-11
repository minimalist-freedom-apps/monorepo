import { basename } from 'node:path';
import type { ProjectType, Requirement, RequirementActionProps } from './requirements/Requirement';

interface RunProjectsProps {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
    readonly filteredRequirements: ReadonlyArray<Requirement>;
    readonly action: (
        requirement: Requirement,
        props: RequirementActionProps,
    ) => ReadonlyArray<string> | Promise<ReadonlyArray<string>>;
    readonly onDir?: (dir: string) => void;
}

export const runProjects = async ({
    projectDirs,
    projectType,
    filteredRequirements,
    action,
    onDir,
}: RunProjectsProps): Promise<ReadonlyArray<string>> => {
    const errors: Array<string> = [];

    for (const dir of projectDirs) {
        onDir?.(dir);
        const dirName = basename(dir);

        for (const requirement of filteredRequirements) {
            if (!requirement.applies({ projectType, dirName })) {
                continue;
            }

            const requirementErrors = await action(requirement, { appDir: dir });

            for (const error of requirementErrors) {
                errors.push(`${dir} [${requirement.name}]: ${error}`);
            }
        }
    }

    return errors;
};
