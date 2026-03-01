import type { ProjectType, Requirement } from './requirements/Requirement';
import { runProjects } from './runProjects';

interface VerifyProjectsProps {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
    readonly filteredRequirements: ReadonlyArray<Requirement>;
}

export const verifyProjects = ({
    projectDirs,
    projectType,
    filteredRequirements,
}: VerifyProjectsProps): Promise<ReadonlyArray<string>> =>
    runProjects({
        projectDirs,
        projectType,
        filteredRequirements,
        action: (requirement, props) => requirement.verify(props),
    });
