import { fail, redirect } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { isAnthropicConfigured } from '$lib/server/anthropic/isAnthropicConfigured';
import { readResearchedLeadForm } from '$lib/server/clients/readResearchedLeadForm';
import { researchCompany, researchOutcomeKinds } from '$lib/server/clients/researchCompany';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { saveResearchedLead } from '$lib/server/clients/saveResearchedLead';
import type { Actions, PageServerLoad } from './$types';

const researchFailedMessage = 'The research could not be completed just now — please try again.';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const clientId = url.searchParams.get('clientId');
	const existingClient = clientId === null ? null : await getClient(locals.supabase, clientId);
	return {
		query: url.searchParams.get('query') ?? existingClient?.website ?? '',
		existingClient,
		isClaudeConfigured: isAnthropicConfigured()
	};
};

export const actions: Actions = {
	research: async ({ locals, request }) => {
		await requireStaff(locals);
		if (!isAnthropicConfigured()) return fail(503, { message: 'Claude is not configured on this server.' });
		const formData = await request.formData();
		const query = String(formData.get('query') ?? '').trim();
		const clientId = String(formData.get('clientId') ?? '');
		if (query === '') return fail(400, { message: 'A company name or website is required.' });
		try {
			const outcome = await researchCompany(query);
			if (outcome.kind === researchOutcomeKinds.noWebsite) return fail(404, { message: outcome.message });
			return { researched: outcome.profile, clientId };
		} catch (failure) {
			console.error('Company research failed', failure);
			return fail(502, { message: researchFailedMessage });
		}
	},
	saveLead: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const lead = readResearchedLeadForm(await request.formData());
		if (lead === null) return fail(400, { message: 'A company name is required.' });
		const clientId = await saveResearchedLead(locals.supabase, lead, user.id);
		redirect(303, `/clients/${clientId}`);
	}
};
