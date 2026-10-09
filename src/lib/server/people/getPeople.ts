import type { SupabaseClient } from '@supabase/supabase-js';
import { parseClientStage, type ClientStage } from '$lib/data/clientLifecycle';
import { parsePersonRecord, type Person } from './personRecord';

export type PersonSummary = Person & { companyStages: ClientStage[] };

type AffiliationRow = { clients: { lifecycle_stage: string } | null };

export async function getPeople(supabase: SupabaseClient): Promise<PersonSummary[]> {
	const { data, error } = await supabase
		.from('people')
		.select('*, client_contacts(clients(lifecycle_stage))')
		.order('name');
	if (error) throw error;
	return data.map(toSummary);
}

function toSummary(row: Record<string, unknown>): PersonSummary {
	const affiliations = (row.client_contacts ?? []) as AffiliationRow[];
	return {
		...parsePersonRecord(row),
		companyStages: affiliations
			.filter((affiliation) => affiliation.clients !== null)
			.map(stageOf)
	};
}

function stageOf(affiliation: AffiliationRow): ClientStage {
	const { clients } = affiliation;
	return parseClientStage(clients?.lifecycle_stage);
}
