import { error, fail } from '@sveltejs/kit';
import { boardroomDirectorRefusals } from '$lib/data/boardroomDirectorRules';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { setBoardroomDirector } from '$lib/server/boardroom/setBoardroomDirector';
import type { Actions } from './$types';

export const onlyAdministratorsNameDirectors = 'Only a Your Business Today administrator names directors.';

const directorStates = { named: 'true', stoodDown: 'false' } as const;

export const organisationDirectorActions = {
	setDirector: async ({ locals, params, request }) => {
		const { user, organisation, isStaff } = await requireOrganisationAccess(locals, params.organisationId);
		if (!isStaff) error(403, onlyAdministratorsNameDirectors);
		const formData = await request.formData();
		const accountId = String(formData.get('accountId') ?? '').trim();
		const directorState = String(formData.get('isDirector') ?? '');
		if (accountId === '') return fail(400, { message: boardroomDirectorRefusals.notOnTheOrganisation });
		if (directorState !== directorStates.named && directorState !== directorStates.stoodDown) {
			return fail(400, { message: boardroomDirectorRefusals.isDirectorNotBoolean });
		}
		const isDirector = directorState === directorStates.named;
		const change = { member: accountId, isDirector, changedBy: user.id };
		const outcome = await setBoardroomDirector(locals.supabase, organisation, change);
		if (outcome.isRefusal) return fail(400, { message: outcome.message });
		return { message: outcome.message };
	}
} satisfies Actions;
