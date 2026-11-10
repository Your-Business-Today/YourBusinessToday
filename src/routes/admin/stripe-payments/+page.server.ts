import { fail } from '@sveltejs/kit';
import { stripeEventFields } from '$lib/components/admin/stripeEventFields';
import { validateRecordId } from '$lib/data/isUuid';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { requireUser } from '$lib/server/auth/requireUser';
import { findStripeEventsToCheck, markStripeEventDealtWith } from '$lib/server/billing/stripeEventsToCheck';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions, PageServerLoad } from './$types';

const badRequest = 400;
const alreadyDealtWith = 'That Stripe event was already dealt with.';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	return { events: await findStripeEventsToCheck(supabaseServiceClient()) };
};

export const actions = {
	dealtWith: async ({ locals, request }) => {
		await requireAdmin(locals);
		const administrator = await requireUser(locals);
		const eventRowId = String((await request.formData()).get(stripeEventFields.eventRowId) ?? '');
		const idRefusal = validateRecordId('Stripe event', eventRowId);
		if (idRefusal !== null) return fail(badRequest, { message: idRefusal });
		const isMarked = await markStripeEventDealtWith(supabaseServiceClient(), eventRowId, administrator.id);
		if (!isMarked) return fail(badRequest, { message: alreadyDealtWith });
		return { message: 'Marked dealt with.' };
	}
} satisfies Actions;
