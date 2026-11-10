import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { setOrganisationModule } from '$lib/server/organisations/setOrganisationModule';
import {
	isOrganisationModule,
	moduleListSentence,
	moduleSwitchedSentence,
	organisationModuleLabels,
	organisationModules,
	unknownModuleRefusal
} from '$lib/data/organisationModules';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';

const switchStateRefusal = 'isOn must be true or false.';

const moduleField = {
	type: 'string',
	enum: [...organisationModules],
	description: `The module: ${organisationModules.map((module) => `${module} (${organisationModuleLabels[module]})`).join(', ')}`
};

const isOnField = { type: 'boolean', description: 'true switches the module on, false switches it off' };

export const organisationModuleActions: McpAction[] = [
	{
		name: 'set_organisation_module',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: 'switch Books, Brand, Your Business Brain or Boardroom on or off for an organisation',
		guidance:
			'Every organisation starts with all four off. A module that is off shows nowhere for that organisation, on ' +
			'the site or in the connector. Each organisation is one company and is switched on its own. Switching off keeps everything the module holds; switching on again shows it as it was.',
		inputSchema: objectSchema({ organisationId: organisationIdField, module: moduleField, isOn: isOnField }, [
			'organisationId',
			'module',
			'isOn'
		]),
		run: async (caller, input) => {
			const module = readText(input, 'module');
			if (!isOrganisationModule(module)) return unknownModuleRefusal;
			if (typeof input.isOn !== 'boolean') return switchStateRefusal;
			const organisation = await reachableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return noSuchOrganisation;
			const moduleSwitch = { organisationId: organisation.id, module, isOn: input.isOn, switchedBy: caller.accountId };
			await setOrganisationModule(caller.supabase, moduleSwitch);
			const switchedOn = await getSwitchedOnModules(caller.supabase, organisation.id);
			const switchedSentence = moduleSwitchedSentence(module, input.isOn, organisation.name);
			return `${switchedSentence} Switched on now: ${moduleListSentence(switchedOn)}.`;
		}
	}
];
