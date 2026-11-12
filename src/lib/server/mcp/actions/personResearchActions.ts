import { personNoteTitles } from '$lib/data/personNoteKind';
import { describePersonInFull, noSuchPerson } from './describePerson';
import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getPerson } from '$lib/server/people/getPerson';
import { getPersonEventsForClients } from '$lib/server/people/getPersonEventsForClients';
import { objectSchema, readText, textField } from '../actionTypes';
import { personResearchLimits } from '$lib/data/personResearchRules';
import { readPersonGuidance, savePersonResearchGuidance } from './personResearchGuidance';
import { savePersonFindings } from '$lib/server/people/research/savePersonFindings';
import { validatePersonResearch } from '$lib/server/people/research/validatePersonResearch';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const limits = personResearchLimits;
const personIdField = textField('The person id, as list_people and read_client give it');

const roleSchema = objectSchema(
	{
		title: textField(`The position, as the page gives it, at most ${limits.longestRoleTitle} characters`),
		organisation: textField(`Where they hold it, at most ${limits.longestOrganisation} characters`),
		sourceUrl: textField('The public page the role was read on')
	},
	['title', 'sourceUrl']
);

const linkSchema = objectSchema(
	{
		label: textField(`A short label such as "Company site", at most ${limits.longestLinkLabel} characters`),
		url: textField('The public page, starting https://')
	},
	['label', 'url']
);

const findingsSchema = objectSchema(
	{
		personId: personIdField,
		summary: textField(`Three or four plain sentences on who they are in business, at most ${limits.longestSummary} characters`),
		roles: { type: 'array', items: roleSchema, description: `Up to ${limits.mostRoles} roles found, each with its page` },
		links: { type: 'array', items: linkSchema, description: `Up to ${limits.mostLinks} pages worth keeping on their record` },
		sources: { type: 'array', items: { type: 'string' }, description: `Every public page you read, 1 to ${limits.mostSources}` }
	},
	['personId', 'summary', 'sources']
);

export const personResearchActions: McpAction[] = [
	{
		name: 'read_person',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'one person on the People register in full: their standing with us, links, notes, research and history, and every company they sit on, with its profile',
		guidance: readPersonGuidance,
		inputSchema: objectSchema({ personId: personIdField }, ['personId']),
		run: async (caller, input) => readPersonInFull(caller, readText(input, 'personId'))
	},
	{
		name: 'save_person_research',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'save what you found researching a person — a summary, their roles, links worth keeping and the pages read — to the People register',
		guidance: savePersonResearchGuidance,
		inputSchema: findingsSchema,
		run: async (caller, input) => saveResearchOnPerson(caller, input)
	}
];

async function readPersonInFull(caller: McpCaller, personId: string): Promise<string> {
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const companies = await getCompaniesForPerson(caller.supabase, person.id);
	const events = await getPersonEventsForClients(caller.supabase, companies.map((company) => company.id));
	return describePersonInFull(person, companies, events);
}

async function saveResearchOnPerson(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const findings = validatePersonResearch(input);
	if (typeof findings === 'string') return findings;
	const person = await getPerson(caller.supabase, findings.personId);
	if (person === null) return noSuchPerson;
	const companies = await getCompaniesForPerson(caller.supabase, person.id);
	const newLinkCount = await savePersonFindings(caller.supabase, findings, person.name, companies, caller.accountId);
	const kept = `${newLinkCount} new link(s) kept, the summary saved as a "${personNoteTitles.research}" note`;
	return `${person.name}'s research is saved — ${kept}, and the research recorded on ${companies.length} company(ies).`;
}
