import { getClient } from '$lib/server/clients/getClient';
import { validateRecordId } from '$lib/data/isUuid';
import { fileLeadQuote } from '$lib/server/leadQuotes/fileLeadQuote';
import { listLeadQuoteVersions, readLeadQuote } from '$lib/server/leadQuotes/readLeadQuote';
import { validateLeadQuote } from '$lib/server/leadQuotes/validateLeadQuote';
import { describeLeadQuote, noQuoteFiled } from './describeLeadQuote';
import { noSuchClient } from './describeClient';
import { leadQuoteFields, leadQuoteVersionField } from './leadQuoteFields';
import { objectSchema, readText } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const leadQuoteGuidance =
	'A quote is the plan going forwards for a lead, a stage at a time, each with what it delivers, when and its fee. ' +
	"Every figure comes from the rates sheet (the page Rate card in Your Business Today's own Your Business Brain) or " +
	'from the person, never from you: a stage not priced yet has no feeAmount and a feeNote such as "Priced before it starts". ' +
	'Each filing is the next numbered version and never changes one already filed, so give the whole quote each time: ' +
	"read_lead_quote first and carry every line forward. File it on the person's yes. Every value is checked against its limit and refused, never cut.";

const versionRefusal = 'The version is a whole number from 1, as read_lead_quote lists them; leave it out for the latest.';

export const leadQuoteActions: McpAction[] = [
	{
		name: 'file_lead_quote',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "file a whole new version of a lead's quote: the plan going forwards a stage at a time, each with what it delivers, when and its fee, with the introduction and the terms",
		guidance: leadQuoteGuidance,
		inputSchema: objectSchema(leadQuoteFields, ['clientId', 'title', 'preparedOn', 'lines']),
		run: async (caller, input) => fileQuote(caller, input)
	},
	{
		name: 'read_lead_quote',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: "read a lead's quote, the latest version or one named, with every line and its fee, the totals, the terms and the versions filed",
		guidance: 'A lead starts with no quote: its first filing is version 1. The page /leads/<clientId>/quote shows the latest to the lead.',
		inputSchema: objectSchema({ clientId: leadQuoteFields.clientId, version: leadQuoteVersionField }, ['clientId']),
		run: async (caller, input) => readQuote(caller, input)
	}
];

async function fileQuote(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const quote = validateLeadQuote(input);
	if (typeof quote === 'string') return quote;
	const client = await getClient(caller.supabase, quote.clientId);
	if (client === null) return noSuchClient;
	const version = await fileLeadQuote(caller.supabase, quote, caller.accountId);
	const { lines } = quote;
	return `Filed version ${version} of the quote for ${client.name}: ${quote.title}, ${lines.length} line(s). read_lead_quote reads it back.`;
}

async function readQuote(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const version = readVersion(input.version);
	if (version === undefined) return versionRefusal;
	const clientId = readText(input, 'clientId');
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const [quote, versions] = await Promise.all([
		readLeadQuote(caller.supabase, client.id, version),
		listLeadQuoteVersions(caller.supabase, client.id)
	]);
	if (quote === null) return version === null ? `${client.name}: ${noQuoteFiled}` : `${client.name} has no version ${version}.`;
	return describeLeadQuote(client.name, quote, versions);
}

/** The version asked for, null for the latest, or undefined when what was given is not a version number. */
function readVersion(given: unknown): number | null | undefined {
	if (given === undefined || given === null || given === '') return null;
	const version = Number(given);
	const isVersionNumber = Number.isInteger(version) && version >= 1;
	return isVersionNumber ? version : undefined;
}
