import { fail, redirect } from '@sveltejs/kit';
import { addPerson, readNewPersonSeed } from '$lib/server/people/addPerson';
import { ensurePersonForOfficer } from '$lib/server/people/ensurePersonForOfficer';
import { getPeople } from '$lib/server/people/getPeople';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { searchOfficers } from '$lib/server/companiesHouse/searchOfficers';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { OfficerSearchResult } from '$lib/server/companiesHouse/officerSearchRecord';
import type { Actions, PageServerLoad } from './$types';

const importCompaniesQuery = 'import=companies';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const officerQuery = (url.searchParams.get('officer') ?? '').trim();
	const isConfigured = isCompaniesHouseConfigured();
	const officers = await officersFor(officerQuery, isConfigured);
	return {
		people: await getPeople(locals.supabase),
		officerQuery,
		isCompaniesHouseConfigured: isConfigured,
		officers,
		officerSearchFailed: officerQuery !== '' && isConfigured && officers === null
	};
};

/** The register being unreachable costs the search, never the page. */
async function officersFor(query: string, isConfigured: boolean): Promise<OfficerSearchResult[] | null> {
	if (query === '' || !isConfigured) return null;
	try {
		return await searchOfficers(query);
	} catch (failure) {
		console.error('Officer search failed', failure);
		return null;
	}
}

export const actions: Actions = {
	addPerson: async ({ locals, request }) => {
		await requireStaff(locals);
		const seed = readNewPersonSeed(await request.formData());
		if (seed === null) return fail(400, { message: 'A name is required.' });
		const added = await addPerson(locals.supabase, seed);
		redirect(303, `/people/${added.personId}`);
	},
	addOfficer: async ({ locals, request }) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const officerId = String(formData.get('officerId') ?? '').trim();
		const name = String(formData.get('name') ?? '').trim();
		if (officerId === '' || name === '') return fail(400, { message: 'An officer is required.' });
		const personId = await ensurePersonForOfficer(locals.supabase, { officerId, name });
		redirect(303, `/people/${personId}?${importCompaniesQuery}`);
	}
};
