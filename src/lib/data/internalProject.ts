import { boardSideOfDepartment, boardSideOrder, boardSides, type BoardSide } from './boardSide';
import { departmentOrder, type Department } from './department';

export const internalProjectLabel = 'Internal';

export const internalProjectMeaning =
	'a project that is not software, such as an office move or an accreditation: it has no repository and no ' +
	'development work, so its page shows Internal work only and nothing about code, deploys or the kit';

export const leaveRepositoryBlankForInternal =
	'Leave the repository blank for an internal project, one that is not software. Adding a repository later, ' +
	'or raising a development task on it, brings its Development side in.';

const noRepository = '';

export function hasNoRepository(project: { repositoryUrl: string }): boolean {
	return project.repositoryUrl === noRepository;
}

type DepartmentalWork = { department: Department };

/** The departments of the Development side: work that is built, and the systems it runs on. */
export const developmentSideDepartments: Department[] = departmentOrder.filter(
	(department) => boardSideOfDepartment(department) === boardSides.development
);

export function hasDevelopmentWork(work: DepartmentalWork[]): boolean {
	return work.some((item) => developmentSideDepartments.includes(item.department));
}

/**
 * A project with no repository and no development work is internal. A repository, or one development
 * task or goal, keeps its Development side, so no project loses work it already holds.
 */
export function isInternalProject(project: { repositoryUrl: string }, work: DepartmentalWork[]): boolean {
	return hasNoRepository(project) && !hasDevelopmentWork(work);
}

/** The sides a project page shows: Internal work alone for an internal project, else both. */
export function boardSidesOfProject(isInternal: boolean): BoardSide[] {
	if (isInternal) return [boardSides.internal];
	return boardSideOrder;
}
