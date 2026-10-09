import { parseClientStage, type ClientStage } from '$lib/data/clientLifecycle';
import { parseLeadSource, type LeadSource } from '$lib/data/leadSources';
import { parseCompanyProfileRecord, type CompanyProfile } from './companyProfile';

export type Client = {
	id: string;
	name: string;
	website: string;
	address: string;
	stage: ClientStage;
	leadSource: LeadSource;
	profile: CompanyProfile;
	ownerId: string | null;
	parentClientId: string | null;
	isArchived: boolean;
	createdAt: string;
};

export function parseClientRecord(row: Record<string, unknown>): Client {
	return {
		id: row.id as string,
		name: row.name as string,
		website: (row.website ?? '') as string,
		address: (row.address ?? '') as string,
		stage: parseClientStage(row.lifecycle_stage),
		leadSource: parseLeadSource(row.lead_source),
		profile: parseCompanyProfileRecord(row),
		ownerId: (row.owner_id ?? null) as string | null,
		parentClientId: (row.parent_client_id ?? null) as string | null,
		isArchived: row.is_archived as boolean,
		createdAt: row.created_at as string
	};
}

export function companyNumberOf(client: Client): string {
	const { profile } = client;
	return profile.companyNumber;
}

export function hasCompanyNumber(client: Client): boolean {
	return companyNumberOf(client) !== '';
}
