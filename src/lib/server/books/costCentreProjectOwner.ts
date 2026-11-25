import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';

export type OwnedProject = { id: string; name: string };

type ProjectRow = { id: string; name: string; organisation_id: string | null };

/** The project a cost centre is to be kept for, refused unless it is the organisation's own; null when none is given. */
export async function projectOfOrganisation(supabase: SupabaseClient, organisationId: string, projectId: unknown): Promise<OwnedProject | null> {
	if (projectId === undefined || projectId === null || projectId === '') return null;
	refuseWhen(validateRecordId('project', String(projectId)));
	const { data, error } = await supabase.from('projects').select('id, name, organisation_id').eq('id', projectId).maybeSingle();
	if (error !== null) throw error;
	const project = data as ProjectRow | null;
	if (project === null) throw new BooksRefusal(`No project ${projectId} can be found; list_projects gives each project's id.`);
	if (project.organisation_id !== organisationId)
		throw new BooksRefusal(`Project ${project.name} is not one of this organisation's own; a cost centre is kept for one of its own projects.`);
	return { id: project.id, name: project.name };
}
