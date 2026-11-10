import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getPerson } from '$lib/server/people/getPerson';
import { noSuchPerson } from './describePerson';
import { objectSchema, proseField, textField } from '../actionTypes';
import { personApproachLimits } from '$lib/data/personApproachRules';
import { savePersonApproach } from '$lib/server/people/approach/savePersonApproach';
import { savePersonApproachGuidance } from './personApproachGuidance';
import { validatePersonApproach } from '$lib/server/people/approach/validatePersonApproach';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const limits = personApproachLimits;

const approachSchema = objectSchema(
	{
		personId: textField('The person id, as read_client gives it beside each of a company\'s people'),
		openingMessage: proseField(`The first email or message to them, at most ${limits.longestOpeningMessage} characters`),
		callPlan: proseField(`The call plan as short lines, at most ${limits.longestCallPlan} characters`)
	},
	['personId', 'openingMessage', 'callPlan']
);

export const personApproachActions: McpAction[] = [
	{
		name: 'save_person_approach',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'save the first approach you drafted to a person — an opening message and a call plan — to their notes on the People register',
		guidance: savePersonApproachGuidance,
		inputSchema: approachSchema,
		run: async (caller, input) => saveApproachOnPerson(caller, input)
	}
];

async function saveApproachOnPerson(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const approach = validatePersonApproach(input);
	if (typeof approach === 'string') return approach;
	const person = await getPerson(caller.supabase, approach.personId);
	if (person === null) return noSuchPerson;
	const companies = await getCompaniesForPerson(caller.supabase, person.id);
	await savePersonApproach(caller.supabase, approach, person.name, companies, caller.accountId);
	return `${person.name}'s approach is saved to their notes as a "Drafted approach", and the draft recorded on ${companies.length} company(ies).`;
}
