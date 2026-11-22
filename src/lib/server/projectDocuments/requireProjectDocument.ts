import { error } from '@sveltejs/kit';
import { findKeptDocument } from './findProjectDocuments';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

const notFound = 404;

/** The project the signed-in person is on, and the document of it they asked for; 404 for any other. */
export async function requireProjectDocument(locals: App.Locals, projectId: string, documentId: string): Promise<{ project: Project; document: ProjectDocument }> {
	const { project } = await requireProjectAccess(locals, projectId);
	const document = await findKeptDocument(locals.supabase, project.id, documentId);
	if (document === null) error(notFound, 'There is no such document on this project.');
	return { project, document };
}
