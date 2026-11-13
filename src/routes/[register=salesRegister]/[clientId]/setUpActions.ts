import { fail } from '@sveltejs/kit';
import { describeClientSetUp } from '$lib/server/onboarding/describeClientSetUp';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { readSetUpPeople } from '$lib/server/onboarding/readSetUpForm';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { setClientUp } from '$lib/server/onboarding/setClientUp';
import { validateSetUpPeople } from '$lib/server/onboarding/validateClientSetUp';
import type { Actions } from './$types';

const badRequest = 400;

export const setUpActions: Actions = {
	setUpClient: async ({ locals, params, request, url }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const contacts = await getContactsForClient(locals.supabase, params.clientId);
		const people = validateSetUpPeople(readSetUpPeople(formData, contacts));
		if (isRefusal(people)) return fail(badRequest, { message: people.refusal });
		const setUpRequest = { clientId: params.clientId, people, origin: url.origin, actorAccountId: user.id };
		const setUp = await setClientUp(setUpRequest);
		if (isRefusal(setUp)) return fail(badRequest, { message: setUp.refusal });
		return { message: describeClientSetUp(setUp) };
	}
};
