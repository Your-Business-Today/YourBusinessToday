import { describeJobAdverts } from './describeJobAdverts';
import { getClient } from '$lib/server/clients/getClient';
import { getJobAdvertsForClient } from '$lib/server/jobAdverts/getJobAdvertsForClient';
import { jobAdvertLimits } from '$lib/data/jobAdvertRules';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import { saveJobAdverts } from '$lib/server/jobAdverts/saveJobAdverts';
import { saveJobAdvertsGuidance, whyAdvertsMatter } from './jobAdvertGuidance';
import { validateJobAdvertsFound } from '$lib/server/jobAdverts/validateJobAdvertsFound';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const clientIdField = textField('The client id, as list_clients gives it');

const advertSchema = objectSchema(
	{
		title: textField(`The job title as the advert gives it, at most ${jobAdvertLimits.longestTitle} characters`),
		url: textField("The advert's own page on the job board"),
		postedOn: textField('The date the page says it was posted, as YYYY-MM-DD; leave it out when the page shows none')
	},
	['title', 'url']
);

const advertsFoundSchema = objectSchema(
	{
		clientId: clientIdField,
		adverts: { type: 'array', items: advertSchema, description: `Each advert found, once; at most ${jobAdvertLimits.mostAdverts}` }
	},
	['clientId', 'adverts']
);

export const jobAdvertActions: McpAction[] = [
	{
		name: 'read_company_job_adverts',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'the job adverts kept on one company on the clients register, each with its board page, its posted date when shown, when it was found, and whether it is a role our software replaces or amplifies',
		guidance: `${whyAdvertsMatter} This reads what staff Claudes have saved and searches nothing; to look again, search the job boards yourself and save with save_company_job_adverts.`,
		inputSchema: objectSchema({ clientId: clientIdField }, ['clientId']),
		run: async (caller, input) => readKeptAdverts(caller, readText(input, 'clientId'))
	},
	{
		name: 'save_company_job_adverts',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "save the job adverts you found on the UK job boards for a company on the clients register, so staff see them on the company's page",
		guidance: saveJobAdvertsGuidance,
		inputSchema: advertsFoundSchema,
		run: async (caller, input) => saveAdvertsOnClient(caller, input)
	}
];

async function readKeptAdverts(caller: McpCaller, clientId: string): Promise<string> {
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const adverts = await getJobAdvertsForClient(caller.supabase, client.id);
	return describeJobAdverts({ companyName: client.name, adverts });
}

async function saveAdvertsOnClient(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const found = validateJobAdvertsFound(input);
	if (typeof found === 'string') return found;
	const client = await getClient(caller.supabase, found.clientId);
	if (client === null) return noSuchClient;
	const { newCount, alreadyKeptCount } = await saveJobAdverts(caller.supabase, found, caller.accountId);
	return `${newCount} new advert(s) kept on ${client.name}; ${alreadyKeptCount} were already kept and left as they were.`;
}
