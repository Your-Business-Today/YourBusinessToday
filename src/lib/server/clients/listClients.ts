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

const summaryColumns = '*, client_contacts(is_primary, people(name)), projects(id, tasks(kind, status))';

/** Every record on every organisation's register. */
export async function listClients(supabase: SupabaseClient): Promise<ClientSummary[]> {
	const { data, error } = await supabase.from('clients').select(summaryColumns).order('name');
	if (error) throw error;
	return data.map(toSummary);
}

/** The records one organisation's register keeps at the stages given. */
export async function listClientsKeptBy(
	supabase: SupabaseClient,
	organisationId: string,
	stages: ClientStage[]
): Promise<ClientSummary[]> {
	const { data, error } = await supabase
		.from('clients')
		.select(summaryColumns)
		.eq('kept_by_organisation_id', organisationId)
		.in('lifecycle_stage', stages)
		.order('name');
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
