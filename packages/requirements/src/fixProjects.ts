import type { ProjectType, Requirement } from './requirements/Requirement';
import { runProjects } from './runProjects';

export interface FixProjectsProps {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
    readonly filteredRequirements: ReadonlyArray<Requirement>;
}

export const fixProjects = ({
    projectDirs,
    projectType,
    filteredRequirements,
}: FixProjectsProps): Promise<ReadonlyArray<string>> =>
    runProjects({
        projectDirs,
        projectType,
        filteredRequirements,
        action: (requirement, props) => requirement.fix(props),
        onDir: dir => {
            console.log(`\nFixing ${dir}…`);
        },
    });
