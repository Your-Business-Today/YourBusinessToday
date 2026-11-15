import type { SupabaseClient } from '@supabase/supabase-js';
import { parseClientStage, type ClientStage } from '$lib/data/clientLifecycle';
import { parsePersonRecord, type Person } from './personRecord';

/** A company someone to follow up sits on: enough to name it, link to it and say whose register keeps it. */
export type FollowUpCompany = { id: string; name: string; stage: ClientStage; keptByOrganisationId: string };

/** Someone whose next step has its day, with the companies they sit on: who to follow up, about what, by when and where. */
export type FollowUp = Person & { nextActionDue: string; companies: FollowUpCompany[] };

type CompanyRow = { id: string; name: string; lifecycle_stage: string; kept_by_organisation_id: string };
type AffiliationRow = { clients: CompanyRow | null };

const followUpColumns = '*, client_contacts(clients(id, name, lifecycle_stage, kept_by_organisation_id))';

/** Everyone whose next step falls on or before the day, the longest overdue first. A day with no step, or a step with no day, is never due. */
export async function getFollowUpsDue(supabase: SupabaseClient, until: string): Promise<FollowUp[]> {
	const { data, error } = await supabase.from('people').select(followUpColumns).lte('next_action_due', until).order('next_action_due').order('name');
	if (error) throw error;
	return data.map(toFollowUp).filter((followUp) => followUp.nextAction !== '');
}

/** The follow-ups one organisation's register shows. With no organisation picked there is no register, so none. */
export async function getFollowUpsKeptBy(supabase: SupabaseClient, organisationId: string | null, until: string): Promise<FollowUp[]> {
	if (organisationId === null) return [];
	return followUpsKeptBy(await getFollowUpsDue(supabase, until), organisationId);
}

/** The follow-ups with people who sit on a company the organisation keeps, each with those companies alone. */
export function followUpsKeptBy(followUps: FollowUp[], organisationId: string): FollowUp[] {
	return followUps.map((followUp) => withCompaniesKeptBy(followUp, organisationId)).filter(sitsOnACompany);
}

function withCompaniesKeptBy(followUp: FollowUp, organisationId: string): FollowUp {
	const companies = followUp.companies.filter((company) => company.keptByOrganisationId === organisationId);
	return { ...followUp, companies };
}

function sitsOnACompany({ companies }: FollowUp): boolean {
	return companies.length > 0;
}

function toFollowUp(row: Record<string, unknown>): FollowUp {
	const affiliations = (row.client_contacts ?? []) as AffiliationRow[];
	return {
		...parsePersonRecord(row),
		nextActionDue: row.next_action_due as string,
		companies: affiliations.flatMap(({ clients }) => (clients === null ? [] : [toCompany(clients)]))
	};
}

function toCompany(row: CompanyRow): FollowUpCompany {
	return { id: row.id, name: row.name, stage: parseClientStage(row.lifecycle_stage), keptByOrganisationId: row.kept_by_organisation_id };
}
