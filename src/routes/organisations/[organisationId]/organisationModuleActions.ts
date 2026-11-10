import { error, fail } from '@sveltejs/kit';
import { isOrganisationModule, moduleSwitchedSentence, unknownModuleRefusal } from '$lib/data/organisationModules';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { setOrganisationModule } from '$lib/server/organisations/setOrganisationModule';
import type { Actions } from './$types';

export const onlyAdministratorsSwitchModules = 'Only a Your Business Today administrator switches modules.';

const switchStates = { on: 'true', off: 'false' } as const;

export const organisationModuleActions = {
	setModule: async ({ locals, params, request }) => {
		const { user, organisation, isStaff } = await requireOrganisationAccess(locals, params.organisationId);
		if (!isStaff) error(403, onlyAdministratorsSwitchModules);
		const formData = await request.formData();
		const module = String(formData.get('module') ?? '');
		const switchState = String(formData.get('isOn') ?? '');
		if (!isOrganisationModule(module)) return fail(400, { message: unknownModuleRefusal });
		if (switchState !== switchStates.on && switchState !== switchStates.off) {
			return fail(400, { message: 'isOn must be true or false.' });
		}
		const isOn = switchState === switchStates.on;
		await setOrganisationModule(locals.supabase, { organisationId: organisation.id, module, isOn, switchedBy: user.id });
		return { message: moduleSwitchedSentence(module, isOn, organisation.name) };
	}
} satisfies Actions;
