import { carryReviewsForward } from '$lib/server/companyContext/carryReviewsForward';
import { contextChanges } from '$lib/data/companyContext/contextChanges';
import { readLatestCompanyContext, readVersionBefore } from '$lib/server/companyContext/readLatestCompanyContext';
import { recordCompanyContext } from '$lib/server/companyContext/recordCompanyContext';
import { validateCompanyContext } from '$lib/server/companyContext/validateCompanyContext';
import { isRefused } from '$lib/server/companyContext/contextText';
import { objectSchema } from '../actionTypes';
import { companyContextFields } from './companyContextFields';
import { contextOrganisation } from './contextOrganisation';
import { conceptsNotSpecimens } from '$lib/data/companyContext/companyContextWords';
import { describeCompanyContext, noCompanyContextYet } from './describeCompanyContext';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const companyContextActions: McpAction[] = [
	{
		name: 'record_company_context',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary:
			"record a whole new version of an organisation's company context: its parts, links, what is connected and its stage",
		guidance:
			'Each call adds the next numbered version and never changes one already kept, so give everything the ' +
			'context holds, not only what changed: read_company_context first and carry every part forward with its ' +
			"key. Leave reviewState out unless the client told you in this chat: the client's own review of every " +
			'part you leave unchanged is kept by itself, and a part you change goes back to not checked so they ' +
			`check it again on the map. ${conceptsNotSpecimens} Every value is checked against its limit and refused, never cut.`,
		inputSchema: objectSchema({ organisationId: organisationIdField, ...companyContextFields }, [
			'organisationId',
			'stage'
		]),
		run: async (caller, input) => recordContext(caller, input)
	},
	{
		name: 'read_company_context',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read the latest version of an organisation's company context, with every part's review state, what is connected, the stage and what changed since the version before",
		guidance:
			'An organisation starts with no version: its first run records version 1. The client marks each part ' +
			'right or not right on the map in their portal; the parts marked not right come first, in their words, ' +
			'for you to put right in a revised version.',
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => readContext(caller, input)
	}
];

async function recordContext(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const given = validateCompanyContext(input);
	if (isRefused(given)) return given.refusal;
	const earlier = await readLatestCompanyContext(caller.supabase, organisation.id);
	const { draft, keptReviewCount } = carryReviewsForward(given, earlier);
	const recording = {
		organisationId: organisation.id,
		recordedBy: caller.accountId,
		draft
	};
	const versionNumber = await recordCompanyContext(caller.supabase, recording);
	const { parts, links } = draft;
	const recorded = `Recorded version ${versionNumber} of ${organisation.name}'s company context: ${parts.length} parts and ${links.length} links.`;
	if (keptReviewCount === 0) return recorded;
	return `${recorded} Kept the client's review of ${keptReviewCount} unchanged parts.`;
}

async function readContext(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const context = await readLatestCompanyContext(caller.supabase, organisation.id);
	if (context === null) return noCompanyContextYet(organisation.name);
	const earlier = await readVersionBefore(caller.supabase, organisation.id, context);
	const changes = earlier === null ? null : contextChanges(earlier, context);
	return describeCompanyContext(organisation.name, context, changes);
}
