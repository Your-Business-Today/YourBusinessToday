import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientStage } from '$lib/data/clientLifecycle';
import { isAwaitingAnswer, parseTaskKind } from '$lib/data/taskKind';
import { parseTaskStatus } from '$lib/data/taskStatus';
import { parseClientRecord, type Client } from './clientRecord';

export type ClientSummary = Client & {
	primaryContactName: string;
	projectCount: number;
	awaitingAnswerCount: number;
};

export async function listClients(
	supabase: SupabaseClient,
	stage: ClientStage | null = null
): Promise<ClientSummary[]> {
	const query = supabase
		.from('clients')
		.select('*, client_contacts(is_primary, people(name)), projects(id, tasks(kind, status))')
		.order('name');
	const { data, error } = stage === null ? await query : await query.eq('lifecycle_stage', stage);
	if (error) throw error;
	return data.map(toSummary);
}

type ProjectRow = { tasks: { kind: string; status: string }[] };
type ContactRow = { is_primary: boolean; people: { name: string } | null };

function toSummary(row: Record<string, unknown>): ClientSummary {
	const projects = (row.projects ?? []) as ProjectRow[];
	return {
		...parseClientRecord(row),
		primaryContactName: primaryContactName((row.client_contacts ?? []) as ContactRow[]),
		projectCount: projects.length,
		awaitingAnswerCount: countAwaitingAnswer(projects)
	};
}

function primaryContactName(contacts: ContactRow[]): string {
	const primary = contacts.find((contact) => contact.is_primary) ?? contacts[0];
	if (primary === undefined) return '';
	const person = primary.people;
	return person?.name ?? '';
}

function countAwaitingAnswer(projects: ProjectRow[]): number {
	return projects
		.flatMap((project) => project.tasks)
		.filter((task) => isAwaitingAnswer(parseTaskKind(task.kind), parseTaskStatus(task.status))).length;
}
