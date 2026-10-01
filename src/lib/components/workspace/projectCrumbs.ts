type LinkedProject = { id: string; name: string };
type LinkedTask = { id: string; title: string };

export type Crumb = { label: string; href: string };

export const projectsCrumb: Crumb = { label: 'Projects', href: '/projects' };

export function projectCrumbs(project: LinkedProject, parentTask: LinkedTask | null = null): Crumb[] {
	const crumbs = [projectsCrumb, { label: project.name, href: `/projects/${project.id}` }];
	if (parentTask === null) return crumbs;
	return [...crumbs, { label: parentTask.title, href: `/projects/${project.id}/tasks/${parentTask.id}` }];
}
