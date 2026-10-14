import { fail } from '@sveltejs/kit';
import { invitePortalPerson } from '$lib/server/portal/invitePortalPerson';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { removePortalPerson } from '$lib/server/portal/removePortalPerson';
import { requirePortalAdministrator } from '$lib/server/portal/requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import { setPortalAdministrator } from '$lib/server/portal/setPortalAdministrator';
import {
	validateAdministratorChoice,
	validatePortalContactChoice,
	validatePortalInvite
} from '$lib/server/portal/validatePortalPerson';
import type { Actions } from './$types';

const badRequest = 400;

export const portalPeopleActions = {
	invitePerson: async ({ locals, request, url }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalAdministrator(locals);
		const invite = validatePortalInvite(await request.formData());
		if (isRefusal(invite)) return fail(badRequest, { message: invite.refusal });
		const refusal = await invitePortalPerson(visitor, invite, url.origin, user.id);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: `Invitation sent to ${invite.email}.` };
	},
	removePerson: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalAdministrator(locals);
		const choice = validatePortalContactChoice(await request.formData());
		if (isRefusal(choice)) return fail(badRequest, { message: choice.refusal });
		const refusal = await removePortalPerson(visitor, choice.contactId, user.id);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Removed. They can no longer sign in to your portal.' };
	},
	setAdministrator: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalAdministrator(locals);
		const choice = validateAdministratorChoice(await request.formData());
		if (isRefusal(choice)) return fail(badRequest, { message: choice.refusal });
		const refusal = await setPortalAdministrator(visitor, choice, user.id);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Saved.' };
	}
} satisfies Actions;
