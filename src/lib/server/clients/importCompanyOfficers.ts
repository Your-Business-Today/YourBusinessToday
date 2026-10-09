import type { SupabaseClient } from '@supabase/supabase-js';
import { affiliatePersonWithClient } from './affiliatePersonWithClient';
import { findOrCreatePersonFromOfficer } from '$lib/server/people/findOrCreatePersonFromOfficer';
import { getCompanyOfficers } from '$lib/server/companiesHouse/getCompanyOfficers';
import type { CompanyOfficer } from '$lib/server/companiesHouse/companyOfficerRecord';
import { recordClientEvent } from './recordClientEvent';
import type { Client } from './clientRecord';

export type OfficerImport = { importedCount: number; alreadyListedCount: number };

export async function importCompanyOfficers(
	supabase: SupabaseClient,
	client: Client,
	actorAccountId: string
): Promise<OfficerImport> {
	const { profile } = client;
	const officers = await getCompanyOfficers(profile.companyNumber);
	const outcome: OfficerImport = { importedCount: 0, alreadyListedCount: 0 };
	const importedNames: string[] = [];
	for (const officer of officers) {
		const wasImported = await importOfficer(supabase, client.id, officer);
		if (wasImported) importedNames.push(officer.name);
		if (wasImported) outcome.importedCount += 1;
		if (!wasImported) outcome.alreadyListedCount += 1;
	}
	if (outcome.importedCount > 0) {
		await recordClientEvent(
			supabase,
			client.id,
			'officers_imported',
			{ imported: outcome.importedCount, names: importedNames.join(', ') },
			actorAccountId
		);
	}
	return outcome;
}

async function importOfficer(
	supabase: SupabaseClient,
	clientId: string,
	officer: CompanyOfficer
): Promise<boolean> {
	const personId = await findOrCreatePersonFromOfficer(supabase, officer);
	const affiliation = await affiliatePersonWithClient(supabase, {
		personId,
		clientId,
		role: officer.officerRole,
		isPrimary: false,
		officerRole: officer.officerRole,
		appointedOn: officer.appointedOn,
		source: 'companies_house'
	});
	return affiliation === 'affiliated';
}
