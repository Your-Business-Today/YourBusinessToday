type LinkedProject = { id: string; name: string };
type LinkedTask = { id: string; title: string };

export type Crumb = { label: string; href: string };

export const projectsCrumb: Crumb = { label: 'Projects', href: '/projects' };

/** The way back from a task or a goal: its project's board, then the task it sits under. The top bar leads to the project. */
export function projectCrumbs(project: LinkedProject, parentTask: LinkedTask | null = null): Crumb[] {
	const boardCrumb = { label: project.name, href: `/projects/${project.id}` };
	if (parentTask === null) return [boardCrumb];
	return [boardCrumb, { label: parentTask.title, href: `${boardCrumb.href}/tasks/${parentTask.id}` }];
}
