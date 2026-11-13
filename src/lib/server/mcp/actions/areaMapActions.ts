import { areaFor } from '$lib/server/clients/area/areaOutcome';
import { describeAreaMap } from './describeAreaMap';
import { defaultRadiusMiles, radiusOrder } from '$lib/data/mapRadii';
import { objectSchema, textField } from '../actionTypes';
import { validateAreaSearch } from '$lib/data/areaSearch';
import type { McpAction } from '../actionTypes';

export const areaMapActions: McpAction[] = [
	{
		name: 'read_area_map',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'the companies around a postcode, nearest first, as the area map shows them: our standing with each, and the ones Companies House holds there',
		guidance:
			'This is the area map: a company already on our register is shown with its stage and client id, and one that is not can be added ' +
			'with add_company_as_lead by its company number. Companies House shows the nearest around a busy postcode; narrow with SIC codes ' +
			'or a smaller radius to see the rest. A registered-office hub is one address holding many companies, most of them not trading there.',
		inputSchema: objectSchema(
			{
				postcode: textField('The postcode at the centre, such as SW1A 1AA'),
				radiusMiles: { type: 'integer', enum: radiusOrder, description: `How far around it, in miles; leave out for ${defaultRadiusMiles}` },
				sicCodes: textField('Five-digit SIC codes to narrow the search to, separated by commas')
			},
			['postcode']
		),
		run: async (caller, input) => {
			const search = validateAreaSearch(input);
			if (typeof search === 'string') return search;
			const outcome = await areaFor(caller.supabase, search);
			if (outcome.area === null) return outcome.notice ?? '';
			return describeAreaMap(outcome.area);
		}
	}
];
